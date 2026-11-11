"use client";

import { useEffect, useState } from "react";

/**
 * Anayasa maddesi 1 — PRELOADER:
 * Yalnızca ilk ziyarette (sessionStorage), max 1.8s.
 * SSR ve karar verilene kadar DOM'a hiç girmez → LCP overlay engeli yok.
 */

const SHOWN_KEY = "bk-preloader-shown";
const DRAW_MS = 950;
const FOLD_DELAY = 1150;
const DONE_MS = 1750;

export function Preloader({ shopName }: { shopName: string }) {
  const [phase, setPhase] = useState<"pending" | "active" | "done">("pending");
  const [folding, setFolding] = useState(false);

  useEffect(() => {
    const skip =
      Boolean(sessionStorage.getItem(SHOWN_KEY)) ||
      navigator.webdriver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (skip) {
      sessionStorage.setItem(SHOWN_KEY, "1");
      setPhase("done");
      (window as unknown as { __bkPreloaderDone?: boolean }).__bkPreloaderDone =
        true;
      window.dispatchEvent(new CustomEvent("bk-preloader-done"));
      return;
    }

    setPhase("active");
    document.documentElement.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setFolding(true), FOLD_DELAY);
    const t2 = window.setTimeout(() => {
      sessionStorage.setItem(SHOWN_KEY, "1");
      document.documentElement.style.overflow = "";
      setPhase("done");
      (window as unknown as { __bkPreloaderDone?: boolean }).__bkPreloaderDone =
        true;
      window.dispatchEvent(new CustomEvent("bk-preloader-done"));
    }, DONE_MS);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (phase !== "active") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--paper)]"
      style={{ perspective: "1200px" }}
    >
      <div
        className="flex h-full w-full origin-top flex-col items-center justify-center bg-[var(--paper)] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: folding
            ? "rotateX(-72deg) translateY(-46%) scale(0.98)"
            : "rotateX(0deg)",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className="h-20 w-20 text-[var(--ink)] sm:h-24 sm:w-24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M32 5 C21 18 16 31 19 47 L32 59 L45 47 C48 31 43 18 32 5 Z"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            style={{
              transition: `stroke-dashoffset ${DRAW_MS}ms cubic-bezier(0.4,0,0.2,1)`,
            }}
          />
          <path
            d="M32 20 L32 44"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            style={{
              transition: `stroke-dashoffset 420ms cubic-bezier(0.4,0,0.2,1) ${DRAW_MS - 320}ms`,
            }}
          />
          <circle
            cx="32"
            cy="48.5"
            r="2.75"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            style={{
              transition: `stroke-dashoffset 300ms ease-out ${DRAW_MS - 120}ms`,
            }}
          />
        </svg>
        <p className="mt-6 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
          {shopName}
        </p>
      </div>
    </div>
  );
}
