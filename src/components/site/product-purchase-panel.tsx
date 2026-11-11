"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { colorHexFor } from "@/lib/colors";
import { AddToCartButton } from "./add-to-cart-button";
import { AddToListButton } from "./add-to-list-button";
import type { ProductVariant } from "@db/queries";

export function ProductPurchasePanel({
  productId,
  name,
  slug,
  price,
  stock,
  sku,
  variants,
  commerceEnabled,
  whatsapp,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sku?: string;
  variants: ProductVariant[];
  commerceEnabled: boolean;
  whatsapp: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    variants.length === 1 ? variants[0]!.name : null,
  );

  const displayName = selected ? `${name} (${selected})` : name;
  const waText = encodeURIComponent(
    `Merhaba, "${displayName}" ürününü sormak istiyorum.`,
  );

  return (
    <div>
      {variants.length > 0 ? (
        <div className="mt-6">
          <p className="mb-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Seçenek{selected ? `: ${selected}` : ""}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
              const hex = colorHexFor(v.name);
              const isActive = selected === v.name;
              if (hex) {
                return (
                  <button
                    key={v.name}
                    type="button"
                    title={v.name}
                    onClick={() => setSelected(isActive ? null : v.name)}
                    className="relative flex h-9 w-9 items-center justify-center"
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="variant-ring"
                        className="absolute inset-0 rounded-full border-2 border-[var(--ink)]"
                        transition={{ type: "spring", damping: 22, stiffness: 350 }}
                      />
                    ) : null}
                    <span
                      className="h-6 w-6 rounded-full border border-[var(--line)] transition hover:scale-110"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="sr-only">{v.name}</span>
                  </button>
                );
              }
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelected(isActive ? null : v.name)}
                  className="relative px-3 py-1.5 text-sm"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="variant-ring"
                      className="absolute inset-0 border-2 border-[var(--ink)]"
                      transition={{ type: "spring", damping: 22, stiffness: 350 }}
                    />
                  ) : (
                    <span className="absolute inset-0 border border-[var(--line)] transition hover:border-[var(--ink)]" />
                  )}
                  <span className="relative">{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {commerceEnabled ? (
          <AddToCartButton
            productId={productId}
            name={displayName}
            price={price}
            slug={slug}
            stock={stock}
            sku={sku}
          />
        ) : (
          <AddToListButton
            productId={productId}
            name={name}
            slug={slug}
            price={price}
            sku={sku}
            variant={selected ?? undefined}
            disabled={stock <= 0}
          />
        )}
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 border border-[#25d366] bg-[#25d366]/10 px-4 py-3 text-sm font-medium text-[#128c4a] transition hover:bg-[#25d366]/20"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current"
              aria-hidden
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.81.82-2.99-.2-.31a8.07 8.07 0 0 1-1.24-4.32c0-4.47 3.64-8.11 8.12-8.11 4.47 0 8.11 3.64 8.11 8.11s-3.64 8.12-8.11 8.12zm4.45-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05 0 1.21.88 2.37 1 2.53.12.16 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28z" />
            </svg>
            WhatsApp&rsquo;tan Sor
          </a>
        ) : null}
      </div>
    </div>
  );
}
