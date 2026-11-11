/**
 * Ortam değişkenleri — Vercel + lokal.
 * Vercel Supabase entegrasyonu bazen NEXT_PUBLIC_ öneki olmadan yazar;
 * sunucu tarafında ikisini de kabul ederiz. Tarayıcı için NEXT_PUBLIC_ şart.
 */

export function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  return url.replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

/** Canonical site adresi (OG, sitemap, auth redirect). */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (explicit) return explicit;
  // Vercel otomatik verir (protokol yok)
  const vercel = process.env.VERCEL_URL?.replace(/\/+$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3001";
}
