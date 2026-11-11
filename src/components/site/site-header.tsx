import Link from "next/link";
import type { Settings } from "@db/queries";
import { getOpenState } from "@/lib/shop-hours";
import { BrandLogo } from "./brand-logo";
import { ListCountLink } from "./nav-count-links";
import { CartDrawerButton } from "./cart-drawer";
import { SearchTrigger } from "./search-trigger";
import { Magnetic } from "./chrome/magnetic";

export function SiteHeader({ settings }: { settings: Settings }) {
  const openState = getOpenState(settings.hours, settings.hoursExceptions);

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm"
      style={{ viewTransitionName: "site-header" }}
    >
      {settings.announcementEnabled && settings.announcementText ? (
        <div className="bg-[var(--accent)] px-4 py-1.5 text-center text-xs font-medium text-[var(--ink)]">
          {settings.announcementText}
        </div>
      ) : null}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${settings.shopName} ana sayfa`}
        >
          <BrandLogo
            src={settings.logoUrl}
            alt={settings.shopName}
            height={40}
            priority
          />
        </Link>

        <div className="hidden items-center gap-2 text-xs text-[var(--ink-muted)] md:flex">
          <span
            className={`inline-block h-2 w-2 rounded-full ${openState.open ? "bg-emerald-600" : "bg-red-700"}`}
            aria-hidden
          />
          <span>{openState.open ? "Şu an açık" : "Şu an kapalı"}</span>
          <span aria-hidden>·</span>
          <span>{openState.todayLabel}</span>
        </div>

        <nav className="flex items-center gap-5 text-sm font-medium text-[var(--ink-soft)]">
          <Magnetic strength={0.25}>
            <Link href="/urunler" className="transition hover:text-[var(--ink)]">
              Ürünler
            </Link>
          </Magnetic>
          <Magnetic strength={0.25} className="hidden lg:inline-block">
            <Link
              href="/hizmetler"
              className="transition hover:text-[var(--ink)]"
            >
              Hizmetler
            </Link>
          </Magnetic>
          <Magnetic strength={0.25} className="hidden lg:inline-block">
            <Link
              href="/iletisim"
              className="transition hover:text-[var(--ink)]"
            >
              İletişim
            </Link>
          </Magnetic>
          <SearchTrigger />
          {settings.commerceEnabled ? <CartDrawerButton /> : <ListCountLink />}
        </nav>
      </div>
    </header>
  );
}
