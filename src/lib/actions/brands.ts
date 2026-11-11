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
  logoUrl: z.string().default(""),
});

export async function upsertBrandAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = upsertSchema.safeParse(input);
    if (!parsed.success) return { error: "Marka adı gerekli" };
    const supabase = await getServerSupabase();

    if (parsed.data.id) {
      const { error } = await supabase
        .from("brands")
        .update({ name: parsed.data.name, logo_url: parsed.data.logoUrl })
        .eq("id", parsed.data.id);
      if (error) return { error: error.message };
      await logAudit(supabase, admin.email, "update", "brand", parsed.data.id);
    } else {
      const slug = `${slugify(parsed.data.name)}-${Date.now().toString(36)}`;
      const { error } = await supabase.from("brands").insert({
        name: parsed.data.name,
        slug,
        logo_url: parsed.data.logoUrl,
      });
      if (error) return { error: error.message };
      await logAudit(supabase, admin.email, "create", "brand", null, {
        name: parsed.data.name,
      });
    }
    revalidateTag("brands", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
    revalidatePath("/admin/markalar");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function deleteBrandAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    await supabase.from("products").update({ brand_id: null }).eq("brand_id", id);
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "delete", "brand", id);
    revalidateTag("brands", { expire: 0 }); revalidateTag(PRODUCTS_TAG, { expire: 0 });
    revalidatePath("/admin/markalar");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
