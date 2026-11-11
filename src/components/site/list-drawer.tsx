"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { listRowId, useList, type ListItem } from "@/lib/list";
import type { FlyDetail } from "@/lib/fly-to-list";
import { buildListWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { submitListRequest } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------- uçan kâğıt katmanı ---------------- */

type FlyingPaper = FlyDetail & { id: number };

function FlyLayer({
  targetRef,
  onLanded,
}: {
  targetRef: React.RefObject<HTMLButtonElement | null>;
  onLanded: () => void;
}) {
  const [papers, setPapers] = useState<FlyingPaper[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onFly = (e: Event) => {
      const detail = (e as CustomEvent<FlyDetail>).detail;
      if (!detail) return;
      idRef.current += 1;
      const id = idRef.current;
      setPapers((p) => [...p, { ...detail, id }]);
    };
    window.addEventListener("bk-fly-to-list", onFly);
    return () => window.removeEventListener("bk-fly-to-list", onFly);
  }, []);

  return (
    <>
      {papers.map((p) => {
        const target = targetRef.current?.getBoundingClientRect();
        const dx = target ? target.left + target.width / 2 - p.x : 0;
        const dy = target ? target.top + target.height / 2 - p.y : 0;
        return (
          <motion.div
            key={p.id}
            aria-hidden
            initial={{
              x: p.x,
              y: p.y,
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: p.x + dx,
              y: p.y + dy,
              scale: 0.25,
              rotate: dx > 0 ? 14 : -14,
              opacity: [1, 1, 0.9],
            }}
            transition={{ duration: 0.75, ease: EASE, times: [0, 0.7, 1] }}
            onAnimationComplete={() => {
              setPapers((prev) => prev.filter((q) => q.id !== p.id));
              onLanded();
            }}
            className="pointer-events-none fixed left-0 top-0 z-[85] -translate-x-1/2 -translate-y-1/2"
          >
            <span className="block max-w-[9rem] truncate border border-[var(--ink)] bg-[var(--accent)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold shadow-[2px_3px_0_rgba(21,21,21,0.7)]">
              {p.label}
            </span>
          </motion.div>
        );
      })}
    </>
  );
}

/* ---------------- satır ---------------- */

function DrawerRow({ item }: { item: ListItem }) {
  const { updateQty, updateNote, removeItem } = useList();
  const rowId = listRowId(item);

  return (
    <li className="border-b border-[var(--line)] py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/urun/${item.slug}`}
            className="block truncate font-medium text-[var(--ink)] hover:bg-[var(--accent)]"
          >
            {item.name}
          </Link>
          <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-muted)]">
            {item.variant ? `${item.variant} · ` : ""}
            {item.sku || "—"} · {formatPrice(item.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => removeItem(rowId)}
          aria-label={`${item.name} satırını sil`}
          className="shrink-0 text-xs text-red-700 hover:underline"
        >
          Sil
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
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
        <input
          value={item.note ?? ""}
          onChange={(e) => updateNote(rowId, e.target.value)}
          placeholder="Not: renk, beden…"
          className="min-w-0 flex-1 border-b border-dashed border-[var(--line)] bg-transparent px-1 py-1.5 text-xs outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--ink)]"
        />
      </div>
    </li>
  );
}

/* ---------------- forma gönder ---------------- */

export function SendListForm({
  items,
  shopName,
  onSent,
}: {
  items: ListItem[];
  shopName: string;
  onSent: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return setError("Adınızı yazın");
    if (phone.replace(/\D/g, "").length < 10)
      return setError("Geçerli bir telefon numarası yazın");
    if (!kvkk) return setError("Devam etmek için KVKK onayı gerekli");
    setBusy(true);
    setError("");
    const res = await submitListRequest({
      customer_name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        ...(i.sku ? { sku: i.sku } : {}),
        ...(i.variant ? { variant: i.variant } : {}),
        ...(i.note?.trim() ? { note: i.note.trim() } : {}),
      })),
    });
    setBusy(false);
    if ("error" in res) return setError("Gönderilemedi, lütfen tekrar deneyin");
    setDone(true);
    onSent();
  };

  if (done) {
    return (
      <div className="border border-emerald-700/40 bg-emerald-50 p-4 text-sm text-emerald-900">
        Listeniz {shopName} paneline düştü. Hazır olunca sizi arayacağız —
        teşekkürler!
      </div>
    );
  }

  return (
    <div className="space-y-2.5 border border-[var(--line)] bg-[var(--paper-deep)]/50 p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Adınız Soyadınız"
        autoComplete="name"
        className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Telefon (05xx…)"
        inputMode="tel"
        autoComplete="tel"
        className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not (ops.): teslim alacağınız gün…"
        rows={2}
        className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
      />
      <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">
        <input
          type="checkbox"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--ink)]"
        />
        <span>
          Adım ve telefon numaramın liste talebimin hazırlanması amacıyla
          işlenmesini{" "}
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
        className="w-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)] disabled:opacity-50"
      >
        {busy ? "Gönderiliyor…" : "Dükkâna gönder"}
      </button>
    </div>
  );
}

