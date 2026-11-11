"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll — yalnızca ana sayfada mount edilir.
 * prefers-reduced-motion'da tamamen devre dışı.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    (window as unknown as { __bkLenis?: Lenis }).__bkLenis = lenis;
    return () => {
      (window as unknown as { __bkLenis?: Lenis }).__bkLenis = undefined;
      lenis.destroy();
    };
  }, []);

  return null;
}
