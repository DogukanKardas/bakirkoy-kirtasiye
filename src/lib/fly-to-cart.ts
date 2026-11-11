"use client";

import type { FlyDetail } from "./fly-to-list";

/** "Sepete Ekle" butonundan header'daki sepet butonuna kâğıt uçuşu başlatır. */
export function flyToCart(detail: FlyDetail) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.dispatchEvent(new CustomEvent<FlyDetail>("bk-fly-to-cart", { detail }));
}
