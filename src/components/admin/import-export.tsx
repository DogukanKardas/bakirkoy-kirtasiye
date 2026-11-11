"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Brand, Category } from "@db/queries";
import type { AdminProduct } from "@db/admin-queries";
import { importProductsAction } from "@/lib/actions/products";
import { ABadge, AButton, ACard } from "./ui";

type TargetField =
  | "name"
  | "sku"
  | "price"
  | "stock"
  | "description"
  | "category_slug"
  | "brand_slug"
  | "active";

const TARGET_FIELDS: { key: TargetField; label: string; required?: boolean }[] =
  [
    { key: "name", label: "Ürün Adı", required: true },
    { key: "sku", label: "SKU", required: true },
    { key: "price", label: "Fiyat (TL)", required: true },
    { key: "stock", label: "Stok" },
    { key: "description", label: "Açıklama" },
    { key: "category_slug", label: "Kategori Slug" },
    { key: "brand_slug", label: "Marka Slug" },
    { key: "active", label: "Yayında (evet/hayır)" },
  ];

const GUESSES: Record<TargetField, string[]> = {
  name: ["ad", "name", "ürün", "urun", "ürün adı", "urun adi", "title"],
  sku: ["sku", "kod", "barkod", "stok kodu", "product code"],
  price: ["fiyat", "price", "tutar", "satış fiyatı", "satis fiyati"],
  stock: ["stok", "stock", "adet", "miktar", "qty", "quantity"],
  description: ["açıklama", "aciklama", "description", "detay"],
  category_slug: ["kategori", "category", "kategori slug", "category_slug"],
  brand_slug: ["marka", "brand", "marka slug", "brand_slug"],
  active: ["yayında", "yayinda", "aktif", "active", "enabled"],
};

type ParsedRow = Record<string, unknown>;

type MappedRow = {
  raw: ParsedRow;
  values: Partial<Record<TargetField, unknown>>;
  errors: string[];
};

function guessMapping(headers: string[]): Record<TargetField, string> {
  const mapping = {} as Record<TargetField, string>;
  for (const field of TARGET_FIELDS) {
    const found = headers.find((h) =>
      GUESSES[field.key].includes(h.trim().toLocaleLowerCase("tr")),
    );
    mapping[field.key] = found ?? "";
  }
  return mapping;
}

function truthy(v: unknown): boolean {
  const s = String(v ?? "").trim().toLocaleLowerCase("tr");
  return !["hayır", "hayir", "no", "false", "0", "pasif", ""].includes(s);
}

