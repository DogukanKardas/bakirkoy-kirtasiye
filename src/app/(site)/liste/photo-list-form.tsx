"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { submitListRequest } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Öğretmen listesinin fotoğrafını yükleme: Supabase Storage'a (private
 * `list-uploads` bucket) gider, ardından list_requests kaydı açılır.
 * Admin panelde `[foto:yol]` işaretinden imzalı URL ile görüntülenir.
 */
export function PhotoListForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null) => {
    setError("");
    if (!f) return setFile(null);
    if (!f.type.startsWith("image/")) return setError("Lütfen bir görsel seçin");
    if (f.size > MAX_BYTES) return setError("Görsel 6 MB sınırını aşıyor");
    setFile(f);
  };

  const submit = async () => {
    if (name.trim().length < 2) return setError("Adınızı yazın");
    if (phone.replace(/\D/g, "").length < 10)
      return setError("Geçerli bir telefon numarası yazın");
    if (!file) return setError("Listenin fotoğrafını ekleyin");
    if (!kvkk) return setError("Devam etmek için KVKK onayı gerekli");

    setBusy(true);
    setError("");
    try {
      const supabase = getBrowserSupabase();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("list-uploads")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        setBusy(false);
        return setError("Fotoğraf yüklenemedi, tekrar deneyin");
      }
      const res = await submitListRequest({
        customer_name: name.trim(),
        phone: phone.trim(),
        note: `[foto:${path}]${note.trim() ? `\n${note.trim()}` : ""}`,
        items: [{ name: "Fotoğrafla iletilen okul listesi", quantity: 1 }],
      });
      setBusy(false);
      if ("error" in res) return setError("Talep oluşturulamadı, tekrar deneyin");
      setDone(true);
    } catch {
      setBusy(false);
      setError("Beklenmedik bir hata oldu, tekrar deneyin");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-14 border border-[var(--line)] bg-[var(--paper-deep)]/40"
    >
      <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Fotoğrafla liste
          </p>
          <h2 className="display-3 mt-3 text-[var(--ink)]">
            Listeyi çek, gönder
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-[var(--ink-soft)]">
            Öğretmenin verdiği listenin fotoğrafını yükleyin; biz raftan tek
            tek toplayıp fiyatını bildirelim. Fotoğrafınız yalnızca dükkân
            ekibi tarafından görülür.
          </p>
          <ol className="mt-6 space-y-2 text-sm text-[var(--ink-soft)]">
            {[
              "Listenin net bir fotoğrafını çekin",
              "Adınızı ve telefonunuzu yazın",
              "Biz toplayalım, sizi arayalım",
            ].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {done ? (
          <div className="flex items-center border border-emerald-700/40 bg-emerald-50 p-5 text-sm text-emerald-900">
            Listeniz fotoğrafıyla birlikte dükkâna ulaştı. Toplayıp sizi
            arayacağız — teşekkürler!
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-sm transition ${
                file
                  ? "border-[var(--ink)] bg-[var(--accent)]/30"
                  : "border-[var(--ink-muted)] hover:border-[var(--ink)] hover:bg-[var(--accent)]/10"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                📷
              </span>
              {file ? (
                <span className="font-medium">{file.name}</span>
              ) : (
                <span>
                  Fotoğraf seç ya da çek{" "}
                  <span className="text-[var(--ink-muted)]">(en fazla 6 MB)</span>
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
                autoComplete="name"
                className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (05xx…)"
                inputMode="tel"
                autoComplete="tel"
                className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
              />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not (ops.): sınıf, teslim alacağınız gün…"
              rows={2}
              className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
            />
            <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">
              <input
                type="checkbox"
                checked={kvkk}
                onChange={(e) => setKvkk(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--ink)]"
              />
              <span>
                Adım, telefon numaram ve yüklediğim listenin, talebimin
                hazırlanması amacıyla işlenmesini{" "}
                <Link href="/kvkk" className="underline">
                  KVKK aydınlatma metni
                </Link>{" "}
                kapsamında kabul ediyorum.
              </span>
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="w-full bg-[var(--ink)] px-5 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)] disabled:opacity-50"
            >
              {busy ? "Yükleniyor…" : "Listeyi dükkâna gönder"}
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
