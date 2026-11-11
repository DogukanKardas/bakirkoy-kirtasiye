import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettings } from "@db/queries";
import { getSupabase, adminRpc } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { listServerCart, readCartToken } from "@/lib/cart-server";

/**
 * Sipariş oluşturma + ödeme denemesi.
 *
 * Güvenlik: kalemler ve fiyatlar İSTEMCİDEN ALINMAZ — cookie'deki sepet
 * token'ıyla sunucudaki carts/cart_items okunur, tutar veritabanında
 * hesaplanır (public_create_order). Kart verisi yalnızca ödeme
 * sağlayıcısına iletilir, hiçbir yere yazılmaz.
 */

const cardSchema = z.object({
  holder: z.string().min(2),
  number: z.string().min(12),
  expMonth: z.string().min(1).max(2),
  expYear: z.string().min(2).max(4),
  cvc: z.string().min(3).max(4),
});

const schema = z
  .object({
    customer_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    delivery_method: z.enum(["cargo", "pickup"]),
    address: z.string().optional(),
    city: z.string().optional(),
    note: z.string().max(500).optional(),
    payment: z.object({ card: cardSchema }),
  })
  .superRefine((v, ctx) => {
    if (v.delivery_method === "cargo") {
      if (!v.address || v.address.trim().length < 5) {
        ctx.addIssue({ code: "custom", message: "Teslimat adresi gerekli" });
      }
      if (!v.city || v.city.trim().length < 2) {
        ctx.addIssue({ code: "custom", message: "Şehir gerekli" });
      }
    }
  });

export async function POST(request: Request) {
  const settings = await getSettings();
  if (!settings.commerceEnabled) {
    return NextResponse.json({ error: "Satış kapalı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Eksik veya hatalı bilgi" },
        { status: 400 },
      );
    }

    // 1) sepet: yalnızca sunucudaki kalemler kabul edilir
    const token = await readCartToken();
    const cartItems = await listServerCart(token);
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Sepetiniz boş" }, { status: 400 });
    }

    const provider = getPaymentProvider();

    // 2) sipariş (stok kontrolü + düşümü veritabanında)
    const { data: order, error: orderErr } = await getSupabase().rpc(
      "public_create_order",
      {
        p_payload: {
          customer_name: parsed.data.customer_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          delivery_method: parsed.data.delivery_method,
          address: parsed.data.address ?? "",
          city: parsed.data.city ?? "",
          note: parsed.data.note ?? "",
          payment_provider: provider.key,
          items: cartItems.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
          })),
        },
      },
    );
    if (orderErr || !order) {
      return NextResponse.json(
        { error: orderErr?.message ?? "Sipariş oluşturulamadı" },
        { status: 400 },
      );
    }

    // 3) ödeme denemesi
    const payment = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total,
      currency: "TRY",
      customer: {
        name: parsed.data.customer_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
      },
      card: parsed.data.payment.card,
    });

    if (!payment.ok) {
      // ödeme başarısız: stok iadesi + iptal (sipariş kaydı admin'de kalır)
      await adminRpc("admin_mark_order_failed", {
        p_order_id: order.id,
        p_provider: provider.key,
      });
      return NextResponse.json(
        { error: payment.error || "Ödeme alınamadı" },
        { status: 402 },
      );
    }

    // 4) ödeme başarılı: işaretle + sepeti dönüştür
    await adminRpc("admin_mark_order_paid", {
      p_order_id: order.id,
      p_provider: provider.key,
      p_tx_id: payment.transactionId,
    });
    if (token) {
      await getSupabase().rpc("cart_convert", { p_token: token });
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      id: order.id,
      testMode: provider.testMode,
    });
  } catch {
    return NextResponse.json(
      { error: "Sipariş oluşturulamadı" },
      { status: 400 },
    );
  }
}
