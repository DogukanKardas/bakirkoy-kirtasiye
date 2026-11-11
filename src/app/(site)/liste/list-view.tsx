"use client";

import Link from "next/link";
import { listRowId, useList } from "@/lib/list";
import { formatPrice } from "@/lib/format";
import { buildListWhatsAppUrl } from "@/lib/whatsapp";
import { SendListForm } from "@/components/site/list-drawer";

export function ListView({
  whatsapp,
  shopName,
}: {
  whatsapp: string;
  shopName: string;
}) {
  const { items, updateQty, updateNote, removeItem, clear, total, ready } =
    useList();

  if (!ready) {
    return <p className="mt-10 text-[var(--ink-muted)]">Yükleniyor...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-[var(--ink-soft)]">Listeniz boş.</p>
        <Link
          href="/urunler"
          className="mt-4 inline-block border-b border-[var(--ink)] text-sm font-medium hover:bg-[var(--accent)]"
        >
          Ürünlere göz at
        </Link>
      </div>
    );
  }

  const waUrl = buildListWhatsAppUrl(items, shopName, whatsapp);

  return (
    <div className="mt-10">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => {
          const rowId = listRowId(item);
          return (
            <li key={rowId} className="py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/urun/${item.slug}`}
                    className="font-medium text-[var(--ink)] hover:bg-[var(--accent)]"
                  >
                    {item.name}
                    {item.variant ? (
                      <span className="text-[var(--ink-soft)]">
                        {" "}
                        ({item.variant})
                      </span>
                    ) : null}
                  </Link>
                  <p className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                    {item.sku || "—"} · {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[var(--ink)]">
                    <button
                      type="button"
                      aria-label="Azalt"
                      onClick={() => updateQty(rowId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-[var(--accent)]"
                    >
                      −
                    </button>
                    <span className="w-9 text-center font-[family-name:var(--font-mono)] text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Artır"
                      onClick={() => updateQty(rowId, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-[var(--accent)]"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(rowId)}
                    className="text-sm text-red-700 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </div>
              <input
                value={item.note ?? ""}
                onChange={(e) => updateNote(rowId, e.target.value)}
                placeholder="Not ekleyin: renk, beden, marka tercihi…"
                className="mt-2.5 w-full max-w-md border-b border-dashed border-[var(--line)] bg-transparent px-1 py-1.5 text-xs outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--ink)]"
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          Yaklaşık tutar
        </span>
        <span className="price-tag">{formatPrice(total)}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
          >
            WhatsApp&rsquo;tan Gönder
          </a>
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">
            Gönderim için dükkânın WhatsApp numarası ayarlardan eklenmeli.
          </p>
        )}
        <button
          type="button"
          onClick={clear}
          className="border border-[var(--line)] px-5 py-3 text-sm text-[var(--ink-soft)] transition hover:border-[var(--ink)]"
        >
          Listeyi temizle
        </button>
      </div>

      <div className="mt-8 max-w-md">
        <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          ya da forma gönder
        </p>
        <SendListForm items={items} shopName={shopName} onSent={clear} />
      </div>
    </div>
  );
}
