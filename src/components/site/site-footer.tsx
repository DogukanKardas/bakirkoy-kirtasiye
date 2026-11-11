import Link from "next/link";
import type { Settings } from "@db/queries";
import { hoursSummary } from "@/lib/shop-hours";
import { BrandLogo } from "./brand-logo";

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo src={settings.logoUrl} alt={settings.shopName} height={44} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
            {settings.slogan}
          </p>
          {settings.phone ? (
            <p className="mt-3 font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
              {settings.phone}
            </p>
          ) : null}
        </div>
        <div className="text-sm text-[var(--ink-soft)]">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Adres
          </p>
          <p className="mt-3 leading-relaxed">
            {settings.address}
            <br />
            {settings.district} / {settings.city}
          </p>
          {settings.email ? <p className="mt-2">{settings.email}</p> : null}
        </div>
        <div className="text-sm text-[var(--ink-soft)]">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Çalışma saatleri
          </p>
          <p className="mt-3 leading-relaxed">{hoursSummary(settings.hours)}</p>
          <div className="mt-4 flex gap-4">
            {settings.instagramUrl ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--ink)]"
              >
                Instagram
              </a>
            ) : null}
            {settings.facebookUrl ? (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--ink)]"
              >
                Facebook
              </a>
            ) : null}
          </div>
        </div>
      </div>
      {/* devasa wordmark: harfler hover'da tek tek yükselir */}
      <div className="overflow-hidden border-t border-[var(--line)]">
        <p className="sr-only">{settings.shopName}</p>
        <div
          aria-hidden
          className="mx-auto w-full max-w-7xl select-none px-4 pb-2 pt-10 sm:px-6"
        >
          <div className="whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(3rem,11.2vw,10.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
            {settings.shopName.split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[0.14em]"
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.shopName}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/urunler" className="hover:text-[var(--ink)]">
              Katalog
            </Link>
            <Link href="/hizmetler" className="hover:text-[var(--ink)]">
              Hizmetler
            </Link>
            <Link href="/hakkimizda" className="hover:text-[var(--ink)]">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:text-[var(--ink)]">
              İletişim
            </Link>
            <Link href="/kvkk" className="hover:text-[var(--ink)]">
              KVKK
            </Link>
            <Link href="/cerez-politikasi" className="hover:text-[var(--ink)]">
              Çerezler
            </Link>
            {settings.commerceEnabled ? (
              <>
                <Link
                  href="/mesafeli-satis-sozlesmesi"
                  className="hover:text-[var(--ink)]"
                >
                  Satış Sözleşmesi
                </Link>
                <Link href="/iade-degisim" className="hover:text-[var(--ink)]">
                  İade & Değişim
                </Link>
              </>
            ) : null}
            <Link href="/admin" className="hover:text-[var(--ink)]">
              Yönetim
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
