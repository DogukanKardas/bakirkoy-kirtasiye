/**
 * Site kök adresi — canonical, OG ve sitemap için tek kaynak.
 * Production'da NEXT_PUBLIC_SITE_URL tanımlanmalı (ör. https://bakirkoykirtasiye.com).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
