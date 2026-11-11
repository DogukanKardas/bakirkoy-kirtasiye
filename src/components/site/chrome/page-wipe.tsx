"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const EASE_IN = [0.7, 0, 0.2, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Kâğıt yaprağı sayfa geçişi: iç link tıklamasında alttan bir yaprak gelip
 * sayfayı örter; yeni sayfa hazır olunca yaprak yukarı çekilir.
 * Reduced-motion'da ve harici/modifiyeli tıklamalarda devre dışı.
 */
export function PageWipe() {
  const pathname = usePathname();
  const [covered, setCovered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = useRef(false);
  const safety = useRef<number | null>(null);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onClick = (e: MouseEvent) => {
      if (reduced.current || e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as HTMLElement).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      if (anchor.closest("[data-morph]")) return; // kart→detay morph kendi geçişini yapar
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const url = new URL(href, window.location.origin);
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return; // hash-only / aynı sayfa
      setCovered(true);
      setLeaving(false);
      if (safety.current) window.clearTimeout(safety.current);
      // navigasyon hiç tamamlanmazsa yaprağı geri çek
      safety.current = window.setTimeout(() => {
        setLeaving(true);
      }, 1100);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (safety.current) window.clearTimeout(safety.current);
    };
  }, []);

  // yeni sayfa geldiğinde yaprağı yukarı çek
  useEffect(() => {
    if (!covered) return;
    if (safety.current) window.clearTimeout(safety.current);
    const t = window.setTimeout(() => setLeaving(true), 180);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setCovered(false);
        setLeaving(false);
      }}
    >
      {covered ? (
        <motion.div
          key="page-wipe"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80]"
          initial={{ y: "102%" }}
          animate={
            leaving
              ? { y: "-102%", transition: { duration: 0.55, ease: EASE_OUT } }
              : { y: "0%", transition: { duration: 0.42, ease: EASE_IN } }
          }
          exit={{ y: "-102%", transition: { duration: 0.4, ease: EASE_OUT } }}
        >
          {/* yaprağın kıvrık kenarı */}
          <div className="absolute -top-6 left-0 right-0 h-8 rounded-[50%_50%_0_0] bg-[var(--paper-deep)]" />
          <div className="absolute inset-0 top-2 flex items-center justify-center border-t-2 border-[var(--ink)] bg-[var(--paper-deep)]">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.4em] text-[var(--ink-muted)]">
              Bakırköy Kırtasiye
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
