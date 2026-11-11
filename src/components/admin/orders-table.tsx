"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Order } from "@db/queries";
import { formatDateTimeTR, formatPrice } from "@/lib/format";
import { ABadge, AEmpty, ASelect } from "./ui";
import { ORDER_STATUS_LABELS, orderStatusLabel } from "@/lib/order-status";

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
};

const STATUS_TONES: Record<string, "yellow" | "blue" | "green" | "red" | "neutral"> = {
  pending: "yellow",
  preparing: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
};

export function OrdersTable({
  orders,
  activeStatus,
}: {
  orders: Order[];
  activeStatus: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Siparişler
        </h1>
        <ASelect
          value={activeStatus}
          onChange={(e) =>
            router.push(
              e.target.value
                ? `/admin/siparisler?status=${e.target.value}`
                : "/admin/siparisler",
            )
          }
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </ASelect>
      </div>

      {orders.length === 0 ? (
        <AEmpty>
          {activeStatus
            ? "Bu durumda sipariş yok."
            : "Henüz sipariş yok. Siteden verilen siparişler burada listelenir."}
        </AEmpty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--paper-deep)]/60 text-left text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Teslimat</th>
                <th className="px-4 py-3 font-medium">Tutar</th>
                <th className="px-4 py-3 font-medium">Ödeme</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--paper-deep)]/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/siparisler/${o.id}`}
                      className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-soft)]">
                    {o.deliveryMethod === "pickup" ? "Mağazadan" : "Kargo"}
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <ABadge
                      tone={
                        o.paymentStatus === "paid"
                          ? "green"
                          : o.paymentStatus === "failed"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus}
                    </ABadge>
                  </td>
                  <td className="px-4 py-3">
                    <ABadge tone={STATUS_TONES[o.status] ?? "neutral"}>
                      {orderStatusLabel(o.status)}
                    </ABadge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-muted)]">
                    {formatDateTimeTR(o.createdAt, { year: undefined })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
