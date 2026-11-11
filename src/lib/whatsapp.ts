import type { ListItem } from "@/lib/list";

/**
 * Düzgün formatlı Türkçe WhatsApp liste mesajı:
 * ürün adı, varyant, adet, SKU ve ürün notları.
 */
export function buildListMessage(
  items: ListItem[],
  shopName: string,
): string {
  const lines = items.map((i) => {
    const variant = i.variant ? ` (${i.variant})` : "";
    const sku = i.sku ? ` — ${i.sku}` : "";
    const note = i.note?.trim() ? `\n   Not: ${i.note.trim()}` : "";
    return `• ${i.name}${variant} × ${i.quantity}${sku}${note}`;
  });
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  return [
    `Merhaba ${shopName}! Listemi gönderiyorum:`,
    "",
    ...lines,
    "",
    `Toplam ${totalQty} ürün. Hazırlayınca haber verir misiniz?`,
  ].join("\n");
}

export function buildListWhatsAppUrl(
  items: ListItem[],
  shopName: string,
  whatsapp: string,
): string | null {
  if (!whatsapp) return null;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(buildListMessage(items, shopName))}`;
}
