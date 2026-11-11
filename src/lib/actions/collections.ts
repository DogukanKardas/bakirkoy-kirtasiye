"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/format";
import { getServerSupabase } from "@/lib/supabase-server";
import { COLLECTIONS_TAG, PRODUCTS_TAG } from "@db/queries";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  isSchoolList: z.boolean().default(false),
});

function revalidateCollections() {
  revalidateTag(COLLECTIONS_TAG, { expire: 0 });
  revalidatePath("/admin/koleksiyonlar");
}

export async function upsertCollectionAction(
  input: unknown,
): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = upsertSchema.safeParse(input);
    if (!parsed.success) return { error: "Koleksiyon adı gerekli" };
    const supabase = await getServerSupabase();

    const row = {
      name: parsed.data.name,
      description: parsed.data.description,
      image_url: parsed.data.imageUrl,
      starts_at: parsed.data.startsAt || null,
      ends_at: parsed.data.endsAt || null,
      is_school_list: parsed.data.isSchoolList,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("collections")
        .update(row)
        .eq("id", parsed.data.id);
      if (error) return { error: error.message };
      await logAudit(supabase, admin.email, "update", "collection", parsed.data.id);
      revalidateCollections();
      return { ok: true, id: parsed.data.id };
    }

    const slug = `${slugify(parsed.data.name)}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("collections")
      .insert({ ...row, slug })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Kaydedilemedi" };
    await logAudit(supabase, admin.email, "create", "collection", data.id);
    revalidateCollections();
    return { ok: true, id: data.id };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function deleteCollectionAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "delete", "collection", id);
    revalidateCollections();
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function setCollectionProductsAction(input: {
  collectionId: string;
  productIds: string[];
}): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    await supabase
      .from("collection_products")
      .delete()
      .eq("collection_id", input.collectionId);
    if (input.productIds.length) {
      const rows = input.productIds.map((productId, i) => ({
        collection_id: input.collectionId,
        product_id: productId,
        position: i,
      }));
      const { error } = await supabase.from("collection_products").insert(rows);
      if (error) return { error: error.message };
    }
    await logAudit(
      supabase,
      admin.email,
      "set_products",
      "collection",
      input.collectionId,
      { count: input.productIds.length },
    );
    revalidateCollections();
    revalidateTag(PRODUCTS_TAG, { expire: 0 });
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
