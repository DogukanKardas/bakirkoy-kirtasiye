"use client";

import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { flyToCart } from "@/lib/fly-to-cart";

type Props = {
  productId: string;
  name: string;
  price: number;
  slug: string;
  stock: number;
  sku?: string;
  compact?: boolean;
};

export function AddToCartButton({
  productId,
  name,
  price,
  slug,
  stock,
  sku,
  compact = false,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  if (stock <= 0) {
    return (
      <button
        disabled
        className={
          compact
            ? "w-full cursor-not-allowed border border-[var(--line)] px-3 py-2 text-xs text-[var(--ink-muted)]"
            : "w-full cursor-not-allowed border border-[var(--line)] px-5 py-3 text-sm text-[var(--ink-muted)]"
        }
      >
        Stokta yok
      </button>
    );
  }

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    addItem({ productId, name, price, slug, stock, sku: sku ?? null }, 1);
    flyToCart({ x: e.clientX, y: e.clientY, label: name });
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full border border-[var(--ink)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--accent)]"
      >
        {added ? "Sepette ✓" : "Sepete Ekle"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
    >
      {added ? "Sepete eklendi ✓" : "Sepete ekle"}
    </button>
  );
}
