"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { fetchSearchHits } from "@/lib/catalog-api";
import { formatPrice } from "@/lib/format";
import type { Category, SearchHit } from "@db/queries";

const RECENT_KEY = "bk-recent-searches";

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  try {
    const list = [q, ...readRecent().filter((x) => x !== q)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* sessiz */
  }
}

export function SearchOverlay({
  categories,
  showPrices,
}: {
  categories: Category[];
  showPrices: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openOverlay = useCallback(() => {
    setRecent(readRecent());
    setOpen(true);
  }, []);

  /* ⌘K / Ctrl+K + header'dan gelen custom event */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => (prev ? prev : true));
        setRecent(readRecent());
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => openOverlay();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, [openOverlay]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* anlık arama (debounce) */
  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetchSearchHits(q, 8);
        setHits(res);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const go = (term: string) => {
    pushRecent(term.trim());
    setOpen(false);
    setQ("");
    setHits([]);
  };

  const submit = () => {
    if (!q.trim()) return;
    const term = q.trim();
    go(term);
    router.push(`/urunler?ara=${encodeURIComponent(term)}`);
  };

  const popular = categories.filter((c) => !c.parentId).slice(0, 6);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-[var(--paper)]/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Ürün arama"
        >
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-8 sm:py-14">
            <div className="flex items-center gap-3 border-b-2 border-[var(--ink)] pb-4">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 text-[var(--ink)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="Defter, kalem, çanta ara…"
                className="w-full bg-transparent font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]/60 sm:text-3xl"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--ink-muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
              >
                ESC
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pb-10">
              {q.trim() ? (
                searching && hits.length === 0 ? (
                  <p className="py-8 text-center font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                    Aranıyor…
                  </p>
                ) : hits.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                      &ldquo;{q}&rdquo; için sonuç yok
                    </p>
                    <p className="mt-2 text-sm text-[var(--ink-muted)]">
                      Farklı bir kelime deneyin ya da kataloğa göz atın.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--line)]">
                    {hits.map((hit) => (
                      <li key={hit.id}>
                        <Link
                          href={`/urun/${hit.slug}`}
                          onClick={() => go(q)}
                          className="flex items-center gap-4 py-3 transition hover:bg-[var(--paper-deep)]/60"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[var(--paper-deep)]">
                            {hit.imageUrl ? (
                              <Image
                                src={hit.imageUrl}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center font-[family-name:var(--font-display)] text-xl italic text-[var(--ink)]/20">
                                {hit.name.slice(0, 1)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-[var(--ink)]">
                              {hit.name}
                            </p>
                            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                              {hit.categoryName}
                              {hit.stock <= 0 ? " · Tükendi" : ""}
                            </p>
                          </div>
                          {showPrices ? (
                            <span className="price-tag shrink-0 text-sm">
                              {formatPrice(hit.price)}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={submit}
                        className="text-sm text-[var(--ink-muted)] underline underline-offset-4 hover:text-[var(--ink)]"
                      >
                        &ldquo;{q}&rdquo; için tüm sonuçları katalogda gör →
                      </button>
                    </li>
                  </ul>
                )
              ) : (
                <div className="space-y-8">
                  {recent.length > 0 ? (
                    <div>
                      <p className="mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                        Son aramalar
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQ(term)}
                            className="border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <p className="mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Popüler kategoriler
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {popular.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/kategori/${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="border border-[var(--line)] px-4 py-3 text-sm text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
