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
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3"
          aria-label={`${settings.shopName} ana sayfa`}
        >
          <BrandLogo
            src={settings.logoUrl}
            alt={settings.shopName}
            height={44}
            priority
            className="max-h-11 w-auto max-w-[min(52vw,200px)] sm:max-w-[240px]"
          />
        </Link>

        <div className="hidden min-w-0 items-center gap-2 text-xs text-[var(--ink-muted)] md:flex">
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${openState.open ? "bg-emerald-600" : "bg-red-700"}`}
            aria-hidden
          />
          <span className="truncate">
            {openState.open ? "Şu an açık" : "Şu an kapalı"}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{openState.todayLabel}</span>
        </div>

        <nav className="flex shrink-0 items-center gap-3 text-sm font-medium text-[var(--ink-soft)] sm:gap-5">
          <Magnetic strength={0.25} className="hidden sm:inline-block">
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
          {settings.commerceEnabled ? (
            <CartDrawerButton />
          ) : (
            <span className="hidden sm:inline-flex">
              <ListCountLink />
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
