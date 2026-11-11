import "server-only";
import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import { getSettings } from "@db/queries";

/**
 * Sunucu tarafı sepet: carts/cart_items tabloları + misafir cookie'si.
 * Cookie yalnızca rastgele bir token taşır; sepet içeriği sunucuda durur.
 * Token bilen herkes sepeti görebilir — bu yüzden 48 hex karakterli
 * tahmin edilemez bir değer ve httpOnly cookie kullanılır.
 */

export const CART_COOKIE = "bk_cart_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 gün

export type ServerCartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sku: string | null;
  quantity: number;
};

export async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function writeCartToken(token: string) {
  const store = await cookies();
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearCartToken() {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

/** Token'dan sepet kalemlerini döner (commerce kapalıysa boş). */
export async function listServerCart(token: string | null): Promise<ServerCartItem[]> {
  if (!token) return [];
  const { data, error } = await getSupabase().rpc("cart_list", {
    p_token: token,
  });
  if (error) return [];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((r) => ({
    productId: r.product_id,
    name: r.name,
    slug: r.slug,
    price: r.price,
    stock: r.stock,
    sku: r.sku ?? null,
    quantity: r.quantity,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Layout/server component girişi: commerce açıksa sepeti yükle. */
export async function getInitialCart(): Promise<ServerCartItem[]> {
  const settings = await getSettings();
  if (!settings.commerceEnabled) return [];
  return listServerCart(await readCartToken());
}
