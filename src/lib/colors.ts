/** Bilinen renk adları → hex. Varyant noktaları ve renk filtresi için. */
export const KNOWN_COLORS: Record<string, string> = {
  "kırmızı": "#dc2626",
  kirmizi: "#dc2626",
  bordo: "#9f1239",
  pembe: "#ec4899",
  turuncu: "#ea580c",
  "sarı": "#eab308",
  sari: "#eab308",
  "yeşil": "#16a34a",
  yesil: "#16a34a",
  turkuaz: "#0d9488",
  mavi: "#2563eb",
  lacivert: "#1e3a8a",
  mor: "#9333ea",
  "lila": "#c084fc",
  kahverengi: "#92400e",
  bej: "#d6c7a1",
  gri: "#6b7280",
  siyah: "#171717",
  beyaz: "#fafafa",
};

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

/** Bir etiket/varyant adı içinde bilinen renk varsa hex döndürür. */
export function colorHexFor(name: string): string | null {
  const n = normalize(name);
  for (const [key, hex] of Object.entries(KNOWN_COLORS)) {
    if (n.includes(normalize(key))) return hex;
  }
  return null;
}

/** Renk filtresi noktaları için: facets listesinden paletle eşleşenleri çıkarır. */
export function matchFacetColors(
  facetNames: string[],
): { name: string; hex: string }[] {
  const seen = new Map<string, string>();
  for (const facet of facetNames) {
    const hex = colorHexFor(facet);
    if (hex) {
      // kanonik görünen ad: normalize edilmiş renk anahtarı
      const n = normalize(facet);
      const key =
        Object.keys(KNOWN_COLORS).find((k) => n.includes(normalize(k))) ??
        facet;
      const canon = key
        .replaceAll("kirmizi", "kırmızı")
        .replaceAll("sari", "sarı")
        .replaceAll("yesil", "yeşil");
      if (!seen.has(canon)) seen.set(canon, hex);
    }
  }
  return [...seen.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export { normalize as normalizeTr };
