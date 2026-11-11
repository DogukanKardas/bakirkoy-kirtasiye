/**
 * Sipariş durumu sabitleri — hem sunucu (server actions) hem istemci
 * (admin tablo/detay) bileşenleri kullanır. "use server" dosyasından
 * client'a sabit export edilemediği için ayrı modülde tutulur.
 */

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Yeni",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  cancelled: "İptal",
};

/** Bilinmeyen/bozuk durum değerlerinde ham metni döner. */
export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}
