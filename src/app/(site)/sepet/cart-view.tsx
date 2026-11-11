"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, updateQty, removeItem, clear, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-[var(--ink-soft)]">Sepetiniz boş.</p>
        <Link
          href="/urunler"
          className="mt-4 inline-block border-b border-[var(--ink)] text-sm font-medium hover:bg-[var(--accent)]"
        >
          Ürünlere git
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/urun/${item.slug}`}
                className="font-medium text-[var(--ink)] hover:bg-[var(--accent)]"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                {item.sku || "—"} · {formatPrice(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => updateQty(item.productId, item.quantity - 1)}
                  aria-label="Azalt"
                  className="px-3 py-1.5 text-sm transition hover:bg-[var(--accent)]"
                >
                  −
                </button>
                <span className="min-w-9 px-1 text-center font-[family-name:var(--font-mono)] text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  aria-label="Artır"
                  className="px-3 py-1.5 text-sm transition hover:bg-[var(--accent)] disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="price-tag min-w-20 text-right text-xs">
                {formatPrice(item.price * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-sm text-red-700 hover:underline"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="price-tag text-base">Toplam {formatPrice(total)}</p>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-[var(--ink-muted)] underline-offset-4 hover:text-red-700 hover:underline"
          >
            Sepeti boşalt
          </button>
        </div>
        <Link
          href="/odeme"
          className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
        >
          Ödemeye geç ({count} ürün)
        </Link>
      </div>
    </div>
  );
}
