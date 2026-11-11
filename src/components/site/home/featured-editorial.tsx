"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/format";
import { navigateWithMorph } from "@/lib/view-transition";
import type { ProductWithCategory } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Editoryal kart: boyutu grid hücresi belirler; görsel morflu ürün detayına akar. */
function EditorialCard({
  product,
  showPrices,
  large = false,
  index,
}: {
  product: ProductWithCategory;
  showPrices: boolean;
  large?: boolean;
  index: number;
}) {
  const router = useRouter();
  const href = `/urun/${product.slug}`;
  const imageUrl = product.images[0]?.url ?? product.imageUrl;

  return (
    <motion.article
      className="group flex h-full flex-col"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 3) * 0.08 }}
    >
      <Link
        href={href}
        className="flex h-full flex-col"
        data-morph
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          navigateWithMorph(router, href, `[data-vt-hero="${product.id}"]`);
        }}
      >
        <div
          className={`relative w-full overflow-hidden border border-[var(--line)] bg-[var(--paper-deep)] ${
            large ? "aspect-[4/5]" : "aspect-[4/3]"
          }`}
          style={{ viewTransitionName: `product-${product.id}` }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority={index < 2}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="ruled flex h-full items-end p-5">
              <span
                className={`font-[family-name:var(--font-display)] italic leading-none text-[var(--ink)]/12 transition group-hover:text-[var(--ink)]/25 ${
                  large ? "text-[10rem]" : "text-6xl"
                }`}
              >
                {product.name.slice(0, 1)}
              </span>
            </div>
          )}
          {product.isNew ? (
            <span className="absolute left-3 top-3 bg-[var(--accent)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
              Yeni
            </span>
          ) : null}
          {product.stock <= 0 ? (
            <span className="absolute right-3 top-3 bg-[var(--ink)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--paper)]">
              Tükendi
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {product.category.name}
          </p>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h3
              className={`font-[family-name:var(--font-display)] leading-tight text-[var(--ink)] ${
                large ? "text-3xl sm:text-4xl" : "text-xl"
              }`}
            >
              {product.name}
            </h3>
            {showPrices ? (
              <span className="price-tag shrink-0">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/** Asimetrik yerleşim: 6 ürün — 1 dev, 2 orta, 3 küçük. Izgarada aynı boy yok. */
const SLOTS = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

export function FeaturedEditorial({
  products,
  heading,
  note,
  showPrices,
}: {
  products: ProductWithCategory[];
  heading: string;
  note: string;
  showPrices: boolean;
}) {
  if (!products.length) return null;
  const shown = products.slice(0, 6);

  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              Bu hafta
            </p>
            <h2 className="display-2 mt-4 text-[var(--ink)]">{heading}</h2>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="max-w-[18rem] text-sm leading-relaxed text-[var(--ink-muted)] sm:text-right">
              {note}
            </p>
            <Link
              href="/urunler?secim=yeni"
              className="border-b border-[var(--ink)] pb-0.5 text-sm font-medium transition hover:bg-[var(--accent)]"
            >
              Yeni gelenlerin tümü
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
          {shown.map((product, i) => (
            <div key={product.id} className={SLOTS[i] ?? "lg:col-span-4"}>
              <EditorialCard
                product={product}
                showPrices={showPrices}
                large={i === 0}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
