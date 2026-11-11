"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { AButton, ACard, AInput } from "@/components/admin/ui";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı");
      return;
    }
    if (password !== password2) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    setBusy(true);
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Şifre güncellenemedi: " + error.message);
      return;
    }
    toast.success("Şifre kaydedildi");
    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper-deep)] p-4">
      <Toaster richColors position="bottom-right" />
      <ACard className="w-full max-w-sm p-6">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
          Yönetim Paneli
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Yeni şifre
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Hesabınız için yeni bir şifre belirleyin.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <AInput
            label="Yeni şifre"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <AInput
            label="Yeni şifre (tekrar)"
            type="password"
            required
            minLength={8}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
          <AButton type="submit" disabled={busy} className="w-full">
            {busy ? "Kaydediliyor…" : "Şifreyi kaydet"}
          </AButton>
        </form>
      </ACard>
    </main>
  );
}
