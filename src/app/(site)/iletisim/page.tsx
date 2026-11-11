import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@db/queries";
import { getOpenState, DAYS_ORDER, DAY_LABELS } from "@/lib/shop-hours";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Bakırköy Kırtasiye iletişim: adres, çalışma saatleri, WhatsApp hattı ve mesaj formu.",
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const openState = getOpenState(settings.hours, settings.hoursExceptions);
  const mapsQuery = encodeURIComponent(
    `${settings.address} ${settings.district} ${settings.city}`,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        İletişim
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">Dükkâna ulaşın</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* sol: harita + adres + saatler */}
        <div className="space-y-8">
          <div>
            {settings.mapEmbedUrl ? (
              <iframe
                src={settings.mapEmbedUrl}
                title="Dükkân konumu"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full border border-[var(--line)] grayscale-[35%]"
              />
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 border border-dashed border-[var(--ink-muted)] bg-[var(--paper-deep)]/40 transition hover:bg-[var(--accent)]/20"
              >
                <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Haritada aç →
                </span>
                <span className="px-6 text-center text-sm text-[var(--ink-soft)]">
                  {settings.address} · {settings.district} / {settings.city}
                </span>
              </a>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Adres
              </h2>
              <p className="mt-2 text-[var(--ink)]">{settings.address}</p>
              <p className="text-[var(--ink-soft)]">
                {settings.district} / {settings.city}
              </p>
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="mt-3 block text-sm font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                >
                  {settings.phone}
                </a>
              ) : null}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-1 block text-sm text-[var(--ink-soft)] underline-offset-4 hover:underline"
                >
                  {settings.email}
                </a>
              ) : null}
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Çalışma saatleri
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${openState.open ? "bg-emerald-600" : "bg-red-700"}`}
                  aria-hidden
                />
                <span className="font-medium text-[var(--ink)]">
                  {openState.open ? "Şu an açığız" : "Şu an kapalıyız"}
                </span>
                <span className="text-[var(--ink-muted)]">
                  · {openState.todayLabel}
                </span>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ink-soft)]">
                {DAYS_ORDER.map((d) => {
                  const h = settings.hours[d];
                  return (
                    <li key={d} className="flex justify-between gap-4">
                      <span>{DAY_LABELS[d]}</span>
                      <span className="font-[family-name:var(--font-mono)] text-xs">
                        {h ? `${h.open}–${h.close}` : "kapalı"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {settings.whatsapp ? (
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Merhaba! Size ulaşmak istiyorum.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 border border-[#25d366] bg-[#25d366]/10 px-5 py-3.5 text-sm font-semibold text-[#128c4a] transition hover:bg-[#25d366]/20"
            >
              WhatsApp&rsquo;tan yazın — genelde dakikalar içinde döneriz
            </a>
          ) : null}
        </div>

        {/* sağ: form */}
        <div>
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Mesaj bırakın
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Soru, öneri ya da özel sipariş — mesajınız dükkân paneline düşer,
            size geri döneriz.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>

          <details className="mt-8 border-t border-[var(--line)] pt-4 text-xs leading-relaxed text-[var(--ink-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--ink-soft)]">
              KVKK aydınlatma metni
            </summary>
            <p className="mt-2">
              Bu form aracılığıyla paylaştığınız ad, iletişim bilgisi ve mesaj
              içeriği; talebinizin yanıtlanması amacıyla 6698 sayılı KVKK
              kapsamında işlenir, üçüncü kişilerle paylaşılmaz ve talebinizin
              sonuçlanmasının ardından makul süre içinde silinir.{" "}
              <Link href="/kvkk" className="underline hover:text-[var(--ink)]">
                Tam aydınlatma metni
              </Link>
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
