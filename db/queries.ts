import { unstable_cache } from "next/cache";
import { adminRpc, getSupabase } from "@/lib/supabase";

export type DayHours = { open: string; close: string } | null;
export type Hours = Record<string, DayHours>;
export type HoursException = {
  date: string;
  label: string;
  closed: boolean;
  open?: string;
  close?: string;
};

export type Settings = {
  id: number;
  shopName: string;
  slogan: string;
  logoUrl: string;
  logoDarkUrl: string;
  faviconUrl: string | null;
  ogImageUrl: string;
  accentColor: string;
  secondaryColor: string;
  showPrices: boolean;
  commerceEnabled: boolean;
  announcementText: string;
  announcementEnabled: boolean;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  district: string;
  city: string;
  hours: Hours;
  hoursExceptions: HoursException[];
  mapEmbedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  imageUrl: string;
};

export type Brand = { id: string; name: string; slug: string; logoUrl: string };

export type ProductImage = { url: string; alt: string };
export type ProductVariant = { name: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: string;
  brandId: string | null;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  seoTitle: string;
  seoDescription: string;
  views: number;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type ProductWithCategory = Product & { category: Category };

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  productIds: string[];
  isSchoolList: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  unitNote: string;
  sortOrder: number;
  active: boolean;
};

/** Okul listesi: koleksiyon + tek tıkla eklenebilir ürün özeti. */
export type SchoolListProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string;
  stock: number;
};

export type SchoolList = {
  id: string;
  name: string;
  slug: string;
  description: string;
  products: SchoolListProduct[];
};

export type HomeSection = {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  position: number;
  enabled: boolean;
};

export type ListRequestItem = {
  name: string;
  quantity: number;
  sku?: string;
  variant?: string;
  note?: string;
};
export type ListRequest = {
  id: string;
  customerName: string;
  phone: string;
  note: string;
  items: ListRequestItem[];
  status: "new" | "preparing" | "ready" | "delivered";
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string | null;
  status: string;
  total: number;
  deliveryMethod: "cargo" | "pickup";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentProvider: string | null;
  paymentTransactionId?: string | null;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "editor";
};

export const SETTINGS_TAG = "settings";
export const CATEGORIES_TAG = "categories";
export const PRODUCTS_TAG = "products";
export const COLLECTIONS_TAG = "collections";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapSettings(r: any): Settings {
  return {
    id: r.id,
    shopName: r.shop_name,
    slogan: r.slogan,
    logoUrl: r.logo_url,
    logoDarkUrl: r.logo_dark_url ?? "",
    faviconUrl: r.favicon_url,
    ogImageUrl: r.og_image_url ?? "",
    accentColor: r.accent_color,
    secondaryColor: r.secondary_color,
    showPrices: r.show_prices,
    commerceEnabled: r.commerce_enabled,
    announcementText: r.announcement_text ?? "",
    announcementEnabled: r.announcement_enabled ?? false,
    phone: r.phone,
    whatsapp: r.whatsapp,
    email: r.email,
    address: r.address,
    district: r.district,
    city: r.city,
    hours: (r.hours ?? {}) as Hours,
    hoursExceptions: (r.hours_exceptions ?? []) as HoursException[],
    mapEmbedUrl: r.map_embed_url,
    instagramUrl: r.instagram_url,
    facebookUrl: r.facebook_url,
  };
}

export function mapCategory(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parent_id ?? null,
    position: r.position ?? 0,
    imageUrl: r.image_url ?? "",
  };
}

export function mapBrand(r: any): Brand {
  return { id: r.id, name: r.name, slug: r.slug, logoUrl: r.logo_url ?? "" };
}

export function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    sku: r.sku,
    price: r.price,
    stock: r.stock,
    imageUrl: r.image_url,
    active: r.active,
    categoryId: r.category_id,
    brandId: r.brand_id ?? null,
    tags: r.tags ?? [],
    isFeatured: r.is_featured ?? false,
    isNew: r.is_new ?? false,
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
    views: r.views ?? 0,
    images: (r.images ?? []) as ProductImage[],
    variants: (r.variants ?? []) as ProductVariant[],
  };
}

