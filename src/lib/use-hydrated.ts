"use client";

import { useEffect, useState } from "react";

/**
 * Hydration tamamlandıktan sonra true döner.
 * Scroll-bağlı MotionValue style'ları SSR'da statik değerle render edip
 * hydration'dan sonra bağlamak için kullanılır (mismatch önler).
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
