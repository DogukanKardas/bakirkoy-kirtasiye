"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getServerSupabase } from "@/lib/supabase-server";
import { SETTINGS_TAG } from "@db/queries";

const daySchema = z.object({ open: z.string(), close: z.string() }).nullable();

const exceptionSchema = z.object({
  date: z.string(),
  label: z.string(),
  closed: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
});

const settingsSchema = z.object({
  shopName: z.string().min(2),
  slogan: z.string().default(""),
  logoUrl: z.string().min(1),
  logoDarkUrl: z.string().default(""),
  faviconUrl: z.string().nullable().optional(),
  ogImageUrl: z.string().default(""),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli renk kodu girin"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  showPrices: z.boolean(),
  commerceEnabled: z.boolean(),
  announcementText: z.string().default(""),
  announcementEnabled: z.boolean().default(false),
  phone: z.string().default(""),
  whatsapp: z.string().default(""),
  email: z.string().default(""),
  address: z.string().default(""),
  district: z.string().default(""),
  city: z.string().default(""),
  hours: z.record(z.string(), daySchema).default({}),
  hoursExceptions: z.array(exceptionSchema).default([]),
  mapEmbedUrl: z.string().default(""),
  instagramUrl: z.string().default(""),
  facebookUrl: z.string().default(""),
});

export async function saveSettingsAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const admin = await requireAdmin(["owner"]);
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Formda eksik veya hatalı alan var" };
    }
    const d = parsed.data;
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from("settings")
      .update({
        shop_name: d.shopName,
        slogan: d.slogan,
        logo_url: d.logoUrl,
        logo_dark_url: d.logoDarkUrl,
        favicon_url: d.faviconUrl ?? null,
        og_image_url: d.ogImageUrl,
        accent_color: d.accentColor,
        secondary_color: d.secondaryColor,
        show_prices: d.showPrices,
        commerce_enabled: d.commerceEnabled,
        announcement_text: d.announcementText,
        announcement_enabled: d.announcementEnabled,
        phone: d.phone,
        whatsapp: d.whatsapp,
        email: d.email,
        address: d.address,
        district: d.district,
        city: d.city,
        hours: d.hours,
        hours_exceptions: d.hoursExceptions,
        map_embed_url: d.mapEmbedUrl,
        instagram_url: d.instagramUrl,
        facebook_url: d.facebookUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return { error: error.message };

    await logAudit(supabase, admin.email, "update", "settings", "1");
    revalidateTag(SETTINGS_TAG, { expire: 0 });
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "Bu sayfa yalnızca owner rolüne açık" };
    }
    return { error: "Ayarlar kaydedilemedi" };
  }
}
