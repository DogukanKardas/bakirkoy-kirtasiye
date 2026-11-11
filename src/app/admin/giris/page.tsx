"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { AButton, ACard, AInput } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Giriş başarısız: " + error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  const magicLink = async () => {
    if (!email.trim()) {
      toast.error("Önce e-posta adresinizi girin");
      return;
    }
    setBusy(true);
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Bağlantı gönderilemedi: " + error.message);
      return;
    }
    setMagicSent(true);
    toast.success("Giriş bağlantısı e-postanıza gönderildi");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper-deep)] p-4">
      <ACard className="w-full max-w-sm p-6">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
          Yönetim Paneli
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Giriş Yap
        </h1>
        <form onSubmit={login} className="mt-5 space-y-3">
          <AInput
            label="E-posta"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <AInput
            label="Şifre"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <AButton type="submit" disabled={busy} className="w-full">
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </AButton>
        </form>
        <div className="mt-4 border-t border-[var(--line)] pt-4 text-center">
          {magicSent ? (
            <p className="text-sm text-emerald-700">
              Bağlantı gönderildi — e-postanızı kontrol edin.
            </p>
          ) : (
            <button
              onClick={magicLink}
              disabled={busy}
              className="text-sm text-[var(--ink-soft)] underline underline-offset-4 transition hover:text-[var(--ink)]"
            >
              Şifresiz giriş bağlantısı gönder
            </button>
          )}
        </div>
      </ACard>
    </main>
  );
}
