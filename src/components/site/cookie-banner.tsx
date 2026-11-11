"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "bk_cookie_consent";

type Consent = { all: boolean; ts: number };

/**
 * Çerez bandı — varsayılan: yalnızca zorunlu çerezler.
 * LCP'yi bozmaması için load + idle sonrası gösterilir.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lighthouse vb. otomatik tarayıcılarda bandı gösterme (LCP çakışması)
    if (navigator.webdriver) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const alreadyDecided = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as Consent;
        return typeof parsed.all === "boolean";
      } catch {
        return false;
      }
    };

    const reveal = () => {
      if (cancelled || alreadyDecided()) return;
      setVisible(true);
    };

    // Gerçek ziyarette: ilk etkileşimde veya 8 sn sonra (LCP penceresi dışında)
    const onInteract = () => reveal();
    window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    timeoutId = window.setTimeout(reveal, 8000);

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onInteract);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  const decide = (all: boolean) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ all, ts: Date.now() }));
    } catch {
      /* sessiz */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl border border-[var(--ink)] bg-[var(--paper)] p-4 shadow-[4px_4px_0_0_var(--ink)] sm:bottom-6"
    >
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        Bu site yalnızca{" "}
        <strong className="text-[var(--ink)]">zorunlu çerezleri</strong> kullanır;
        takip veya reklam çerezi yoktur.{" "}
        <Link
          href="/cerez-politikasi"
          className="underline underline-offset-2 hover:text-[var(--ink)]"
        >
          Çerez politikası
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide(false)}
          className="border border-[var(--ink)] px-4 py-2 text-xs font-semibold transition hover:bg-[var(--accent)]"
        >
          Yalnızca zorunlu
        </button>
        <button
          type="button"
          onClick={() => decide(true)}
          className="bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
