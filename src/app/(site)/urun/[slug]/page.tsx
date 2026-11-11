import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductPurchasePanel } from "@/components/site/product-purchase-panel";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import {
  getBrandProducts,
  getProductBySlugCached,
  getRelatedProducts,
  getSettings,
  incrementProductView,
} from "@db/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugCached(slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || undefined,
    alternates: { canonical: `/urun/${product.slug}` },
    // OG görseli: opengraph-image.tsx dinamik üretir (ürün görseli + ad + fiyat)
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-3 w-48 bg-[var(--paper-deep)]" />
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="aspect-[4/3] bg-[var(--paper-deep)]" />
        <div>
          <div className="h-3 w-24 bg-[var(--paper-deep)]" />
          <div className="mt-3 h-10 w-3/4 bg-[var(--paper-deep)]" />
          <div className="mt-6 h-6 w-32 bg-[var(--paper-deep)]" />
          <div className="mt-8 h-12 w-full bg-[var(--paper-deep)]" />
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail slug={slug} />
    </Suspense>
  );
}

async function ProductDetail({ slug }: { slug: string }) {
  const [settings, product] = await Promise.all([
    getSettings(),
    getProductBySlugCached(slug),
  ]);

  if (!product || !product.active) notFound();
  void incrementProductView(product.id).catch(() => {});

  const images =
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [{ url: product.imageUrl, alt: product.name }]
        : [];
  const isHtml = /<[a-z][\s\S]*>/i.test(product.description);

  const [related, sameBrand] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    product.brandId
      ? getBrandProducts(product.brandId, product.id, 8)
      : Promise.resolve([]),
  ]);
  const brandName = sameBrand[0]?.brandName ?? related[0]?.brandName ?? null;

  const stockLabel =
    product.stock <= 0
      ? { text: "Tükendi", cls: "text-red-700" }
      : product.stock < 5
        ? { text: `Son ${product.stock} adet`, cls: "text-amber-700" }
        : { text: "Stokta var", cls: "text-emerald-700" };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.seoDescription || undefined,
    image: images.map((i) => i.url),
    category: product.category.name,
    brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
    offers: settings.showPrices
      ? {
          "@type": "Offer",
          url: absoluteUrl(`/urun/${product.slug}`),
          priceCurrency: "TRY",
          price: (product.price / 100).toFixed(2),
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ürünler",
        item: absoluteUrl("/urunler"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: absoluteUrl(`/kategori/${product.category.slug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/urun/${product.slug}`),
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        <Link href="/urunler" className="hover:text-[var(--ink)]">
          Ürünler
        </Link>
        {" / "}
        <Link
          href={`/kategori/${product.category.slug}`}
          className="hover:text-[var(--ink)]"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* sol: galeri */}
        <ProductGallery
          images={images}
          name={product.name}
          productId={product.id}
        />

        {/* sağ: yapışkan bilgi paneli */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {brandName ? (
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              {brandName}
            </p>
          ) : null}
          <h1 className="display-3 mt-2 text-[var(--ink)]">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {settings.showPrices ? (
              <span className="price-tag text-xl">{formatPrice(product.price)}</span>
            ) : (
              <span className="text-sm text-[var(--ink-muted)]">
                Fiyat için dükkâna sorun
              </span>
            )}
            <span
              className={`font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] ${stockLabel.cls}`}
            >
              ● {stockLabel.text}
            </span>
          </div>

          <ProductPurchasePanel
            productId={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            stock={product.stock}
            sku={product.sku}
            variants={product.variants}
            commerceEnabled={settings.commerceEnabled}
            whatsapp={settings.whatsapp}
          />

          <dl className="mt-8 space-y-2 border-t border-[var(--line)] pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--ink-muted)]">SKU</dt>
              <dd className="font-[family-name:var(--font-mono)] text-xs">
                {product.sku}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--ink-muted)]">Kategori</dt>
              <dd>
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)]"
                >
                  {product.category.name}
                </Link>
              </dd>
            </div>
            {product.tags.length > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-[var(--ink-muted)]">Etiketler</dt>
                <dd className="text-right text-[var(--ink-soft)]">
                  {product.tags.join(", ")}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {/* açıklama */}
      {product.description ? (
        <section className="mt-16 max-w-3xl border-t border-[var(--line)] pt-10">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Ürün Açıklaması
          </h2>
          {isHtml ? (
            <div
              className="mt-5 leading-relaxed text-[var(--ink-soft)] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:mt-4 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:text-[var(--ink)] [&_h3]:mt-3 [&_h3]:font-semibold [&_h3]:text-[var(--ink)] [&_p]:my-2 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="mt-5 leading-relaxed text-[var(--ink-soft)]">
              {product.description}
            </p>
          )}
        </section>
      ) : null}

      {/* bununla iyi gider */}
      {related.length > 0 ? (
        <section className="mt-16 border-t border-[var(--line)] pt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Bununla iyi gider
            </h2>
            <Link
              href={`/kategori/${product.category.slug}`}
              className="text-sm text-[var(--ink-muted)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Tüm {product.category.name} →
            </Link>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
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
        </section>
      ) : null}

      {/* aynı markadan */}
      {sameBrand.length > 0 && brandName ? (
        <section className="mt-16 border-t border-[var(--line)] pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Aynı markadan: {brandName}
          </h2>
          <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
            <div className="flex w-max gap-8">
              {sameBrand.map((p) => (
                <div key={p.id} className="w-64 shrink-0">
                  <ProductCard
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
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
