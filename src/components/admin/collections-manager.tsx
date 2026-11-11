"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Collection } from "@db/queries";
import type { AdminProduct } from "@db/admin-queries";
import {
  deleteCollectionAction,
  setCollectionProductsAction,
  upsertCollectionAction,
} from "@/lib/actions/collections";
import { ABadge, AButton, ACard, AConfirm, AEmpty, AInput, AModal, ATextarea } from "./ui";
import { ImageUpload } from "./image-upload";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusOf(c: Collection): { label: string; tone: "green" | "yellow" | "neutral" } {
  const now = Date.now();
  const start = c.startsAt ? Date.parse(c.startsAt) : null;
  const end = c.endsAt ? Date.parse(c.endsAt) : null;
  if (end && end < now) return { label: "Süresi doldu", tone: "neutral" };
  if (start && start > now) return { label: "Planlandı", tone: "yellow" };
  return { label: "Yayında", tone: "green" };
}

function ProductPicker({
  products,
  selected,
  onChange,
}: {
  products: AdminProduct[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr");
    if (!term) return [];
    return products
      .filter(
        (p) =>
          p.name.toLocaleLowerCase("tr").includes(term) ||
          p.sku.toLocaleLowerCase("tr").includes(term),
      )
      .slice(0, 8);
  }, [q, products]);

  const selectedProducts = selected
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is AdminProduct => Boolean(p));

  return (
    <div className="space-y-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ürün ara: ad veya SKU…"
        className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
      />
      {results.length > 0 && (
        <ul className="rounded-md border border-[var(--line)] bg-[var(--paper)]">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={selected.includes(p.id)}
                onClick={() => {
                  onChange([...selected, p.id]);
                  setQ("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-[var(--paper-deep)] disabled:opacity-40"
              >
                <span className="truncate">{p.name}</span>
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                  {selected.includes(p.id) ? "ekli" : "+ ekle"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedProducts.length > 0 && (
        <ul className="space-y-1">
          {selectedProducts.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-md bg-[var(--paper-deep)] px-2.5 py-1.5 text-sm"
            >
              <span className="text-xs text-[var(--ink-muted)]">{i + 1}.</span>
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <button
                type="button"
                onClick={() =>
                  i > 0 &&
                  onChange(
                    selected.map((id, j) =>
                      j === i ? selected[i - 1] : j === i - 1 ? selected[i] : id,
                    ),
                  )
                }
                className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
                title="Yukarı taşı"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onChange(selected.filter((id) => id !== p.id))}
                className="text-red-600"
                title="Kaldır"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CollectionsManager({
  collections,
  products,
}: {
  collections: Collection[];
  products: AdminProduct[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Collection | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isSchoolList, setIsSchoolList] = useState(false);
  const [productIds, setProductIds] = useState<string[]>([]);

  const openEdit = (c: Collection | "new") => {
    setEditTarget(c);
    setName(c === "new" ? "" : c.name);
    setDescription(c === "new" ? "" : c.description);
    setImageUrl(c === "new" ? [] : c.imageUrl ? [c.imageUrl] : []);
    setStartsAt(c === "new" ? "" : toLocalInput(c.startsAt));
    setEndsAt(c === "new" ? "" : toLocalInput(c.endsAt));
    setIsSchoolList(c === "new" ? false : c.isSchoolList);
    setProductIds(c === "new" ? [] : c.productIds);
  };

  const save = () => {
    if (name.trim().length < 2) {
      toast.error("Koleksiyon adı gerekli");
      return;
    }
    startTransition(async () => {
      const res = await upsertCollectionAction({
        id: editTarget === "new" ? undefined : (editTarget as Collection).id,
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl[0] ?? "",
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        isSchoolList,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      const setRes = await setCollectionProductsAction({
        collectionId: res.id,
        productIds,
      });
      if ("error" in setRes) {
        toast.error(setRes.error);
        return;
      }
      toast.success("Koleksiyon kaydedildi");
      setEditTarget(null);
      router.refresh();
    });
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteCollectionAction(deleteTarget.id);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Koleksiyon silindi");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Koleksiyonlar
        </h1>
        <AButton onClick={() => openEdit("new")}>Yeni Koleksiyon</AButton>
      </div>

      {collections.length === 0 ? (
        <AEmpty>
          Henüz koleksiyon yok. &quot;Okula Dönüş&quot; gibi temalı ürün
          grupları oluşturun.
        </AEmpty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const s = statusOf(c);
            return (
              <ACard key={c.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{c.name}</h2>
                  <ABadge tone={s.tone}>{s.label}</ABadge>
                </div>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-soft)]">
                    {c.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {c.productIds.length} ürün
                  {c.startsAt &&
                    ` • ${new Date(c.startsAt).toLocaleDateString("tr-TR")}`}
                  {c.endsAt &&
                    ` → ${new Date(c.endsAt).toLocaleDateString("tr-TR")}`}
                </p>
                <div className="mt-3 flex gap-1">
                  <AButton variant="ghost" onClick={() => openEdit(c)}>
                    Düzenle
                  </AButton>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </ACard>
            );
          })}
        </div>
      )}

      <AModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget === "new" ? "Yeni Koleksiyon" : "Koleksiyonu Düzenle"}
        wide
      >
        <div className="space-y-3">
          <AInput
            label="Koleksiyon Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <ATextarea
            label="Hikâye metni (paragraflar boş satırla ayrılır)"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <p className="mb-1 text-sm text-[var(--ink-soft)]">Kapak görseli</p>
            <ImageUpload
              value={imageUrl}
              onChange={(urls) => setImageUrl(urls.slice(-1))}
              folder="collections"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AInput
              label="Yayın Başlangıcı (ops.)"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <AInput
              label="Yayın Bitişi (ops.)"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={isSchoolList}
              onChange={(e) => setIsSchoolList(e.target.checked)}
              className="h-4 w-4 accent-[var(--ink)]"
            />
            <span>
              <span className="font-medium">Okul listesi olarak göster</span>
              <span className="block text-xs text-[var(--ink-muted)]">
                /liste sayfasında &ldquo;tek tıkla ekle&rdquo; kartı olarak çıkar;
                yayın tarihi gerekmez.
              </span>
            </span>
          </label>
          <div>
            <p className="mb-1 text-sm text-[var(--ink-soft)]">
              Koleksiyondaki Ürünler
            </p>
            <ProductPicker
              products={products}
              selected={productIds}
              onChange={setProductIds}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AButton variant="ghost" onClick={() => setEditTarget(null)}>
              Vazgeç
            </AButton>
            <AButton onClick={save} disabled={pending}>
              Kaydet
            </AButton>
          </div>
        </div>
      </AModal>

      <AConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Koleksiyon silinsin mi?"
        body={`"${deleteTarget?.name}" silinecek; ürünler silinmez.`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
