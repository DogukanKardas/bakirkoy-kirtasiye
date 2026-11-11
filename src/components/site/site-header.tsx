"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Settings } from "@db/queries";
import { getOpenState } from "@/lib/shop-hours";
import { BrandLogo } from "./brand-logo";
import { ListCountLink } from "./nav-count-links";
import { CartDrawerButton } from "./cart-drawer";
import { SearchTrigger } from "./search-trigger";
import { Magnetic } from "./chrome/magnetic";

const NAV = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export function SiteHeader({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const openState = getOpenState(settings.hours, settings.hoursExceptions);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) {
        setHidden(false);
        lastY.current = window.scrollY;
        return;
      }
      const y = window.scrollY;
      if (y < 32) {
        setHidden(false);
      } else if (y > lastY.current + 8) {
        setHidden(true);
      } else if (y < lastY.current - 8) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
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

        {/* Masaüstü nav */}
        <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium text-[var(--ink-soft)] lg:flex">
          {NAV.map((item) => (
            <Magnetic key={item.href} strength={0.25}>
              <Link
                href={item.href}
                className="transition hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            </Magnetic>
          ))}
          <SearchTrigger />
          {settings.commerceEnabled ? <CartDrawerButton /> : <ListCountLink />}
        </nav>

        {/* Mobil: sadece ara ikonu + menü */}
        <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
          <SearchTrigger />
          <button
            type="button"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center text-[var(--ink)]"
          >
            <span className="sr-only">Menü</span>
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--line)] bg-[var(--paper)] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[var(--line)] py-3.5 text-base font-medium text-[var(--ink)] last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
            {settings.commerceEnabled ? (
              <div className="py-3">
                <CartDrawerButton />
              </div>
            ) : (
              <Link
                href="/liste"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-base font-medium text-[var(--ink)]"
              >
                Listem
              </Link>
            )}
            <p className="pb-2 pt-1 text-xs text-[var(--ink-muted)]">
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${openState.open ? "bg-emerald-600" : "bg-red-700"}`}
                aria-hidden
              />
              {openState.open ? "Şu an açık" : "Şu an kapalı"}
              {" · "}
              {openState.todayLabel}
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
