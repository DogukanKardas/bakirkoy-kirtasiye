"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/format";
import { getServerSupabase } from "@/lib/supabase-server";
import { PRODUCTS_TAG } from "@db/queries";

/** Public katalog + ürün sayfaları tag bazlı yenilenir. */
function revalidateProducts() {
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
  revalidatePath("/");
}

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().default(""),
  sku: z.string().min(2),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  images: z
    .array(z.object({ url: z.string(), alt: z.string().default("") }))
    .default([]),
  variants: z.array(z.object({ name: z.string() })).default([]),
  active: z.boolean().default(true),
});

function toRow(p: z.infer<typeof productSchema>) {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    category_id: p.categoryId,
    brand_id: p.brandId ?? null,
    tags: p.tags,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    images: p.images,
    variants: p.variants,
    active: p.active,
    image_url: p.images[0]?.url ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function saveProductAction(
  input: unknown,
): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ürün bilgileri eksik veya hatalı" };
    }
    const supabase = await getServerSupabase();
    const row = toRow(parsed.data);

    if (parsed.data.id) {
      const { error } = await supabase
        .from("products")
        .update(row)
        .eq("id", parsed.data.id);
      if (error) return { error: "Kaydedilemedi: SKU benzersiz olmalı" };
      await logAudit(supabase, admin.email, "update", "product", parsed.data.id, {
        name: row.name,
      });
      revalidateProducts();
      return { ok: true, id: parsed.data.id };
    }

    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) {
      return { error: "Kaydedilemedi: SKU veya slug benzersiz olmalı" };
    }
    await logAudit(supabase, admin.email, "create", "product", data.id, {
      name: row.name,
    });
    revalidateProducts();
    return { ok: true, id: data.id };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "Yetkiniz yok" };
    }
    return { error: "Beklenmeyen hata" };
  }
}

export async function deleteProductsAction(
  ids: string[],
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from("products")
      .update({ active: false, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "delete", "product", ids.join(","));
    revalidateProducts();
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function bulkProductsAction(input: {
  ids: string[];
  op: "show" | "hide" | "delete" | "category" | "price_percent" | "price_amount";
  value?: string;
}): Promise<{ ok: true; count?: number } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const { ids, op, value } = input;
    if (!ids.length) return { error: "Ürün seçilmedi" };
    const supabase = await getServerSupabase();

    if (op === "show" || op === "hide" || op === "delete") {
      const active = op === "show";
      const { error } = await supabase
        .from("products")
        .update({ active, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) return { error: error.message };
    } else if (op === "category") {
      if (!value) return { error: "Kategori gerekli" };
      const { error } = await supabase
        .from("products")
        .update({ category_id: value, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) return { error: error.message };
    } else {
      const numeric = Number(String(value ?? "0").replace(",", "."));
      if (Number.isNaN(numeric)) return { error: "Geçersiz değer" };
      const { data: rows, error: readErr } = await supabase
        .from("products")
        .select("id, price")
        .in("id", ids);
      if (readErr) return { error: readErr.message };
      for (const row of rows ?? []) {
        const next =
          op === "price_percent"
            ? Math.max(1, Math.round(row.price * (1 + numeric / 100)))
            : Math.max(1, row.price + Math.round(numeric * 100));
        await supabase
          .from("products")
          .update({ price: next, updated_at: new Date().toISOString() })
          .eq("id", row.id);
      }
    }

    await logAudit(supabase, admin.email, `bulk_${op}`, "product", ids.join(","), {
      value: value ?? null,
    });
    revalidateProducts();
    return { ok: true, count: ids.length };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

const importRowSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
  description: z.string().default(""),
  category_slug: z.string().default(""),
  brand_slug: z.string().default(""),
  active: z.boolean().default(true),
});

export async function importProductsAction(input: {
  rows: unknown[];
  mode: "insert" | "update_sku" | "upsert";
}): Promise<
  | { ok: true; inserted: number; updated: number; skipped: number }
  | { error: string }
> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();

    const { data: cats } = await supabase.from("categories").select("id, slug");
    const { data: brands } = await supabase.from("brands").select("id, slug");
    const catMap = new Map((cats ?? []).map((c) => [c.slug, c.id]));
    const brandMap = new Map((brands ?? []).map((b) => [b.slug, b.id]));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const raw of input.rows) {
      const parsed = importRowSchema.safeParse(raw);
      if (!parsed.success) {
        skipped++;
        continue;
      }
      const r = parsed.data;
      const categoryId = r.category_slug
        ? catMap.get(r.category_slug)
        : catMap.values().next().value;
      if (!categoryId) {
        skipped++;
        continue;
      }
      const base = {
        name: r.name,
        description: r.description,
        price: r.price,
        stock: r.stock,
        category_id: categoryId,
        brand_id: r.brand_slug ? (brandMap.get(r.brand_slug) ?? null) : null,
        active: r.active,
        updated_at: new Date().toISOString(),
      };

      if (input.mode === "insert") {
        const slug = `${slugify(r.name)}-${Date.now().toString(36)}${inserted}`;
        const { error } = await supabase
          .from("products")
          .insert({ ...base, sku: r.sku, slug });
        if (error) skipped++;
        else inserted++;
      } else {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("sku", r.sku)
          .maybeSingle();
        if (existing) {
          await supabase.from("products").update(base).eq("id", existing.id);
          updated++;
        } else if (input.mode === "upsert") {
          const slug = `${slugify(r.name)}-${Date.now().toString(36)}${inserted}`;
          const { error } = await supabase
            .from("products")
            .insert({ ...base, sku: r.sku, slug });
          if (error) skipped++;
          else inserted++;
        } else {
          skipped++;
        }
      }
    }

    await logAudit(supabase, admin.email, "import", "product", null, {
      mode: input.mode,
      inserted,
      updated,
      skipped,
    });
    revalidateProducts();
    return { ok: true, inserted, updated, skipped };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function generateSlug(name: string) {
  return slugify(name);
}
