"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import { fetchCatalogPage } from "@/lib/catalog-api";
import { formatPrice } from "@/lib/format";
import { matchFacetColors } from "@/lib/colors";
import { ProductCard } from "./product-card";
import type {
  Brand,
  CatalogPage,
  CatalogProduct,
  Category,
  ProductFacets,
} from "@db/queries";

const PER_PAGE = 12;

const parsers = {
  kategori: parseAsString,
  marka: parseAsString,
  min: parseAsInteger,
  max: parseAsInteger,
  renk: parseAsString,
  stok: parseAsStringEnum(["in", "out"] as const),
  secim: parseAsStringEnum(["yeni", "one-cikan"] as const),
  sirala: parseAsStringEnum([
    "name",
    "price_asc",
    "price_desc",
    "newest",
    "popular",
  ] as const),
  ara: parseAsString,
};

type FilterState = {
  kategori: string | null;
  marka: string | null;
  min: number | null;
  max: number | null;
  renk: string | null;
  stok: "in" | "out" | null;
  secim: "yeni" | "one-cikan" | null;
  sirala: "name" | "price_asc" | "price_desc" | "newest" | "popular" | null;
  ara: string | null;
};

function filtersToRpc(f: FilterState, categorySlugs: string[] | null) {
  return {
    categorySlugs,
    brandSlug: f.marka,
    minPrice: f.min != null ? f.min * 100 : null,
    maxPrice: f.max != null ? f.max * 100 : null,
    color: f.renk,
    stock: f.stok,
    flag: f.secim === "yeni" ? ("new" as const) : f.secim === "one-cikan" ? ("featured" as const) : null,
    sort: f.sirala ?? "name",
    q: f.ara,
  };
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border-b border-[var(--line)] pb-5">
      <div className="mb-4 aspect-[4/3] bg-[var(--paper-deep)]" />
      <div className="h-3 w-1/3 bg-[var(--paper-deep)]" />
      <div className="mt-2 h-6 w-3/4 bg-[var(--paper-deep)]" />
      <div className="mt-3 h-4 w-1/4 bg-[var(--paper-deep)]" />
    </div>
  );
}

