"use client";

import { useState } from "react";
import { submitContactMessage } from "@db/queries";

export function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return setError("Adınızı yazın");
    if (contact.trim().length < 5)
      return setError("Telefon ya da e-posta yazın");
    if (message.trim().length < 5) return setError("Mesajınızı yazın");
    if (!kvkk) return setError("Devam etmek için KVKK onayı gerekli");
    setBusy(true);
    setError("");
    const res = await submitContactMessage({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
    });
    setBusy(false);
    if ("error" in res) return setError("Gönderilemedi, lütfen tekrar deneyin");
    setDone(true);
  };

  if (done) {
    return (
      <div className="border border-emerald-700/40 bg-emerald-50 p-5 text-sm text-emerald-900">
        Mesajınız dükkâna ulaştı. En kısa sürede size döneceğiz — teşekkürler!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Adınız Soyadınız"
        autoComplete="name"
        className="w-full border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
      />
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Telefon ya da e-posta"
        autoComplete="tel"
        className="w-full border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesajınız…"
        rows={5}
        className="w-full border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
      />
      <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">
        <input
          type="checkbox"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--ink)]"
        />
        <span>
          Paylaştığım bilgilerin mesajımın yanıtlanması amacıyla işlenmesini
          KVKK kapsamında kabul ediyorum.
        </span>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="w-full bg-[var(--ink)] px-5 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)] disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {busy ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>
    </div>
  );
}
