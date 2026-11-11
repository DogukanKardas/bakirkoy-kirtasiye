import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import {
  getCollectionBySlug,
  getCollectionProductsCached,
  getSettings,
} from "@db/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description || undefined,
    alternates: { canonical: `/koleksiyon/${collection.slug}` },
    openGraph: collection.imageUrl
      ? { images: [{ url: collection.imageUrl }] }
      : undefined,
  };
}

function formatDateRange(startsAt: string | null, endsAt: string | null) {
  const fmt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (startsAt && endsAt)
    return `${fmt.format(new Date(startsAt))} — ${fmt.format(new Date(endsAt))}`;
  if (endsAt) return `${fmt.format(new Date(endsAt))} tarihine kadar`;
  return null;
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [settings, collection] = await Promise.all([
    getSettings(),
    getCollectionBySlug(slug),
  ]);
  if (!collection) notFound();

  const products = await getCollectionProductsCached(collection.id);
  const heroImage = collection.imageUrl || products[0]?.imageUrl || products[0]?.images[0]?.url || null;
  const dateRange = formatDateRange(collection.startsAt, collection.endsAt);
  const storyParagraphs = collection.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      {/* dergi hero'su */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        {heroImage ? (
          <>
            <Image
              src={heroImage}
              alt={collection.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] via-[var(--paper)]/70 to-[var(--paper)]/20" />
          </>
        ) : null}
        <div className="relative mx-auto flex min-h-[55vh] w-full max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Koleksiyon{dateRange ? ` · ${dateRange}` : ""}
          </p>
          <h1 className="display-1 mt-4 max-w-4xl text-[var(--ink)]">
            {collection.name}
          </h1>
        </div>
      </section>

      {/* hikâye */}
      {storyParagraphs.length > 0 ? (
        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_2fr]">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Hikâyesi
          </p>
          <div className="space-y-5">
            {storyParagraphs.map((p, i) => (
              <p
                key={i}
                className={`leading-relaxed text-[var(--ink-soft)] ${
                  i === 0
                    ? "font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
                    : ""
                }`}
              >
                {p}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/* ürünler */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Seçkideki ürünler
          </h2>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
            {products.length} ürün
          </p>
        </div>
        {products.length > 0 ? (
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                stock={p.stock}
                categoryName={p.category.name}
                imageUrl={p.imageUrl ?? p.images[0]?.url ?? null}
                showPrices={settings.showPrices}
                commerceEnabled={settings.commerceEnabled}
                isNew={p.isNew}
                sku={p.sku}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-[var(--ink-muted)]">
            Bu koleksiyonda henüz ürün yok.
          </p>
        )}
        <p className="mt-14 text-center">
          <Link
            href="/urunler"
            className="text-sm text-[var(--ink-muted)] underline underline-offset-4 hover:text-[var(--ink)]"
          >
            Tüm kataloğa dön →
          </Link>
        </p>
      </section>
    </div>
  );
}
