import { getSiteUrl } from "@/lib/env";

/** Her çağrıda güncel env okur (build/runtime farkı için). */
export function siteUrl(): string {
  return getSiteUrl();
}

/** Geriye dönük: tercih siteUrl(). */
export const SITE_URL = getSiteUrl();

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
