import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/site/catalog-browser";
import { absoluteUrl } from "@/lib/site";
import {
  collectCategorySlugs,
  getBrands,
  getCatalogPage,
  getCategories,
  getProductFacets,
  getSettings,
  type CatalogFilters,
} from "@db/queries";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function str(v: string | string[] | undefined): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}
function num(v: string | string[] | undefined): number | null {
  const s = str(v);
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name} kategorisindeki ürünler — Bakırköy Kırtasiye.`,
    alternates: { canonical: `/kategori/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const [settings, categories, brands, facets] = await Promise.all([
    getSettings(),
    getCategories(),
    getBrands(),
    getProductFacets(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const children = categories.filter((c) => c.parentId === category.id);
  const parent = category.parentId
    ? categories.find((c) => c.id === category.parentId)
    : null;
  // Alt kategorideyken sekmeler ebeveynin çocuklarını gösterir
  const tabParent = parent ?? category;
  const tabs = categories.filter((c) => c.parentId === tabParent.id);

  const slugs = collectCategorySlugs(categories, slug);
  const filters: CatalogFilters = {
    categorySlugs: slugs,
    brandSlug: str(sp.marka),
    minPrice: num(sp.min) != null ? num(sp.min)! * 100 : null,
    maxPrice: num(sp.max) != null ? num(sp.max)! * 100 : null,
    color: str(sp.renk),
    stock: sp.stok === "in" || sp.stok === "out" ? sp.stok : null,
    flag: sp.secim === "yeni" ? "new" : sp.secim === "one-cikan" ? "featured" : null,
    sort: (str(sp.sirala) as CatalogFilters["sort"]) ?? "name",
    q: str(sp.ara),
  };

  const initialPage = await getCatalogPage(filters, 1, 12);

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
      ...(parent
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: parent.name,
              item: absoluteUrl(`/kategori/${parent.slug}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: parent ? 3 : 2,
        name: category.name,
        item: absoluteUrl(`/kategori/${category.slug}`),
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* kategori hero'su */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        {category.imageUrl ? (
          <>
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[var(--paper)]/80" />
          </>
        ) : null}
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <nav className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            <Link href="/urunler" className="hover:text-[var(--ink)]">
              Katalog
            </Link>
            {parent ? (
              <>
                {" / "}
                <Link
                  href={`/kategori/${parent.slug}`}
                  className="hover:text-[var(--ink)]"
                >
                  {parent.name}
                </Link>
              </>
            ) : null}
            {" / "}
            <span className="text-[var(--ink)]">{category.name}</span>
          </nav>
          <h1 className="display-1 mt-4 text-[var(--ink)]">{category.name}</h1>
          <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
            {initialPage.total} ürün
          </p>
        </div>
      </section>

      {/* alt kategori sekmeleri */}
      {tabs.length > 0 ? (
        <div className="border-b border-[var(--line)]">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-4 sm:px-6">
            <Link
              href={`/kategori/${tabParent.slug}`}
              className={`border px-3 py-1.5 text-sm transition ${
                category.id === tabParent.id
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
              }`}
            >
              Tümü
            </Link>
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/kategori/${tab.slug}`}
                className={`border px-3 py-1.5 text-sm transition ${
                  tab.slug === slug
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <CatalogBrowser
          initialPage={initialPage}
          categories={categories}
          brands={brands}
          facets={facets}
          showPrices={settings.showPrices}
          commerceEnabled={settings.commerceEnabled}
          lockedCategorySlugs={slugs}
          hideCategoryFilter
        />
      </div>
    </div>
  );
}
