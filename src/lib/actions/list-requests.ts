"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "preparing", "ready", "delivered"]),
});

/** Admin: yüklenen liste fotoğrafı için kısa ömürlü imzalı URL üretir. */
export async function getListPhotoUrlAction(
  path: string,
): Promise<{ ok: true; url: string } | { error: string }> {
  try {
    await requireAdmin();
    if (!path || path.includes("..")) return { error: "Geçersiz yol" };
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.storage
      .from("list-uploads")
      .createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) return { error: error?.message ?? "Üretilemedi" };
    return { ok: true, url: data.signedUrl };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}

export async function updateListRequestStatusAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success) return { error: "Geçersiz durum" };
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from("list_requests")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };

    await logAudit(
      supabase,
      admin.email,
      "status",
      "list_request",
      parsed.data.id,
      { status: parsed.data.status },
    );
    revalidatePath("/admin/listeler");
    return { ok: true };
  } catch {
    return { error: "Yetkiniz yok" };
  }
}
