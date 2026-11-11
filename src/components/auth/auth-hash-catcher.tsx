"use client";

import { useEffect } from "react";

/**
 * Supabase e-posta linkleri (recovery / invite / magic) bazen Site URL köküne
 * `#access_token=...` ile düşer. Hash sunucuya gitmez; buradan callback'e taşırız.
 */
export function AuthHashCatcher() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (!hash.includes("access_token")) return;
    if (pathname.startsWith("/auth/")) return;
    window.location.replace(`/auth/callback${search}${hash}`);
  }, []);

  return null;
}
