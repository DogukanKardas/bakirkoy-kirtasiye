"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { HoursException, Settings } from "@db/queries";
import { saveSettingsAction } from "@/lib/actions/settings";
import { getOpenState } from "@/lib/shop-hours";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { ImageUpload } from "./image-upload";
import {
  AButton,
  ACard,
  AConfirm,
  AInput,
  ATabs,
  ATextarea,
  AToggle,
} from "./ui";

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Pazartesi" },
  { key: "tue", label: "Salı" },
  { key: "wed", label: "Çarşamba" },
  { key: "thu", label: "Perşembe" },
  { key: "fri", label: "Cuma" },
  { key: "sat", label: "Cumartesi" },
  { key: "sun", label: "Pazar" },
];

/* WCAG göreli parlaklık + kontrast oranı */
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function normalizeWhatsapp(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && digits.startsWith("5")) digits = "90" + digits;
  return digits;
}

async function generateFavicon(logoUrl: string): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = logoUrl;
    });
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const scale = Math.min(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return null;
    const supabase = getBrowserSupabase();
    const path = "brand/favicon.png";
    const { error } = await supabase.storage
      .from("images")
      .upload(path, blob, { upsert: true, contentType: "image/png" });
    if (error) return null;
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(path);
    return `${publicUrl}?v=${Date.now()}`;
  } catch {
    return null;
  }
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState("marka");
  const [s, setS] = useState<Settings>(settings);
  const [autoFavicon, setAutoFavicon] = useState(true);
  const [confirmCommerce, setConfirmCommerce] = useState(false);
  const [confirmPrices, setConfirmPrices] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const waNormalized = normalizeWhatsapp(s.whatsapp);
  const waValid = !s.whatsapp || waNormalized.length >= 12;

  const contrast = useMemo(
    () => contrastRatio(s.accentColor, "#151515"),
    [s.accentColor],
  );
  const contrastWarn = contrast < 2.4;

  const openState = useMemo(
    () => getOpenState(s.hours, s.hoursExceptions),
    [s.hours, s.hoursExceptions],
  );

  const save = () => {
    if (!waValid) {
      toast.error("WhatsApp numarası geçersiz");
      setTab("iletisim");
      return;
    }
    startTransition(async () => {
      let faviconUrl = s.faviconUrl;
      if (autoFavicon && s.logoUrl) {
        const generated = await generateFavicon(s.logoUrl);
        if (generated) faviconUrl = generated;
      }
      const res = await saveSettingsAction({
        ...s,
        whatsapp: waNormalized || s.whatsapp,
        faviconUrl,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Ayarlar kaydedildi — tüm sitede anında yayında");
        router.refresh();
      }
    });
  };

  const tabs = [
    { key: "marka", label: "Marka" },
    { key: "iletisim", label: "İletişim" },
    { key: "saatler", label: "Çalışma Saatleri" },
    { key: "sosyal", label: "Sosyal & Duyuru" },
    { key: "satis", label: "Satış" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Ayarlar
        </h1>
        <AButton onClick={save} disabled={pending}>
          {pending ? "Kaydediliyor…" : "Tümünü Kaydet"}
        </AButton>
      </div>

      <ATabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "marka" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Kimlik</h2>
            <AInput
              label="Dükkân Adı"
              value={s.shopName}
              onChange={(e) => set("shopName", e.target.value)}
            />
            <AInput
              label="Slogan"
              value={s.slogan}
              onChange={(e) => set("slogan", e.target.value)}
            />
            <div>
              <p className="mb-1 text-sm text-[var(--ink-soft)]">
                Logo (açık zemin — SVG veya PNG)
              </p>
              <ImageUpload
                value={s.logoUrl ? [s.logoUrl] : []}
                onChange={(u) => set("logoUrl", u[0] ?? "")}
                folder="brand"
              />
            </div>
            <div>
              <p className="mb-1 text-sm text-[var(--ink-soft)]">
                Logo (koyu zemin — ops.)
              </p>
              <ImageUpload
                value={s.logoDarkUrl ? [s.logoDarkUrl] : []}
                onChange={(u) => set("logoDarkUrl", u[0] ?? "")}
                folder="brand"
              />
            </div>
            <AToggle
              checked={autoFavicon}
              onChange={setAutoFavicon}
              label="Favicon'u logodan otomatik üret"
            />
            <div>
              <p className="mb-1 text-sm text-[var(--ink-soft)]">
                Varsayılan paylaşım (OG) görseli
              </p>
              <ImageUpload
                value={s.ogImageUrl ? [s.ogImageUrl] : []}
                onChange={(u) => set("ogImageUrl", u[0] ?? "")}
                folder="brand"
              />
            </div>
            <p className="text-xs text-[var(--ink-muted)]">
              Not: SVG logo yüklerseniz açılış animasyonu logonun
              çizgilerini çizer; PNG&apos;de logo maskeyle belirir.
            </p>
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Renkler</h2>
            <div className="flex items-end gap-3">
              <AInput
                label="Vurgu Rengi"
                value={s.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className="font-[family-name:var(--font-mono)]"
              />
              <input
                type="color"
                value={s.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-[var(--line)]"
                aria-label="Vurgu rengi seçici"
              />
            </div>
            <div className="flex items-end gap-3">
              <AInput
                label="İkincil Renk (tükenmez mavisi)"
                value={s.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="font-[family-name:var(--font-mono)]"
              />
              <input
                type="color"
                value={s.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-[var(--line)]"
                aria-label="İkincil renk seçici"
              />
            </div>

            <div className="rounded-md border border-[var(--line)] p-4">
              <p className="text-xs text-[var(--ink-muted)]">Canlı önizleme</p>
              <p className="mt-2 text-sm">
                Bu bir metin örneği;{" "}
                <span
                  className="px-1 font-medium"
                  style={{ background: s.accentColor }}
                >
                  vurgulanmış kısım
                </span>{" "}
                böyle görünür.
              </p>
              <button
                type="button"
                className="mt-3 rounded-md px-4 py-2 text-sm font-medium text-white"
                style={{ background: s.secondaryColor }}
              >
                İkincil buton örneği
              </button>
            </div>

            {contrastWarn && (
              <p className="rounded-md border border-amber-500 bg-amber-50 p-2.5 text-sm text-amber-900">
                ⚠ Kontrast uyarısı: vurgu rengi üzerindeki koyu metin zor
                okunabilir (oran {contrast.toFixed(2)}). Daha açık bir renk
                önerilir.
              </p>
            )}
          </ACard>
        </div>
      )}

      {tab === "iletisim" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">İletişim Bilgileri</h2>
            <AInput
              label="Telefon"
              value={s.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <div>
              <AInput
                label={`WhatsApp ${s.whatsapp ? (waValid ? `(wa.me/${waNormalized})` : "(geçersiz!)") : ""}`}
                value={s.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="05xx xxx xx xx"
              />
              {!waValid && (
                <p className="mt-1 text-xs text-red-600">
                  Geçerli bir numara girin (örn. 0532 111 22 33)
                </p>
              )}
              {waValid && waNormalized && (
                <a
                  href={`https://wa.me/${waNormalized}?text=${encodeURIComponent("Merhaba, bu bir test mesajıdır.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-sm text-emerald-700 underline underline-offset-2"
                >
                  Test mesajı gönder ↗
                </a>
              )}
            </div>
            <AInput
              label="E-posta"
              type="email"
              value={s.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </ACard>
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Adres & Harita</h2>
            <ATextarea
              label="Adres"
              rows={2}
              value={s.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AInput
                label="İlçe"
                value={s.district}
                onChange={(e) => set("district", e.target.value)}
              />
              <AInput
                label="Şehir"
                value={s.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <AInput
              label="Google Maps Embed URL"
              placeholder="https://www.google.com/maps/embed?pb=…"
              value={s.mapEmbedUrl}
              onChange={(e) => set("mapEmbedUrl", e.target.value)}
            />
            {s.mapEmbedUrl ? (
              <iframe
                src={s.mapEmbedUrl}
                title="Harita önizleme"
                className="h-48 w-full rounded-md border border-[var(--line)]"
                loading="lazy"
              />
            ) : (
              <p className="text-xs text-[var(--ink-muted)]">
                Embed URL girince harita önizlemesi burada görünür. Google
                Haritalar&apos;da &quot;Paylaş → Harita yerleştir&quot;
                bağlantısını kullanın.
              </p>
            )}
          </ACard>
        </div>
      )}

      {tab === "saatler" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ACard className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Haftalık Program</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${openState.open ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
              >
                {openState.open ? "Şu an açık" : "Şu an kapalı"} •{" "}
                {openState.todayLabel}
              </span>
            </div>
            {DAYS.map(({ key, label }) => {
              const day = s.hours[key] ?? null;
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2"
                >
                  <span className="w-24 text-sm font-medium">{label}</span>
                  <AToggle
                    checked={!!day}
                    onChange={(v) =>
                      set("hours", {
                        ...s.hours,
                        [key]: v ? { open: "09:00", close: "19:00" } : null,
                      })
                    }
                    label={day ? "Açık" : "Kapalı"}
                  />
                  {day && (
                    <span className="ml-auto flex items-center gap-1.5">
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) =>
                          set("hours", {
                            ...s.hours,
                            [key]: { ...day, open: e.target.value },
                          })
                        }
                        className="rounded border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm"
                        aria-label={`${label} açılış`}
                      />
                      <span className="text-sm text-[var(--ink-muted)]">–</span>
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) =>
                          set("hours", {
                            ...s.hours,
                            [key]: { ...day, close: e.target.value },
                          })
                        }
                        className="rounded border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm"
                        aria-label={`${label} kapanış`}
                      />
                    </span>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-[var(--ink-muted)]">
              Öğle arası gerekiyorsa ilgili günü ikiye bölmek yerine kapanışı
              erken çekip istisna ekleyebilirsiniz; &quot;şu an açık&quot;
              rozeti İstanbul saat dilimiyle hesaplanır.
            </p>
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Özel Günler / İstisnalar</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Bayram, okul açılışı gibi tarihlerde haftalık programı ezer.
            </p>
            {s.hoursExceptions.map((ex, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2"
              >
                <input
                  type="date"
                  value={ex.date}
                  onChange={(e) =>
                    set(
                      "hoursExceptions",
                      s.hoursExceptions.map((x, j) =>
                        j === i ? { ...x, date: e.target.value } : x,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm"
                  aria-label="Tarih"
                />
                <input
                  value={ex.label}
                  placeholder="Etiket (örn. Bayram)"
                  onChange={(e) =>
                    set(
                      "hoursExceptions",
                      s.hoursExceptions.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                  className="min-w-28 flex-1 rounded border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm"
                />
                <AToggle
                  checked={ex.closed}
                  onChange={(v) =>
                    set(
                      "hoursExceptions",
                      s.hoursExceptions.map((x, j) =>
                        j === i ? { ...x, closed: v } : x,
                      ),
                    )
                  }
                  label={ex.closed ? "Kapalı" : "Özel saat"}
                />
                {!ex.closed && (
                  <span className="flex items-center gap-1">
                    <input
                      type="time"
                      value={ex.open ?? "09:00"}
                      onChange={(e) =>
                        set(
                          "hoursExceptions",
                          s.hoursExceptions.map((x, j) =>
                            j === i ? { ...x, open: e.target.value } : x,
                          ),
                        )
                      }
                      className="rounded border border-[var(--line)] bg-[var(--paper)] px-1.5 py-1 text-sm"
                      aria-label="Açılış"
                    />
                    <span className="text-xs">–</span>
                    <input
                      type="time"
                      value={ex.close ?? "19:00"}
                      onChange={(e) =>
                        set(
                          "hoursExceptions",
                          s.hoursExceptions.map((x, j) =>
                            j === i ? { ...x, close: e.target.value } : x,
                          ),
                        )
                      }
                      className="rounded border border-[var(--line)] bg-[var(--paper)] px-1.5 py-1 text-sm"
                      aria-label="Kapanış"
                    />
                  </span>
                )}
                <button
                  onClick={() =>
                    set(
                      "hoursExceptions",
                      s.hoursExceptions.filter((_, j) => j !== i),
                    )
                  }
                  className="text-red-600"
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            ))}
            <AButton
              variant="outline"
              onClick={() =>
                set("hoursExceptions", [
                  ...s.hoursExceptions,
                  {
                    date: new Date().toISOString().slice(0, 10),
                    label: "",
                    closed: true,
                  } satisfies HoursException,
                ])
              }
            >
              + İstisna Ekle
            </AButton>
          </ACard>
        </div>
      )}

      {tab === "sosyal" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Sosyal Medya</h2>
            <AInput
              label="Instagram URL"
              value={s.instagramUrl}
              onChange={(e) => set("instagramUrl", e.target.value)}
            />
            <AInput
              label="Facebook URL"
              value={s.facebookUrl}
              onChange={(e) => set("facebookUrl", e.target.value)}
            />
          </ACard>
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Duyuru Şeridi</h2>
            <AToggle
              checked={s.announcementEnabled}
              onChange={(v) => set("announcementEnabled", v)}
              label="Sitede göster"
            />
            <ATextarea
              label="Duyuru Metni"
              rows={2}
              placeholder="Örn: Okul sezonu indirimleri başladı!"
              value={s.announcementText}
              onChange={(e) => set("announcementText", e.target.value)}
            />
            {s.announcementEnabled && s.announcementText && (
              <div
                className="rounded px-3 py-1.5 text-center text-xs font-medium"
                style={{ background: s.accentColor }}
              >
                {s.announcementText}
              </div>
            )}
          </ACard>
        </div>
      )}

      {tab === "satis" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Fiyat Gösterimi</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Kapalıyken ürünlerde &quot;Fiyat için dükkâna sorun&quot; yazar.
            </p>
            <AToggle
              checked={s.showPrices}
              onChange={(v) => {
                if (v) setConfirmPrices(true);
                else set("showPrices", false);
              }}
              label="Fiyatları göster"
            />
          </ACard>
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">E-Ticaret</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Açıkken sepet ve ödeme sayfaları aktif olur; &quot;Listeme
              Ekle&quot; yerini &quot;Sepete Ekle&quot; alır. Altyapı hazırdır
              ama ödeme sağlayıcı bağlantısı ayrıca yapılmalıdır.
            </p>
            <AToggle
              checked={s.commerceEnabled}
              onChange={(v) => {
                if (v) setConfirmCommerce(true);
                else set("commerceEnabled", false);
              }}
              label="E-ticareti etkinleştir"
            />
          </ACard>
        </div>
      )}

      <div className="flex justify-end border-t border-[var(--line)] pt-4">
        <AButton onClick={save} disabled={pending}>
          {pending ? "Kaydediliyor…" : "Tümünü Kaydet"}
        </AButton>
      </div>

      <AConfirm
        open={confirmPrices}
        onClose={() => setConfirmPrices(false)}
        onConfirm={() => set("showPrices", true)}
        title="Fiyatlar gösterilsin mi?"
        body="Tüm ürün fiyatları sitede herkese görünür olacak. Kaydetmeyi unutmayın."
        confirmLabel="Evet, göster"
      />
      <AConfirm
        open={confirmCommerce}
        onClose={() => setConfirmCommerce(false)}
        onConfirm={() => set("commerceEnabled", true)}
        title="E-ticaret açılsın mı?"
        body="Sepet ve ödeme sayfaları herkese açılacak. Ödeme sağlayıcı yapılandırması tamamlanmadıysa siparişler yalnızca kayıt olarak düşer. Kaydetmeyi unutmayın."
        confirmLabel="Evet, aç"
      />
    </div>
  );
}
