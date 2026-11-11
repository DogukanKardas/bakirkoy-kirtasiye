import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { getOrder, getSettings } from "@db/queries";

export const metadata: Metadata = {
  title: "Sipariş Onayı",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const settings = await getSettings();
  if (!settings.commerceEnabled) notFound();

  const order = await getOrder(orderNumber);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        {paid ? "Ödeme alındı · sipariş hazırlanıyor" : "Sipariş alındı"}
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">Teşekkürler</h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        Sipariş numaranız:{" "}
        <span className="font-[family-name:var(--font-mono)] text-[var(--ink)]">
          {order.orderNumber}
        </span>
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span
          className={`border px-3 py-1.5 font-medium ${
            paid
              ? "border-emerald-700/40 bg-emerald-50 text-emerald-900"
              : "border-amber-700/40 bg-amber-50 text-amber-900"
          }`}
        >
          {paid ? "Ödeme başarılı" : "Ödeme bekleniyor"}
        </span>
        <span className="border border-[var(--line)] px-3 py-1.5 text-[var(--ink-soft)]">
          {order.deliveryMethod === "pickup" ? "Mağazadan teslim" : "Kargo ile gönderim"}
        </span>
      </div>

      <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-3 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span className="font-[family-name:var(--font-mono)]">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <span className="price-tag">Toplam {formatPrice(order.total)}</span>
      </p>

      <p className="mt-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        {order.deliveryMethod === "pickup"
          ? "Siparişiniz hazır olunca telefonla haber vereceğiz; dükkândan elden teslim alabilirsiniz."
          : "Siparişiniz hazırlanınca kargo bilgisi için size ulaşacağız."}
      </p>

      <Link
        href="/urunler"
        className="mt-8 inline-block border-b border-[var(--ink)] text-sm font-medium hover:bg-[var(--accent)]"
      >
        Alışverişe devam
      </Link>
    </div>
  );
}
