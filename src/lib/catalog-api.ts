"use client";

import { getBrowserSupabase } from "@/lib/supabase-browser";
import {
  mapCatalogPage,
  type CatalogFilters,
  type CatalogPage,
  type SearchHit,
} from "@db/queries";

/** Client tarafı katalog sayfası (sonsuz scroll) — anon RPC. */
export async function fetchCatalogPage(
  filters: CatalogFilters,
  page: number,
  perPage: number,
): Promise<CatalogPage> {
  const { data, error } = await getBrowserSupabase().rpc("public_catalog", {
    p_category_slugs: filters.categorySlugs?.length
      ? filters.categorySlugs
      : null,
    p_brand_slug: filters.brandSlug ?? null,
    p_min_price: filters.minPrice ?? null,
    p_max_price: filters.maxPrice ?? null,
    p_color: filters.color ?? null,
    p_stock: filters.stock ?? null,
    p_flag: filters.flag ?? null,
    p_sort: filters.sort ?? "name",
    p_page: page,
    p_per_page: perPage,
    p_q: filters.q ?? null,
  });
  if (error) throw new Error(error.message);
  return mapCatalogPage(data);
}

/** Client tarafı anlık arama — anon RPC. */
export async function fetchSearchHits(
  q: string,
  limit = 8,
): Promise<SearchHit[]> {
  const { data, error } = await getBrowserSupabase().rpc(
    "public_search_products",
    { p_q: q, p_limit: limit },
  );
  if (error) throw new Error(error.message);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: r.price,
    stock: r.stock,
    imageUrl: r.image_url ?? null,
    categoryName: r.category_name ?? "",
    categorySlug: r.category_slug ?? "",
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
