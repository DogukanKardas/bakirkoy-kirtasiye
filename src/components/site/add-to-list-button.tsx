"use client";

import { useRef, useState } from "react";
import { useList } from "@/lib/list";
import { flyToList } from "@/lib/fly-to-list";

type Props = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  sku?: string;
  variant?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function AddToListButton({
  productId,
  name,
  slug,
  price,
  sku,
  variant,
  disabled,
  compact,
}: Props) {
  const { addItem } = useList();
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  if (disabled) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--ink-muted)]"
      >
        Stokta yok
      </button>
    );
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => {
        addItem({ productId, name, slug, price, sku, variant }, 1);
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) {
          flyToList({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            label: name,
          });
        }
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={`w-full border border-[var(--ink)] font-medium transition hover:bg-[var(--accent)] ${
        compact ? "px-3 py-2 text-sm" : "px-5 py-3"
      } ${added ? "bg-[var(--accent)]" : "bg-transparent"}`}
    >
      {added ? "Listende ✓" : "Listeme Ekle"}
    </button>
  );
}
