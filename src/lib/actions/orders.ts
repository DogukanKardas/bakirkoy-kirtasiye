"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ORDER_STATUSES } from "@/lib/order-status";
import { getServerSupabase } from "@/lib/supabase-server";

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatusAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success) return { error: "Geçersiz durum" };
    const supabase = await getServerSupabase();
    const { error } = await supabase
      .from("orders")
      .update({
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };
    await logAudit(supabase, admin.email, "status", "order", parsed.data.id, {
      status: parsed.data.status,
    });
    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${parsed.data.id}`);
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
