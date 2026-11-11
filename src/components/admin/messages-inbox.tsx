"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ContactMessage } from "@db/queries";
import {
  deleteContactMessageAction,
  setContactMessageReadAction,
} from "@/lib/actions/contact-messages";
import { ABadge, AButton, ACard, AEmpty } from "./ui";

export function MessagesInbox({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggleRead = (m: ContactMessage) => {
    startTransition(async () => {
      const res = await setContactMessageReadAction({ id: m.id, read: !m.read });
      if ("error" in res) toast.error(res.error);
      else router.refresh();
    });
  };

  const remove = (m: ContactMessage) => {
    startTransition(async () => {
      const res = await deleteContactMessageAction(m.id);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Mesaj silindi");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        İletişim Mesajları
      </h1>
      {messages.length === 0 ? (
        <AEmpty>Henüz mesaj yok. İletişim formundan gönderilenler burada listelenir.</AEmpty>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <ACard key={m.id} className={`p-4 ${m.read ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{m.name}</p>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                    {m.contact}
                  </span>
                  {!m.read ? <ABadge tone="yellow">Yeni</ABadge> : null}
                </div>
                <span className="text-xs text-[var(--ink-muted)]">
                  {new Date(m.createdAt).toLocaleString("tr-TR")}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink-soft)]">
                {m.message}
              </p>
              <div className="mt-3 flex gap-1">
                <AButton variant="ghost" onClick={() => toggleRead(m)} disabled={pending}>
                  {m.read ? "Yeni olarak işaretle" : "Okundu işaretle"}
                </AButton>
                <button
                  onClick={() => remove(m)}
                  disabled={pending}
                  className="rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </ACard>
          ))}
        </div>
      )}
    </div>
  );
}