/* ---------------- ana host: sticky note + çekmece ---------------- */

export function ListDrawerHost({
  whatsapp,
  shopName,
}: {
  whatsapp: string;
  shopName: string;
}) {
  const { items, count, total, ready, drawerOpen, setDrawerOpen, clear } =
    useList();
  const noteRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [landedTick, setLandedTick] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  // esc ile kapat + scroll kilidi (Lenis dahil) + açılışta odağı çekmeceye al
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const lenis = (window as unknown as { __bkLenis?: { stop: () => void; start: () => void } })
      .__bkLenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 350);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  const onLanded = useCallback(() => setLandedTick((t) => t + 1), []);

  const waUrl = buildListWhatsAppUrl(items, shopName, whatsapp);

  return (
    <>
      <FlyLayer targetRef={noteRef} onLanded={onLanded} />

      {/* sticky note butonu */}
      <motion.button
        ref={noteRef}
        type="button"
        data-list-note
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-expanded={drawerOpen}
        animate={landedTick ? { scale: [1, 1.18, 0.94, 1], rotate: [-4, 2, -5, -4] } : {}}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed right-4 z-[60] flex h-20 w-20 rotate-[-4deg] flex-col items-center justify-center bg-[var(--accent)] text-[var(--ink)] shadow-[3px_4px_0_rgba(21,21,21,0.85)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--accent)] max-sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:right-6"
      >
        <span className="font-[family-name:var(--font-mono)] text-2xl leading-none">
          {ready ? count : 0}
        </span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
          Listem
        </span>
      </motion.button>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[64] bg-[var(--ink)]/35 backdrop-blur-[2px]"
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Alışveriş listem"
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="fixed bottom-0 right-0 top-0 z-[65] flex w-full max-w-md flex-col border-l-2 border-[var(--ink)] bg-[var(--paper)]"
            >
              {/* başlık */}
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                    Alışveriş listesi
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                    Listem · {count} ürün
                  </h2>
                </div>
                <button
                  type="button"
                  ref={closeRef}
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Çekmeceyi kapat"
                  className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-lg transition hover:bg-[var(--accent)]"
                >
                  ×
                </button>
              </div>

              {/* içerik */}
              <div className="flex-1 overflow-y-auto px-5">
                {!ready ? (
                  <p className="py-10 text-sm text-[var(--ink-muted)]">
                    Yükleniyor…
                  </p>
                ) : items.length === 0 ? (
                  <div className="py-10">
                    <p className="text-[var(--ink-soft)]">
                      Listeniz boş — raflardan bir şeyler seçin.
                    </p>
                    <div className="mt-5 flex flex-col gap-2.5">
                      <Link
                        href="/urunler"
                        onClick={() => setDrawerOpen(false)}
                        className="border border-[var(--ink)] px-4 py-2.5 text-center text-sm font-medium transition hover:bg-[var(--accent)]"
                      >
                        Kataloğa göz at
                      </Link>
                      <Link
                        href="/liste"
                        onClick={() => setDrawerOpen(false)}
                        className="px-4 py-2 text-center text-sm text-[var(--ink-soft)] underline-offset-4 hover:underline"
                      >
                        Hazır okul listeleri & fotoğrafla liste →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <ul>
                    {items.map((item) => (
                      <DrawerRow key={listRowId(item)} item={item} />
                    ))}
                  </ul>
                )}
              </div>

              {/* alt blok */}
              {ready && items.length > 0 ? (
                <div className="space-y-3 border-t-2 border-[var(--ink)] px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Yaklaşık tutar
                    </span>
                    <span className="price-tag text-sm">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full bg-[var(--ink)] px-5 py-3.5 text-center text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
                    >
                      WhatsApp&rsquo;tan Gönder
                    </a>
                  ) : null}

                  {formOpen ? (
                    <SendListForm
                      items={items}
                      shopName={shopName}
                      onSent={() => {
                        clear();
                        setFormOpen(false);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormOpen(true)}
                      className="w-full border border-[var(--ink)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--accent)]"
                    >
                      Forma Gönder (WhatsApp&rsquo;sız)
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <Link
                      href="/liste"
                      onClick={() => setDrawerOpen(false)}
                      className="text-[var(--ink-soft)] underline-offset-4 hover:underline"
                    >
                      Tam sayfa düzenle
                    </Link>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-[var(--ink-muted)] underline-offset-4 hover:text-red-700 hover:underline"
                    >
                      Listeyi temizle
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
