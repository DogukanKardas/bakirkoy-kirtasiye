"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type StartViewTransition = (cb: () => void | Promise<void>) => {
  finished: Promise<void>;
  ready: Promise<void>;
  skipTransition: () => void;
};

/** Hedef sayfada shared element'in mount olmasını bekler (max 1500ms). */
function waitForSelector(selector: string, timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

/**
 * Kart → detay shared element geçişi.
 * Kart görseli ile detay hero'su aynı `view-transition-name` değerini taşır;
 * navigasyon native View Transitions API ile sarılır ve hedef hero'nun
 * mount olması beklenir. Desteklemeyen tarayıcıda düz navigasyon.
 */
export function navigateWithMorph(
  router: AppRouterInstance,
  href: string,
  heroSelector: string,
): void {
  const startVT = (document as unknown as { startViewTransition?: StartViewTransition })
    .startViewTransition;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!startVT || reduced) {
    router.push(href);
    return;
  }
  startVT.call(document, async () => {
    router.push(href);
    await waitForSelector(heroSelector);
    // React commit + paint için iki frame bekle
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}