export function mapOrder(r: any): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    note: r.note,
    status: r.status,
    total: r.total,
    deliveryMethod: r.delivery_method ?? "cargo",
    paymentStatus: r.payment_status ?? "pending",
    paymentProvider: r.payment_provider ?? null,
    paymentTransactionId: r.payment_transaction_id ?? null,
    createdAt: r.created_at,
  };
}

export function mapListRequest(r: any): ListRequest {
  return {
    id: r.id,
    customerName: r.customer_name,
    phone: r.phone,
    note: r.note ?? "",
    items: (r.items ?? []) as ListRequestItem[],
    status: r.status,
    createdAt: r.created_at,
  };
}

export function mapHomeSection(r: any): HomeSection {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    content: (r.content ?? {}) as Record<string, unknown>,
    position: r.position ?? 0,
    enabled: r.enabled,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    const { data, error } = await getSupabase()
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) {
      throw new Error("settings okunamadı");
    }
    return mapSettings(data);
  },
  ["settings"],
  { tags: [SETTINGS_TAG] },
);

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await getSupabase()
      .from("categories")
      .select("*")
      .order("position")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCategory);
  },
  ["categories"],
  { tags: [CATEGORIES_TAG] },
);

export const getBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    const { data, error } = await getSupabase()
      .from("brands")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapBrand);
  },
  ["brands"],
  { tags: ["brands"] },
);

export async function getActiveProducts(
  categorySlug?: string,
): Promise<ProductWithCategory[]> {
  let query = getSupabase()
    .from("products")
    .select("*, categories!inner(*)")
    .eq("active", true)
    .order("name");
  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...mapProduct(r),
    category: mapCategory(r.categories),
  }));
}