const GRID_CLASSES: Record<number, string> = {
  2: "grid gap-x-8 gap-y-12 sm:grid-cols-2",
  3: "grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function CatalogBrowser({
  initialPage,
  categories,
  brands,
  facets,
  showPrices,
  commerceEnabled,
  lockedCategorySlugs = null,
  hideCategoryFilter = false,
}: {
  initialPage: CatalogPage;
  categories: Category[];
  brands: Brand[];
  facets: ProductFacets;
  showPrices: boolean;
  commerceEnabled: boolean;
  lockedCategorySlugs?: string[] | null;
  hideCategoryFilter?: boolean;
}) {
  const [filters, setFilters] = useQueryStates(parsers, {
    history: "replace",
    shallow: true,
  });
  const [gridCols, setGridCols] = useState(3);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [items, setItems] = useState<CatalogProduct[]>(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const firstRun = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const roots = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );
  const childrenOf = useCallback(
    (id: string) => categories.filter((c) => c.parentId === id),
    [categories],
  );

  /** Seçili kategori + torunlarının slug'ları (RPC ağaç filtresi). */
  const selectedCategorySlugs = useMemo(() => {
    if (lockedCategorySlugs) return lockedCategorySlugs;
    if (!filters.kategori) return null;
    const root = categories.find((c) => c.slug === filters.kategori);
    if (!root) return [filters.kategori];
    const slugs = [root.slug];
    let frontier = [root.id];
    while (frontier.length > 0) {
      const kids = categories.filter(
        (c) => c.parentId && frontier.includes(c.parentId),
      );
      slugs.push(...kids.map((k) => k.slug));
      frontier = kids.map((k) => k.id);
    }
    return slugs;
  }, [filters.kategori, categories, lockedCategorySlugs]);

  const filtersKey = JSON.stringify([filters, selectedCategorySlugs]);

  /* Filtre değişiminde 1. sayfadan yeniden yükle (ilk render hariç). */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetchCatalogPage(
          filtersToRpc(filters, selectedCategorySlugs),
          1,
          PER_PAGE,
        );
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
      } catch {
        /* sessiz */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  /* Sonsuz scroll */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loading || loadingMore) return;
        if (items.length >= total) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        fetchCatalogPage(
          filtersToRpc(filters, selectedCategorySlugs),
          nextPage,
          PER_PAGE,
        )
          .then((res) => {
            setItems((prev) => {
              const seen = new Set(prev.map((p) => p.id));
              return [...prev, ...res.items.filter((p) => !seen.has(p.id))];
            });
            setPage(nextPage);
          })
          .catch(() => {})
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, total, loading, loadingMore, page, filtersKey]);

  const activeFilterCount =
    (filters.kategori ? 1 : 0) +
    (filters.marka ? 1 : 0) +
    (filters.min != null ? 1 : 0) +
    (filters.max != null ? 1 : 0) +
    (filters.renk ? 1 : 0) +
    (filters.stok ? 1 : 0) +
    (filters.secim ? 1 : 0) +
    (filters.ara ? 1 : 0);

  const clearAll = () =>
    setFilters({
      kategori: null,
      marka: null,
      min: null,
      max: null,
      renk: null,
      stok: null,
      secim: null,
      ara: null,
    });

  const facetColors = useMemo(
    () => matchFacetColors(facets.colors),
    [facets.colors],
  );

  /* ---------- filtre kontrolleri (hem bar hem sheet kullanır) ---------- */
  const filterControls = (
    <>
      {!hideCategoryFilter ? (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Kategori
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilters({ kategori: null })}
              className={`border px-2.5 py-1 text-xs transition ${
                !filters.kategori
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
              }`}
            >
              Tümü
            </button>
            {roots.map((root) => (
              <span key={root.id} className="contents">
                <button
                  type="button"
                  onClick={() => setFilters({ kategori: root.slug })}
                  className={`border px-2.5 py-1 text-xs transition ${
                    filters.kategori === root.slug
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                  }`}
                >
                  {root.name}
                </button>
                {childrenOf(root.id).map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => setFilters({ kategori: kid.slug })}
                    className={`border px-2.5 py-1 pl-4 text-xs transition ${
                      filters.kategori === kid.slug
                        ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                        : "border-dashed border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--ink)]"
                    }`}
                  >
                    {kid.name}
                  </button>
                ))}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {brands.length > 0 ? (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Marka
          </p>
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() =>
                  setFilters({ marka: filters.marka === b.slug ? null : b.slug })
                }
                className={`border px-2.5 py-1 text-xs transition ${
                  filters.marka === b.slug
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showPrices && facets.maxPrice > 0 ? (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Fiyat (TL) — {formatPrice(facets.minPrice)} / {formatPrice(facets.maxPrice)}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="En az"
              value={filters.min ?? ""}
              onChange={(e) =>
                setFilters({
                  min: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="w-24 border border-[var(--line)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--ink)]"
            />
            <span className="text-[var(--ink-muted)]">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="En çok"
              value={filters.max ?? ""}
              onChange={(e) =>
                setFilters({
                  max: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="w-24 border border-[var(--line)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--ink)]"
            />
          </div>
        </div>
      ) : null}

      {facetColors.length > 0 ? (
        <div>
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Renk
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {facetColors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() =>
                  setFilters({ renk: filters.renk === c.name ? null : c.name })
                }
                className={`h-6 w-6 rounded-full border transition ${
                  filters.renk === c.name
                    ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]"
                    : "border-[var(--line)] hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                <span className="sr-only">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Stok
        </p>
        <div className="flex gap-1.5">
          {(
            [
              ["in", "Stokta var"],
              ["out", "Tükendi"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() =>
                setFilters({ stok: filters.stok === val ? null : val })
              }
              className={`border px-2.5 py-1 text-xs transition ${
                filters.stok === val
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Seçim
        </p>
        <div className="flex gap-1.5">
          {(
            [
              ["yeni", "Yeni"],
              ["one-cikan", "Öne çıkan"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() =>
                setFilters({ secim: filters.secim === val ? null : val })
              }
              className={`border px-2.5 py-1 text-xs transition ${
                filters.secim === val
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const grid = (
    <>
      {loading ? (
        <div className={GRID_CLASSES[gridCols]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-[var(--line)] px-6 py-20 text-center">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            Rafta yok
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Ürün bulunamadı
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
            Bu filtrelere uyan ürün rafta görünmüyor. Kelimeyi değiştirin ya da
            filtreleri sıfırlayın — dükkânda mutlaka bir şey vardır.
          </p>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 border border-[var(--ink)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
            >
              Filtreleri temizle
            </button>
          ) : (
            <a
              href="/urunler"
              className="mt-6 inline-block border-b border-[var(--ink)] pb-0.5 text-sm font-medium hover:bg-[var(--accent)]"
            >
              Tüm kataloğa dön
            </a>
          )}
        </div>
      ) : (
        <motion.div layout className={GRID_CLASSES[gridCols]}>
          <AnimatePresence mode="popLayout">
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  stock={product.stock}
                  categoryName={product.category.name}
                  imageUrl={product.imageUrl ?? product.images[0]?.url ?? null}
                  showPrices={showPrices}
                  commerceEnabled={commerceEnabled}
                  isNew={product.isNew}
                  sku={product.sku}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* sonsuz scroll sentinel + daha fazla yükleniyor iskeleti */}
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {loadingMore ? (
        <div className={`${GRID_CLASSES[gridCols]} mt-12`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}
      {!loading && !loadingMore && items.length < total ? (
        <p className="mt-8 text-center font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
          {items.length} / {total} ürün — kaydırdıkça daha fazlası gelir
        </p>
      ) : null}
    </>
  );

  return (
    <div>
      {/* üst kontrol çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="border border-[var(--ink)] px-3 py-1.5 text-sm lg:hidden"
          >
            Filtrele{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
            {loading ? "…" : `${total} ürün`}
          </p>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-[var(--ink-muted)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Filtreleri temizle
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            Sırala
            <select
              value={filters.sirala ?? "name"}
              onChange={(e) =>
                setFilters({
                  sirala: (e.target.value || null) as FilterState["sirala"],
                })
              }
              className="border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            >
              <option value="name">Ada göre (A–Z)</option>
              <option value="popular">En çok görüntülenen</option>
              <option value="newest">En yeni</option>
              {showPrices ? (
                <>
                  <option value="price_asc">Fiyat (artan)</option>
                  <option value="price_desc">Fiyat (azalan)</option>
                </>
              ) : null}
            </select>
          </label>
          <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Grid düzeni">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setGridCols(n)}
                aria-label={`${n} kolon`}
                className={`flex h-8 w-8 items-center justify-center border transition ${
                  gridCols === n
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--ink)]"
                }`}
              >
                <span className="grid grid-cols-2 gap-[2px]">
                  {Array.from({ length: n }).map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 bg-current" />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* filtre sütunu + tek grid (masaüstünde yan yana) */}
      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        <aside className="mb-8 hidden space-y-6 border-r border-[var(--line)] pr-6 lg:mb-0 lg:block">
          {filterControls}
        </aside>
        <div>{grid}</div>
      </div>

      {/* mobil filtre sheet'i */}
      <AnimatePresence>
        {sheetOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Kapat"
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t-2 border-[var(--ink)] bg-[var(--paper)] p-5 pb-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-[family-name:var(--font-display)] text-xl">
                  Filtreler
                </p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="border border-[var(--line)] px-3 py-1 text-sm"
                >
                  Kapat
                </button>
              </div>
              <div className="space-y-6">{filterControls}</div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="mt-6 w-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--paper)]"
              >
                {total} ürünü göster
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
