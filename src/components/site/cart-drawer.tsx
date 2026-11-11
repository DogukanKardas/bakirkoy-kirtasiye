"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { FlyDetail } from "@/lib/fly-to-list";

const EASE = [0.16, 1, 0.3, 1] as const;
const BUTTON_SELECTOR = "[data-cart-button]";

type FlyingPaper = FlyDetail & { id: number };

/* ---------------- uçan kâğıt katmanı (list-drawer ile aynı desen) ---------------- */

function FlyLayer({ onLanded }: { onLanded: () => void }) {
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
    window.addEventListener("bk-fly-to-cart", onFly);
    return () => window.removeEventListener("bk-fly-to-cart", onFly);
  }, []);

  return (
    <>
      {papers.map((p) => {
        const target = document
          .querySelector(BUTTON_SELECTOR)
          ?.getBoundingClientRect();
        const dx = target ? target.left + target.width / 2 - p.x : 0;
        const dy = target ? target.top + target.height / 2 - p.y : 0;
        return (
          <motion.div
            key={p.id}
            aria-hidden
            initial={{ x: p.x, y: p.y, scale: 1, rotate: 0, opacity: 1 }}
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

/* ---------------- header butonu (site-header içinde render edilir) ---------------- */

export function CartDrawerButton() {
  const { count, drawerOpen, setDrawerOpen } = useCart();
  const [landedTick, setLandedTick] = useState(0);

  // butonun kendi bounce'ı: FlyLayer inişini window event'iyle dinler
  useEffect(() => {
    const onLanded = () => setLandedTick((t) => t + 1);
    window.addEventListener("bk-cart-landed", onLanded);
    return () => window.removeEventListener("bk-cart-landed", onLanded);
  }, []);

  return (
    <motion.button
      type="button"
      data-cart-button
      onClick={() => setDrawerOpen(!drawerOpen)}
      aria-label={`Sepet çekmecesi, ${count} ürün`}
      aria-expanded={drawerOpen}
      animate={landedTick ? { scale: [1, 1.22, 0.94, 1] } : {}}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative font-medium text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
    >
      Sepet
      {count > 0 ? (
        <span className="absolute -right-3.5 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--paper)]">
          {count}
        </span>
      ) : null}
    </motion.button>
  );
}

/* ---------------- satır ---------------- */

function DrawerRow({ item }: { item: CartItem }) {
  const { updateQty, removeItem } = useCart();

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
            {item.sku || "—"} · {formatPrice(item.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          aria-label={`${item.name} ürününü sepetten sil`}
          className="shrink-0 text-xs text-[var(--ink-muted)] underline-offset-4 hover:text-red-700 hover:underline"
        >
          Sil
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="inline-flex items-center border border-[var(--line)]">
          <button
            type="button"
            onClick={() => updateQty(item.productId, item.quantity - 1)}
            aria-label="Azalt"
            className="px-2.5 py-1 text-sm transition hover:bg-[var(--accent)]"
          >
            −
          </button>
          <span className="min-w-8 px-1 text-center font-[family-name:var(--font-mono)] text-sm">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQty(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label="Artır"
            className="px-2.5 py-1 text-sm transition hover:bg-[var(--accent)] disabled:opacity-40"
          >
            +
          </button>
        </div>
        <span className="price-tag text-xs">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </li>
  );
}

/* ---------------- çekmece hostu (site layout'ta render edilir) ---------------- */

export function CartDrawerHost() {
  const { items, count, total, drawerOpen, setDrawerOpen, clear } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  const onLanded = useCallback(() => {
    window.dispatchEvent(new Event("bk-cart-landed"));
  }, []);

  // esc ile kapat + scroll kilidi (Lenis dahil) + açılışta odağı çekmeceye al
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const lenis = (window as unknown as {
      __bkLenis?: { stop: () => void; start: () => void };
    }).__bkLenis;
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

  return (
    <>
      <FlyLayer onLanded={onLanded} />

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
              aria-label="Sepetim"
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="fixed bottom-0 right-0 top-0 z-[65] flex w-full max-w-md flex-col border-l-2 border-[var(--ink)] bg-[var(--paper)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                    Alışveriş sepeti
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                    Sepet · {count} ürün
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

              <div className="flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                  <div className="py-10">
                    <p className="text-[var(--ink-soft)]">
                      Sepetiniz boş — raflardan bir şeyler seçin.
                    </p>
                    <Link
                      href="/urunler"
                      onClick={() => setDrawerOpen(false)}
                      className="mt-5 block border border-[var(--ink)] px-4 py-2.5 text-center text-sm font-medium transition hover:bg-[var(--accent)]"
                    >
                      Kataloğa göz at
                    </Link>
                  </div>
                ) : (
                  <ul>
                    {items.map((item) => (
                      <DrawerRow key={item.productId} item={item} />
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 ? (
                <div className="space-y-3 border-t-2 border-[var(--ink)] px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Ara toplam
                    </span>
                    <span className="price-tag text-sm">{formatPrice(total)}</span>
                  </div>
                  <Link
                    href="/odeme"
                    onClick={() => setDrawerOpen(false)}
                    className="block w-full bg-[var(--ink)] px-5 py-3.5 text-center text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
                  >
                    Ödemeye geç
                  </Link>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <Link
                      href="/sepet"
                      onClick={() => setDrawerOpen(false)}
                      className="text-[var(--ink-soft)] underline-offset-4 hover:underline"
                    >
                      Sepet sayfası
                    </Link>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-[var(--ink-muted)] underline-offset-4 hover:text-red-700 hover:underline"
                    >
                      Sepeti boşalt
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
