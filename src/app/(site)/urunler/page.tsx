import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/site/catalog-browser";
import {
  collectCategorySlugs,
  getBrands,
  getCatalogPage,
  getCategories,
  getProductFacets,
  getSettings,
  type CatalogFilters,
} from "@db/queries";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Kırtasiye ürün kataloğu — defterler, kalemler, ofis malzemeleri ve daha fazlası.",
  alternates: { canonical: "/urunler" },
};

type Props = {
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

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [settings, categories, brands, facets] = await Promise.all([
    getSettings(),
    getCategories(),
    getBrands(),
    getProductFacets(),
  ]);

  const kategori = str(sp.kategori);
  const filters: CatalogFilters = {
    categorySlugs: kategori ? collectCategorySlugs(categories, kategori) : null,
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Katalog
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">Ürünler</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-[var(--ink-soft)]">
        Raftaki her şey, tek tek seçildi. Aradığını bulmak için filtreleri
        kullanın — ya da dükkâna gelin, birlikte bakalım.
      </p>

      <div className="mt-10">
        <CatalogBrowser
          initialPage={initialPage}
          categories={categories}
          brands={brands}
          facets={facets}
          showPrices={settings.showPrices}
          commerceEnabled={settings.commerceEnabled}
        />
      </div>
    </div>
  );
}
