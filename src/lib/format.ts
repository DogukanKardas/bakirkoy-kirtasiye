export function formatPrice(kurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(kurus / 100);
}

/**
 * Hydration-güvenli tarih: saat dilimi sabitlendiği için sunucu ve
 * istemci her ortamda aynı metni üretir (Vercel UTC'de bile).
 */
export function formatDateTimeTR(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(new Date(iso));
}

export function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
