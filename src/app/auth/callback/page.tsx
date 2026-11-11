"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function hashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Giriş doğrulanıyor…");

  useEffect(() => {
    let cancelled = false;

    const finish = (path: string) => {
      if (cancelled) return;
      // Hash'i temizle
      window.history.replaceState(null, "", path);
      router.replace(path);
    };

    const run = async () => {
      try {
        const supabase = getBrowserSupabase();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hash = hashParams();
        const type =
          hash.get("type") || url.searchParams.get("type") || "";

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!,
          });
          if (error) throw error;
        } else {
          // Client zaten URL'den yakalamış olabilir
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("Oturum bulunamadı. Bağlantı süresi dolmuş olabilir.");
          }
        }

        const needsPassword =
          type === "recovery" || type === "invite" || type === "signup";
        finish(needsPassword ? "/auth/sifre-yenile" : "/admin");
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Doğrulama başarısız";
        setMessage(msg);
        setTimeout(() => finish("/admin/giris"), 2500);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper-deep)] p-4">
      <p className="text-sm text-[var(--ink-soft)]">{message}</p>
    </main>
  );
}
