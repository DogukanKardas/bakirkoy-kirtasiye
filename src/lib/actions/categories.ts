"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/format";
import { getServerSupabase } from "@/lib/supabase-server";
import { PRODUCTS_TAG } from "@db/queries";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  parentId: z.string().uuid().nullable(),
  imageUrl: z.string().default(""),
});

export async function upsertCategoryAction(
  input: unknown,
): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = upsertSchema.safeParse(input);
    if (!parsed.success) return { error: "Kategori adı gerekli" };
    const supabase = await getServerSupabase();

    const row = {
      name: parsed.data.name,
      parent_id: parsed.data.parentId,
      image_url: parsed.data.imageUrl,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("categories")
        .update(row)
        .eq("id", parsed.data.id);
      if (error) return { error: error.message };
      await logAudit(supabase, admin.email, "update", "category", parsed.data.id, {
        name: row.name,
      });
      revalidateTag("categories", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
      revalidatePath("/admin/kategoriler");
      return { ok: true, id: parsed.data.id };
    }

    const slug = `${slugify(parsed.data.name)}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...row, slug })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Kaydedilemedi" };
    await logAudit(supabase, admin.email, "create", "category", data.id, {
      name: row.name,
    });
    revalidateTag("categories", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
    revalidatePath("/admin/kategoriler");
    return { ok: true, id: data.id };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if (count && count > 0) {
      return { error: `Bu kategoride ${count} ürün var; önce ürünleri taşıyın.` };
    }

    await supabase
      .from("categories")
      .update({ parent_id: null })
      .eq("parent_id", id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };

    await logAudit(supabase, admin.email, "delete", "category", id);
    revalidateTag("categories", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
    revalidatePath("/admin/kategoriler");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function reorderCategoriesAction(
  items: { id: string; parentId: string | null; position: number }[],
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    for (const item of items) {
      await supabase
        .from("categories")
        .update({ parent_id: item.parentId, position: item.position })
        .eq("id", item.id);
    }
    await logAudit(supabase, admin.email, "reorder", "category", null, {
      count: items.length,
    });
    revalidateTag("categories", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
