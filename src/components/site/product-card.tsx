"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { navigateWithMorph } from "@/lib/view-transition";
import { AddToListButton } from "./add-to-list-button";
import { AddToCartButton } from "./add-to-cart-button";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryName: string;
  imageUrl?: string | null;
  showPrices: boolean;
  commerceEnabled: boolean;
  isNew?: boolean;
  sku?: string;
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  stock,
  categoryName,
  imageUrl,
  showPrices,
  commerceEnabled,
  isNew = false,
  sku,
}: ProductCardProps) {
  const router = useRouter();
  const href = `/urun/${slug}`;

  return (
    <article className="group flex flex-col border-b border-[var(--line)] pb-5">
      <Link
        href={href}
        className="block"
        data-morph
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          navigateWithMorph(router, href, `[data-vt-hero="${id}"]`);
        }}
      >
        <div
          className="relative mb-4 aspect-[4/3] overflow-hidden bg-[var(--paper-deep)]"
          style={{ viewTransitionName: `product-${id}` }}
        >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-end p-4">
                <span className="font-[family-name:var(--font-display)] text-5xl italic text-[var(--ink)]/12 transition group-hover:text-[var(--ink)]/25">
                  {name.slice(0, 1)}
                </span>
              </div>
            )}
            {isNew ? (
              <span className="absolute left-2 top-2 bg-[var(--accent)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
                Yeni
              </span>
            ) : null}
        </div>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          {categoryName}
        </p>
        <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]">
          {name}
        </h3>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        {showPrices ? (
          <span className="price-tag">{formatPrice(price)}</span>
        ) : (
          <span className="text-xs text-[var(--ink-muted)]">
            Fiyat için dükkâna sorun
          </span>
        )}
        {stock <= 0 ? (
          <span className="text-xs text-red-700">Tükendi</span>
        ) : null}
      </div>
      {!commerceEnabled ? (
        <div className="mt-3">
          <AddToListButton
            productId={id}
            name={name}
            slug={slug}
            price={price}
            sku={sku}
            disabled={stock <= 0}
            compact
          />
        </div>
      ) : (
        <div className="mt-3">
          <AddToCartButton
            productId={id}
            name={name}
            slug={slug}
            price={price}
            stock={stock}
            sku={sku}
            compact
          />
        </div>
      )}
    </article>
  );
}
