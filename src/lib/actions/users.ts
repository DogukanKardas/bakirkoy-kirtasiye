"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["owner", "editor"]),
});

export async function updateUserRoleAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin(["owner"]);
    const parsed = roleSchema.safeParse(input);
    if (!parsed.success) return { error: "Geçersiz rol" };
    if (parsed.data.id === admin.id) {
      return { error: "Kendi rolünüzü değiştiremezsiniz" };
    }
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };

    await logAudit(supabase, admin.email, "role", "profile", parsed.data.id, {
      role: parsed.data.role,
    });
    revalidatePath("/admin/kullanicilar");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