export async function getFeaturedProducts(
  take = 6,
  ids?: string[],
): Promise<ProductWithCategory[]> {
  if (ids && ids.length > 0) {
    const { data, error } = await getSupabase()
      .from("products")
      .select("*, categories!inner(*)")
      .eq("active", true)
      .in("id", ids);
    if (error) throw new Error(error.message);
    const mapped = (data ?? []).map((r) => ({
      ...mapProduct(r),
      category: mapCategory(r.categories),
    }));
    return ids
      .map((id) => mapped.find((p) => p.id === id))
      .filter((p): p is ProductWithCategory => Boolean(p));
  }

  const { data, error } = await getSupabase()
    .from("products")
    .select("*, categories!inner(*)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(take);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...mapProduct(r),
    category: mapCategory(r.categories),
  }));
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | null> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*, categories!inner(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...mapProduct(data), category: mapCategory(data.categories) };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getCollectionProducts(
  collectionId: string,
): Promise<ProductWithCategory[]> {
  const { data, error } = await getSupabase()
    .from("collection_products")
    .select("position, products(*, categories(*))")
    .eq("collection_id", collectionId)
    .order("position");
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((r: any) => r.products)
    .filter((p: any) => p && p.active)
    .map((p: any) => ({ ...mapProduct(p), category: mapCategory(p.categories) }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getHomeSections(): Promise<HomeSection[]> {
  const { data, error } = await getSupabase()
    .from("home_sections")
    .select("*")
    .eq("enabled", true)
    .order("position");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapHomeSection);
}

export async function getOrder(orderNumber: string) {
  const { data, error } = await getSupabase().rpc("public_get_order", {
    p_order_number: orderNumber,
  });
  if (error) throw new Error(error.message);
  const order = (data ?? [])[0];
  if (!order) return null;

  const itemsRes = await getSupabase().rpc("public_get_order_items", {
    p_order_number: orderNumber,
  });
  const items: OrderItem[] = (itemsRes.data ?? []).map(
    (r: { id: string; name: string; quantity: number; price: number }) => ({
      id: r.id,
      name: r.name,
      quantity: r.quantity,
      price: r.price,
    }),
  );

  return { ...mapOrder(order), items };
}

export async function submitListRequest(payload: {
  customer_name: string;
  phone: string;
  note?: string;
  items: ListRequestItem[];
}): Promise<{ ok: true } | { error: string }> {
  const { error } = await getSupabase().rpc("public_submit_list", {
    p_payload: payload,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function submitContactMessage(payload: {
  name: string;
  contact: string;
  message: string;
}): Promise<{ ok: true } | { error: string }> {
  const { error } = await getSupabase().rpc("public_submit_contact", {
    p_payload: payload,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export type ContactMessage = {
  id: string;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function incrementProductView(productId: string) {
  await getSupabase().rpc("increment_product_view", { p_id: productId });
}

/* ---- admin (gizli anahtarlı RPC — geriye dönük) ---- */

export async function adminListOrders(): Promise<Order[]> {
  const rows = await adminRpc<unknown[]>("admin_list_orders");
  return rows.map(mapOrder);
}

/* ================= FAZ 4: Public katalog ================= */

export type CatalogFilters = {
  categorySlugs?: string[] | null;
  brandSlug?: string | null;
  minPrice?: number | null; // kuruş
  maxPrice?: number | null; // kuruş
  color?: string | null;
  stock?: "in" | "out" | null;
  flag?: "new" | "featured" | null;
  sort?: "name" | "price_asc" | "price_desc" | "newest" | "popular" | null;
  q?: string | null;
};

export type CatalogProduct = ProductWithCategory & {
  brandName: string | null;
  brandSlug: string | null;
};

export type CatalogPage = {
  items: CatalogProduct[];
  total: number;
  page: number;
  perPage: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapCatalogRow(r: any): CatalogProduct {
  return {
    ...mapProduct(r),
    category: mapCategory(r.categories),
    brandName: r.brand_name ?? null,
    brandSlug: r.brand_slug ?? null,
  };
}

export function mapCatalogPage(data: any): CatalogPage {
  return {
    items: ((data?.items ?? []) as any[]).map(mapCatalogRow),
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? 1),
    perPage: Number(data?.per_page ?? 12),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function _catalogPage(
  filters: CatalogFilters,
  page: number,
  perPage: number,
): Promise<CatalogPage> {
  const { data, error } = await getSupabase().rpc("public_catalog", {
    p_category_slugs: filters.categorySlugs?.length ? filters.categorySlugs : null,
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

export const getCatalogPage = unstable_cache(
  _catalogPage,
  ["catalog-page"],
  { tags: [PRODUCTS_TAG] },
);

export type ProductFacets = {
  colors: string[];
  minPrice: number;
  maxPrice: number;
};

export const getProductFacets = unstable_cache(
  async (): Promise<ProductFacets> => {
    const { data, error } = await getSupabase().rpc("public_product_facets");
    if (error) throw new Error(error.message);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const d = data as any;
    return {
      colors: (d?.colors ?? []) as string[],
      minPrice: Number(d?.min_price ?? 0),
      maxPrice: Number(d?.max_price ?? 0),
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["product-facets"],
  { tags: [PRODUCTS_TAG] },
);

export type SearchHit = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
};

/** Bir slug + tüm alt kategori slug'larını döndürür (ağaç filtreleme). */
export function collectCategorySlugs(
  categories: Category[],
  rootSlug: string,
): string[] {
  const root = categories.find((c) => c.slug === rootSlug);
  if (!root) return [rootSlug];
  const slugs = [root.slug];
  let frontier = [root.id];
  while (frontier.length > 0) {
    const children = categories.filter(
      (c) => c.parentId && frontier.includes(c.parentId),
    );
    slugs.push(...children.map((c) => c.slug));
    frontier = children.map((c) => c.id);
  }
  return slugs;
}

export const getProductBySlugCached = unstable_cache(
  getProductBySlug,
  ["product-by-slug"],
  { tags: [PRODUCTS_TAG] },
);

export const getRelatedProducts = unstable_cache(
  async (
    categoryId: string,
    excludeId: string,
    take = 4,
  ): Promise<CatalogProduct[]> => {
    const { data, error } = await getSupabase()
      .from("products")
      .select("*, categories!inner(*), brands(name, slug)")
      .eq("active", true)
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .order("views", { ascending: false })
      .limit(take);
    if (error) throw new Error(error.message);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => ({
      ...mapProduct(r),
      category: mapCategory(r.categories),
      brandName: r.brands?.name ?? null,
      brandSlug: r.brands?.slug ?? null,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["related-products"],
  { tags: [PRODUCTS_TAG] },
);

export const getBrandProducts = unstable_cache(
  async (
    brandId: string,
    excludeId: string,
    take = 8,
  ): Promise<CatalogProduct[]> => {
    const { data, error } = await getSupabase()
      .from("products")
      .select("*, categories!inner(*), brands(name, slug)")
      .eq("active", true)
      .eq("brand_id", brandId)
      .neq("id", excludeId)
      .order("views", { ascending: false })
      .limit(take);
    if (error) throw new Error(error.message);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => ({
      ...mapProduct(r),
      category: mapCategory(r.categories),
      brandName: r.brands?.name ?? null,
      brandSlug: r.brands?.slug ?? null,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["brand-products"],
  { tags: [PRODUCTS_TAG] },
);

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCollectionRow(r: any): Collection {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    imageUrl: r.image_url ?? "",
    startsAt: r.starts_at ?? null,
    endsAt: r.ends_at ?? null,
    productIds: [],
    isSchoolList: r.is_school_list ?? false,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Yayın penceresindeki koleksiyonu slug ile getirir (yoksa null). */
export const getCollectionBySlug = unstable_cache(
  async (slug: string): Promise<Collection | null> => {
    const now = new Date().toISOString();
    let query = getSupabase()
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapCollectionRow(data);
  },
  ["collection-by-slug"],
  { tags: [COLLECTIONS_TAG] },
);

/** Yayın penceresindeki koleksiyonu id ile getirir (yoksa null). */
export const getCollectionById = unstable_cache(
  async (id: string): Promise<Collection | null> => {
    const now = new Date().toISOString();
    const { data, error } = await getSupabase()
      .from("collections")
      .select("*")
      .eq("id", id)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapCollectionRow(data);
  },
  ["collection-by-id"],
  { tags: [COLLECTIONS_TAG] },
);

/** Sitemap için: aktif ürünlerin yalnızca slug + güncelleme tarihi. */
export async function getProductsForSitemap(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("slug, updated_at")
    .eq("active", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    slug: r.slug as string,
    updatedAt: (r.updated_at as string | null) ?? null,
  }));
}

export const getActiveCollections = unstable_cache(
  async (): Promise<Collection[]> => {
    const now = new Date().toISOString();
    const { data, error } = await getSupabase()
      .from("collections")
      .select("*")
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => mapCollectionRow(r));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["active-collections"],
  { tags: [COLLECTIONS_TAG] },
);

export const getCollectionProductsCached = unstable_cache(
  getCollectionProducts,
  ["collection-products"],
  { tags: [COLLECTIONS_TAG, PRODUCTS_TAG] },
);

/** Ana sayfa bölümünden koleksiyon linki kurmak için slug çözümü. */
export const getCollectionSlugById = unstable_cache(
  async (id: string): Promise<string | null> => {
    const { data, error } = await getSupabase()
      .from("collections")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.slug as string) ?? null;
  },
  ["collection-slug-by-id"],
  { tags: [COLLECTIONS_TAG] },
);

export const SERVICES_TAG = "services";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapService(r: any): Service {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    priceLabel: r.price_label ?? "",
    unitNote: r.unit_note ?? "",
    sortOrder: r.sort_order ?? 0,
    active: r.active ?? true,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Vitrindeki aktif hizmetler (fotokopi, baskı, cilt…). */
export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const { data, error } = await getSupabase()
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name");
    if (error) throw new Error(error.message);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => mapService(r));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["services"],
  { tags: [SERVICES_TAG] },
);

/** Okul listesi koleksiyonları + ürün özetleri (tek tıkla ekleme için). */
export const getSchoolLists = unstable_cache(
  async (): Promise<SchoolList[]> => {
    const { data: cols, error } = await getSupabase()
      .from("collections")
      .select("id, name, slug, description")
      .eq("is_school_list", true)
      .order("created_at");
    if (error) throw new Error(error.message);
    if (!cols || cols.length === 0) return [];

    const ids = cols.map((c: { id: string }) => c.id);
    const { data: links, error: lErr } = await getSupabase()
      .from("collection_products")
      .select("collection_id, products(id, name, slug, price, sku, stock, active)")
      .in("collection_id", ids)
      .order("position");
    if (lErr) throw new Error(lErr.message);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    return cols.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      products: (links ?? [])
        .filter((l: any) => l.collection_id === c.id && l.products?.active)
        .map((l: any) => ({
          id: l.products.id,
          name: l.products.name,
          slug: l.products.slug,
          price: l.products.price,
          sku: l.products.sku ?? "",
          stock: l.products.stock ?? 0,
        })),
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  ["school-lists"],
  { tags: [COLLECTIONS_TAG, PRODUCTS_TAG] },
);
