"use server";

import { z } from "zod";
import { getSettings } from "@db/queries";
import { getSupabase } from "@/lib/supabase";
import {
  listServerCart,
  readCartToken,
  writeCartToken,
  type ServerCartItem,
} from "@/lib/cart-server";

/**
 * Sepet server action'ları. Hepsi commerce bayrağının arkasında:
 * kapalıyken hiçbir şey yapmaz ve hata döner.
 */

type CartResult =
  | { ok: true; items: ServerCartItem[] }
  | { error: string };

async function ensureToken(): Promise<string> {
  const existing = await readCartToken();
  const { data, error } = await getSupabase().rpc("cart_ensure", {
    p_token: existing,
  });
  if (error || !data) throw new Error(error?.message ?? "Sepet açılamadı");
  if (data !== existing) await writeCartToken(data);
  return data as string;
}

async function commerceOn(): Promise<boolean> {
  const settings = await getSettings();
  return settings.commerceEnabled;
}

const idSchema = z.string().uuid();

export async function addToCartAction(
  productId: unknown,
  qty = 1,
): Promise<CartResult> {
  if (!(await commerceOn())) return { error: "Satış kapalı" };
  const parsed = idSchema.safeParse(productId);
  if (!parsed.success) return { error: "Geçersiz ürün" };
  try {
    const token = await ensureToken();
    // mevcut adedi bul, üstüne ekle
    const current = (await listServerCart(token)).find(
      (i) => i.productId === parsed.data,
    );
    const { error } = await getSupabase().rpc("cart_set_item", {
      p_token: token,
      p_product_id: parsed.data,
      p_qty: Math.max(1, Math.min(Math.floor(qty) || 1, 99)) + (current?.quantity ?? 0),
    });
    if (error) return { error: error.message };
    return { ok: true, items: await listServerCart(token) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sepet hatası" };
  }
}

export async function setCartQtyAction(
  productId: unknown,
  qty: unknown,
): Promise<CartResult> {
  if (!(await commerceOn())) return { error: "Satış kapalı" };
  const parsedId = idSchema.safeParse(productId);
  const parsedQty = z.number().int().min(0).max(99).safeParse(qty);
  if (!parsedId.success || !parsedQty.success) return { error: "Geçersiz istek" };
  try {
    const token = await ensureToken();
    const { error } = await getSupabase().rpc("cart_set_item", {
      p_token: token,
      p_product_id: parsedId.data,
      p_qty: parsedQty.data,
    });
    if (error) return { error: error.message };
    return { ok: true, items: await listServerCart(token) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sepet hatası" };
  }
}

export async function removeCartItemAction(productId: unknown): Promise<CartResult> {
  if (!(await commerceOn())) return { error: "Satış kapalı" };
  const parsed = idSchema.safeParse(productId);
  if (!parsed.success) return { error: "Geçersiz ürün" };
  try {
    const token = await ensureToken();
    const { error } = await getSupabase().rpc("cart_remove_item", {
      p_token: token,
      p_product_id: parsed.data,
    });
    if (error) return { error: error.message };
    return { ok: true, items: await listServerCart(token) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sepet hatası" };
  }
}

export async function clearCartAction(): Promise<CartResult> {
  if (!(await commerceOn())) return { error: "Satış kapalı" };
  try {
    const token = await ensureToken();
    const { error } = await getSupabase().rpc("cart_clear", { p_token: token });
    if (error) return { error: error.message };
    return { ok: true, items: [] };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sepet hatası" };
  }
}
