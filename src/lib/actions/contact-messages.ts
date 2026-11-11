"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";

const schema = z.object({ id: z.string().uuid(), read: z.boolean() });

export async function setContactMessageReadAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { error: "Geçersiz kayıt" };
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: parsed.data.read })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "update", "contact_message", parsed.data.id, {
      read: parsed.data.read,
    });
    revalidatePath("/admin/mesajlar");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function deleteContactMessageAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "delete", "contact_message", id);
    revalidatePath("/admin/mesajlar");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
