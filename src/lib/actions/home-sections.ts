"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.record(z.string(), z.unknown()),
  enabled: z.boolean(),
});

export async function updateHomeSectionAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { error: "Geçersiz bölüm" };
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from("home_sections")
      .update({
        title: parsed.data.title,
        content: parsed.data.content,
        enabled: parsed.data.enabled,
      })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };

    await logAudit(supabase, admin.email, "update", "home_section", parsed.data.id);
    revalidatePath("/");
    revalidatePath("/admin/ana-sayfa");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function reorderHomeSectionsAction(
  orderedIds: string[],
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    for (let i = 0; i < orderedIds.length; i++) {
      await supabase
        .from("home_sections")
        .update({ position: i })
        .eq("id", orderedIds[i]);
    }
    await logAudit(supabase, admin.email, "reorder", "home_section", null);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
