"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";
import { SERVICES_TAG } from "@db/queries";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  description: z.string().default(""),
  priceLabel: z.string().default(""),
  unitNote: z.string().default(""),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

function revalidateServices() {
  revalidateTag(SERVICES_TAG, { expire: 0 });
  revalidatePath("/admin/hizmetler");
  revalidatePath("/hizmetler");
}

export async function upsertServiceAction(
  input: unknown,
): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = upsertSchema.safeParse(input);
    if (!parsed.success) return { error: "Hizmet adı gerekli" };
    const supabase = await getServerSupabase();

    const row = {
      name: parsed.data.name,
      description: parsed.data.description,
      price_label: parsed.data.priceLabel,
      unit_note: parsed.data.unitNote,
      sort_order: parsed.data.sortOrder,
      active: parsed.data.active,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("services")
        .update(row)
        .eq("id", parsed.data.id);
      if (error) return { error: error.message };
      await logAudit(supabase, admin.email, "update", "service", parsed.data.id);
      revalidateServices();
      return { ok: true, id: parsed.data.id };
    }

    const { data, error } = await supabase
      .from("services")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Kaydedilemedi" };
    await logAudit(supabase, admin.email, "create", "service", data.id);
    revalidateServices();
    return { ok: true, id: data.id };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function deleteServiceAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "delete", "service", id);
    revalidateServices();
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
