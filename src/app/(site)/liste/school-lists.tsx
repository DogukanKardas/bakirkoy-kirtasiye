"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useList } from "@/lib/list";
import { flyToList } from "@/lib/fly-to-list";
import { formatPrice } from "@/lib/format";
import type { SchoolList } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

function SchoolListCard({ list, index }: { list: SchoolList; index: number }) {
  const { addMany, setDrawerOpen } = useList();
  const [added, setAdded] = useState(false);

  const totalQty = list.products.length;
  const approx = list.products.reduce((s, p) => s + p.price, 0);

  const addAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    addMany(
      list.products.map((p) => ({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        sku: p.sku,
      })),
    );
    const rect = e.currentTarget.getBoundingClientRect();
    flyToList({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      label: `${list.name} (${totalQty} kalem)`,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className="flex flex-col border border-[var(--line)] bg-[var(--paper)]"
    >
      <div className="border-b border-[var(--line)] p-5">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {String(index + 1).padStart(2, "0")} · {totalQty} kalem
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]">
          {list.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {list.description}
        </p>
      </div>
      <ul className="flex-1 space-y-1.5 p-5 text-sm text-[var(--ink-soft)]">
        {list.products.slice(0, 5).map((p) => (
          <li key={p.id} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">{p.name}</span>
            <span className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
              {formatPrice(p.price)}
            </span>
          </li>
        ))}
        {list.products.length > 5 ? (
          <li className="text-xs text-[var(--ink-muted)]">
            + {list.products.length - 5} kalem daha
          </li>
        ) : null}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] p-5">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
          ≈ {formatPrice(approx)}
        </span>
        <button
          type="button"
          onClick={addAll}
          className={`border border-[var(--ink)] px-4 py-2.5 text-sm font-semibold transition ${
            added ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]"
          }`}
        >
          {added ? "Listende ✓" : "Tek tıkla ekle"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="sr-only"
      >
        Listeyi aç
      </button>
    </motion.article>
  );
}

export function SchoolLists({ lists }: { lists: SchoolList[] }) {
  if (lists.length === 0) return null;
  return (
    <section className="mt-14">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        Hazır sınıf listeleri
      </p>
      <h2 className="display-3 mt-3 text-[var(--ink)]">
        Öğretmen listesi hazır geldi
      </h2>
      <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
        Dükkânda en çok istenen sınıf listelerini hazırladık. Tek tıkla
        listenize ekleyin; çıkarmak istediklerinizi sonra düzenleyin.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((l, i) => (
          <SchoolListCard key={l.id} list={l} index={i} />
        ))}
      </div>
    </section>
  );
}
