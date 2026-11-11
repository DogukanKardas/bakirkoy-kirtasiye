"use client";

export type FlyDetail = {
  /** uçuşun başlayacağı ekran noktası */
  x: number;
  y: number;
  /** uçan kâğıtta görünen kısa etiket */
  label: string;
};

/** "Listeme Ekle" butonundan sticky note'a kâğıt uçuşu başlatır. */
export function flyToList(detail: FlyDetail) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.dispatchEvent(new CustomEvent<FlyDetail>("bk-fly-to-list", { detail }));
}
