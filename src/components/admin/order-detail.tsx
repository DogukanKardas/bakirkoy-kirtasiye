"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Order, OrderItem } from "@db/queries";
import { formatDateTimeTR, formatPrice } from "@/lib/format";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { ABadge, AButton, ACard, ASelect } from "./ui";

export function OrderDetail({ order }: { order: Order & { items: OrderItem[] } }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await updateOrderStatusAction({ id: order.id, status });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Durum güncellendi");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/siparisler"
            className="text-xs text-[var(--ink-muted)] underline-offset-4 hover:underline"
          >
            ← Siparişler
          </Link>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            {formatDateTimeTR(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ABadge tone={order.paymentStatus === "paid" ? "green" : order.paymentStatus === "failed" ? "red" : "yellow"}>
            Ödeme: {order.paymentStatus === "paid" ? "alındı" : order.paymentStatus === "failed" ? "başarısız" : "bekliyor"}
          </ABadge>
          <ABadge tone="neutral">
            {order.deliveryMethod === "pickup" ? "Mağazadan teslim" : "Kargo"}
          </ABadge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ACard className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            Müşteri
          </h2>
          <p className="mt-3 font-medium">{order.customerName}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{order.email}</p>
          <p className="text-sm text-[var(--ink-soft)]">{order.phone}</p>
          {order.note ? (
            <p className="mt-3 border-t border-[var(--line)] pt-3 text-sm italic text-[var(--ink-soft)]">
              “{order.note}”
            </p>
          ) : null}
        </ACard>

        <ACard className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            Teslimat & ödeme
          </h2>
          {order.deliveryMethod === "pickup" ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Mağazadan elden teslim alınacak.
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              {order.address}
              <br />
              {order.city}
            </p>
          )}
          <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-muted)]">
            <p>Sağlayıcı: {order.paymentProvider ?? "—"}</p>
            {order.paymentTransactionId ? (
              <p className="mt-0.5 font-[family-name:var(--font-mono)]">
                İşlem: {order.paymentTransactionId}
              </p>
            ) : null}
          </div>
        </ACard>
      </div>

      <ACard className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
          Kalemler
        </h2>
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2.5 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-[family-name:var(--font-mono)]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-[var(--line)] pt-4 text-right">
          <span className="price-tag">Toplam {formatPrice(order.total)}</span>
        </p>
      </ACard>

      <ACard className="flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            Sipariş durumu
          </label>
          <ASelect value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </ASelect>
        </div>
        <AButton onClick={save} disabled={pending || status === order.status}>
          {pending ? "Kaydediliyor…" : "Durumu kaydet"}
        </AButton>
      </ACard>
    </div>
  );
}
