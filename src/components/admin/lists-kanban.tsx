"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ListRequest } from "@db/queries";
import {
  getListPhotoUrlAction,
  updateListRequestStatusAction,
} from "@/lib/actions/list-requests";
import { ABadge, AButton, ACard, AModal } from "./ui";

const STATUSES: {
  key: ListRequest["status"];
  label: string;
  tone: "blue" | "yellow" | "green" | "neutral";
}[] = [
  { key: "new", label: "Yeni", tone: "blue" },
  { key: "preparing", label: "Hazırlanıyor", tone: "yellow" },
  { key: "ready", label: "Hazır", tone: "green" },
  { key: "delivered", label: "Teslim", tone: "neutral" },
];

function nextStatus(s: ListRequest["status"]): ListRequest["status"] | null {
  const i = STATUSES.findIndex((x) => x.key === s);
  return i < STATUSES.length - 1 ? STATUSES[i + 1].key : null;
}

function prevStatus(s: ListRequest["status"]): ListRequest["status"] | null {
  const i = STATUSES.findIndex((x) => x.key === s);
  return i > 0 ? STATUSES[i - 1].key : null;
}

/** Not alanındaki [foto:yol] işaretini yakalar; imzalı URL ile açar. */
function NoteBlock({ note }: { note: string }) {
  const [busy, setBusy] = useState(false);
  const match = note.match(/\[foto:([^\]\s]+)\]/);
  const photoPath = match?.[1] ?? null;
  const cleanNote = note.replace(/\[foto:[^\]\s]+\]\n?/, "").trim();

  const openPhoto = async () => {
    if (!photoPath) return;
    setBusy(true);
    const res = await getListPhotoUrlAction(photoPath);
    setBusy(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    window.open(res.url, "_blank", "noreferrer");
  };

  return (
    <div className="mt-3 space-y-2">
      {photoPath ? (
        <AButton variant="outline" onClick={openPhoto} disabled={busy}>
          {busy ? "Açılıyor…" : "📷 Liste fotoğrafını aç"}
        </AButton>
      ) : null}
      {cleanNote ? (
        <p className="rounded bg-[var(--paper-deep)] p-2.5 text-sm">
          <strong>Not:</strong> {cleanNote}
        </p>
      ) : null}
    </div>
  );
}

export function ListsKanban({
  requests,
  shopName,
}: {
  requests: ListRequest[];
  shopName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<ListRequest | null>(null);

  const move = (req: ListRequest, status: ListRequest["status"]) => {
    startTransition(async () => {
      const res = await updateListRequestStatusAction({ id: req.id, status });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(
          `"${req.customerName}" → ${STATUSES.find((s) => s.key === status)?.label}`,
        );
        setDetail((d) => (d && d.id === req.id ? { ...d, status } : d));
        router.refresh();
      }
    });
  };

  const readyMessage = (req: ListRequest) => {
    const text = `Merhaba ${req.customerName}, ${shopName} olarak listenizi hazırladık. Dükkândan teslim alabilirsiniz. Teşekkürler!`;
    const phone = req.phone.replace(/\D/g, "").replace(/^0/, "90");
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Liste Talepleri
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          {requests.length} talep • kartlara tıklayıp detayı görün
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((col) => {
          const items = requests.filter((r) => r.status === col.key);
          return (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <ABadge tone={col.tone}>{items.length}</ABadge>
              </div>
              <div className="min-h-32 space-y-2 rounded-lg border border-dashed border-[var(--line)] p-2">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-[var(--ink-muted)]">
                    Boş
                  </p>
                )}
                {items.map((req) => (
                  <ACard key={req.id} className="p-3">
                    <button
                      onClick={() => setDetail(req)}
                      className="block w-full text-left"
                    >
                      <p className="truncate font-medium">{req.customerName}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {req.items.length} kalem •{" "}
                        {new Date(req.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/Istanbul",
                        })}
                      </p>
                    </button>
                    <div className="mt-2 flex items-center gap-1">
                      {prevStatus(req.status) && (
                        <button
                          disabled={pending}
                          onClick={() => move(req, prevStatus(req.status)!)}
                          className="rounded border border-[var(--line)] px-1.5 py-0.5 text-xs transition hover:border-[var(--ink)]"
                          title="Geri al"
                        >
                          ←
                        </button>
                      )}
                      {nextStatus(req.status) && (
                        <button
                          disabled={pending}
                          onClick={() => move(req, nextStatus(req.status)!)}
                          className="flex-1 rounded bg-[var(--ink)] px-1.5 py-0.5 text-xs font-medium text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
                        >
                          {STATUSES.find((s) => s.key === nextStatus(req.status))?.label} →
                        </button>
                      )}
                    </div>
                  </ACard>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.customerName} — Liste` : ""}
        wide
      >
        {detail && (
          <div className="space-y-4">
            <div className="print-sheet">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{detail.customerName}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {detail.phone} •{" "}
                    {new Date(detail.createdAt).toLocaleString("tr-TR", {
                      timeZone: "Europe/Istanbul",
                    })}
                  </p>
                </div>
                <ABadge
                  tone={STATUSES.find((s) => s.key === detail.status)?.tone}
                >
                  {STATUSES.find((s) => s.key === detail.status)?.label}
                </ABadge>
              </div>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-xs text-[var(--ink-muted)]">
                    <th className="py-1.5">Ürün</th>
                    <th className="w-16 py-1.5 text-right">Adet</th>
                    <th className="no-print w-16 py-1.5 text-right">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item, i) => (
                    <tr key={i} className="border-b border-[var(--line)]">
                      <td className="py-1.5">
                        {item.name}
                        {item.variant ? (
                          <span className="text-[var(--ink-soft)]">
                            {" "}
                            ({item.variant})
                          </span>
                        ) : null}
                        {item.sku ? (
                          <span className="ml-2 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                            {item.sku}
                          </span>
                        ) : null}
                        {item.note ? (
                          <span className="block text-xs text-[var(--ink-muted)]">
                            Not: {item.note}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-1.5 text-right font-[family-name:var(--font-mono)]">
                        {item.quantity}
                      </td>
                      <td className="no-print py-1.5 text-right">☐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detail.note ? <NoteBlock note={detail.note} /> : null}
            </div>

            <div className="no-print flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
              {nextStatus(detail.status) && (
                <AButton
                  disabled={pending}
                  onClick={() => move(detail, nextStatus(detail.status)!)}
                >
                  {STATUSES.find((s) => s.key === nextStatus(detail.status))?.label}{" "}
                  yap →
                </AButton>
              )}
              {detail.status === "ready" && (
                <a
                  href={readyMessage(detail)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  WhatsApp: &quot;Listeniz hazır&quot;
                </a>
              )}
              <AButton variant="outline" onClick={() => window.print()}>
                Yazdır
              </AButton>
            </div>
          </div>
        )}
      </AModal>
    </div>
  );
}