export function ImportExportWizard({
  products,
  categories,
  brands,
}: {
  products: AdminProduct[];
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<TargetField, string> | null>(
    null,
  );
  const [mode, setMode] = useState<"insert" | "update_sku" | "upsert">(
    "upsert",
  );
  const [result, setResult] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
  } | null>(null);
  const [fileName, setFileName] = useState("");

  const readFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: "" });
      if (!json.length) {
        toast.error("Dosyada satır bulunamadı");
        return;
      }
      const hdrs = Object.keys(json[0]);
      setHeaders(hdrs);
      setRows(json);
      setMapping(guessMapping(hdrs));
      setFileName(file.name);
      setResult(null);
      setStep(2);
      toast.success(`${json.length} satır okundu`);
    } catch {
      toast.error("Dosya okunamadı — .xlsx, .xls veya .csv yükleyin");
    }
  };

  const mapped: MappedRow[] = useMemo(() => {
    if (!mapping) return [];
    return rows.map((raw) => {
      const values: Partial<Record<TargetField, unknown>> = {};
      for (const f of TARGET_FIELDS) {
        const col = mapping[f.key];
        if (col) values[f.key] = raw[col];
      }
      const errors: string[] = [];
      if (!String(values.name ?? "").trim()) errors.push("ad eksik");
      if (!String(values.sku ?? "").trim()) errors.push("SKU eksik");
      const priceTl = Number(
        String(values.price ?? "").replace(",", ".").replace(/[^\d.,-]/g, ""),
      );
      if (values.price === undefined || values.price === "") {
        errors.push("fiyat eksik");
      } else if (!Number.isFinite(priceTl) || priceTl < 0) {
        errors.push("fiyat geçersiz");
      }
      return { raw, values, errors };
    });
  }, [rows, mapping]);

  const validCount = mapped.filter((m) => m.errors.length === 0).length;

  const doImport = () => {
    const payload = mapped
      .filter((m) => m.errors.length === 0)
      .map((m) => ({
        name: String(m.values.name).trim(),
        sku: String(m.values.sku).trim(),
        price: Math.round(
          Number(
            String(m.values.price).replace(",", ".").replace(/[^\d.,-]/g, ""),
          ) * 100,
        ),
        stock: Math.max(0, Math.round(Number(m.values.stock ?? 0) || 0)),
        description: String(m.values.description ?? ""),
        category_slug: String(m.values.category_slug ?? "")
          .trim()
          .toLocaleLowerCase("tr"),
        brand_slug: String(m.values.brand_slug ?? "")
          .trim()
          .toLocaleLowerCase("tr"),
        active: truthy(m.values.active ?? true),
      }));

    startTransition(async () => {
      const res = await importProductsAction({ rows: payload, mode });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setResult(res);
      toast.success(
        `İçe aktarma tamam: ${res.inserted} eklendi, ${res.updated} güncellendi`,
      );
      router.refresh();
    });
  };

  const exportAll = () => {
    const catById = new Map(categories.map((c) => [c.id, c.slug]));
    const brandById = new Map(brands.map((b) => [b.id, b.slug]));
    const data = products.map((p) => ({
      ad: p.name,
      sku: p.sku,
      "fiyat (TL)": (p.price / 100).toFixed(2),
      stok: p.stock,
      açıklama: p.description.replace(/<[^>]+>/g, "").slice(0, 500),
      kategori: catById.get(p.categoryId) ?? "",
      marka: p.brandId ? (brandById.get(p.brandId) ?? "") : "",
      "yayında": p.active ? "evet" : "hayır",
      görüntülenme: p.views,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
    XLSX.writeFile(wb, "urunler.xlsx");
    toast.success(`${data.length} ürün Excel'e aktarıldı`);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        ad: "Örnek Ürün",
        sku: "ORN-001",
        "fiyat (TL)": "49.90",
        stok: 25,
        açıklama: "Kısa açıklama",
        kategori: categories[0]?.slug ?? "kategori-slug",
        marka: brands[0]?.slug ?? "",
        "yayında": "evet",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Şablon");
    XLSX.writeFile(wb, "urun-sablonu.xlsx");
  };

  return (
    <div className="space-y-5">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        İçe / Dışa Aktar
      </h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <ACard className="p-4">
          <h2 className="font-semibold">Excel&apos;e Dışa Aktar</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Tüm ürünleri ({products.length} adet) .xlsx olarak indirin.
          </p>
          <div className="mt-3 flex gap-2">
            <AButton onClick={exportAll}>Tüm Ürünleri İndir</AButton>
            <AButton variant="outline" onClick={downloadTemplate}>
              Boş Şablon İndir
            </AButton>
          </div>
        </ACard>

        <ACard className="p-4">
          <h2 className="font-semibold">Excel / CSV İçe Aktar</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Adım 1: dosya yükleyin → Adım 2: sütunları eşleştirin → Adım 3:
            önizleyip içe aktarın. Fiyatlar TL olarak yazılmalı.
          </p>
          <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-[var(--line)] p-6 text-center text-sm text-[var(--ink-muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]">
            {fileName || ".xlsx, .xls veya .csv dosyası seçin"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void readFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </ACard>
      </div>

      {step >= 2 && mapping && (
        <ACard className="space-y-3 p-4">
          <h2 className="font-semibold">Adım 2 — Sütun Eşleştirme</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TARGET_FIELDS.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="mb-1 block text-[var(--ink-soft)]">
                  {f.label}
                  {f.required && <span className="text-red-600"> *</span>}
                </span>
                <select
                  value={mapping[f.key]}
                  onChange={(e) =>
                    setMapping({ ...mapping, [f.key]: e.target.value })
                  }
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm"
                >
                  <option value="">— eşleştirme —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <AButton onClick={() => setStep(3)}>Önizlemeye Geç →</AButton>
            <span className="text-sm text-[var(--ink-muted)]">
              {rows.length} satır bulundu
            </span>
          </div>
        </ACard>
      )}

      {step === 3 && (
        <ACard className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Adım 3 — Önizleme ve Hata Raporu</h2>
            <div className="flex gap-2">
              <ABadge tone="green">{validCount} geçerli</ABadge>
              <ABadge tone={mapped.length - validCount > 0 ? "red" : "neutral"}>
                {mapped.length - validCount} hatalı
              </ABadge>
            </div>
          </div>

          <div className="max-h-72 overflow-auto rounded-md border border-[var(--line)]">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0 bg-[var(--paper-deep)]">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs">#</th>
                  <th className="px-2 py-1.5 text-left text-xs">Ad</th>
                  <th className="px-2 py-1.5 text-left text-xs">SKU</th>
                  <th className="px-2 py-1.5 text-left text-xs">Fiyat</th>
                  <th className="px-2 py-1.5 text-left text-xs">Stok</th>
                  <th className="px-2 py-1.5 text-left text-xs">Durum</th>
                </tr>
              </thead>
              <tbody>
                {mapped.slice(0, 100).map((m, i) => (
                  <tr
                    key={i}
                    className={`border-t border-[var(--line)] ${m.errors.length ? "bg-red-50/60" : ""}`}
                  >
                    <td className="px-2 py-1 text-xs text-[var(--ink-muted)]">
                      {i + 1}
                    </td>
                    <td className="max-w-[220px] truncate px-2 py-1">
                      {String(m.values.name ?? "")}
                    </td>
                    <td className="px-2 py-1 font-[family-name:var(--font-mono)] text-xs">
                      {String(m.values.sku ?? "")}
                    </td>
                    <td className="px-2 py-1 font-[family-name:var(--font-mono)] text-xs">
                      {String(m.values.price ?? "")}
                    </td>
                    <td className="px-2 py-1 text-xs">
                      {String(m.values.stock ?? "0")}
                    </td>
                    <td className="px-2 py-1 text-xs">
                      {m.errors.length ? (
                        <span className="text-red-600">
                          {m.errors.join(", ")}
                        </span>
                      ) : (
                        <span className="text-emerald-700">hazır</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mapped.length > 100 && (
              <p className="px-2 py-1.5 text-xs text-[var(--ink-muted)]">
                İlk 100 satır gösteriliyor.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Mevcut SKU bulunursa:</span>
            {(
              [
                ["insert", "Atla (yalnızca yeni ekle)"],
                ["update_sku", "SKU'ya göre güncelle"],
                ["upsert", "Güncelle + yenileri ekle"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] pt-3">
            <AButton
              onClick={doImport}
              disabled={pending || validCount === 0}
            >
              {pending
                ? "İçe aktarılıyor…"
                : `${validCount} Satırı İçe Aktar`}
            </AButton>
            <AButton variant="ghost" onClick={() => setStep(2)}>
              ← Eşleştirmeye Dön
            </AButton>
            {result && (
              <span className="text-sm text-emerald-700">
                Sonuç: {result.inserted} eklendi, {result.updated} güncellendi,{" "}
                {result.skipped} atlandı
              </span>
            )}
          </div>
        </ACard>
      )}
    </div>
  );
}
