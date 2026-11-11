"use client";

import { motion } from "motion/react";
import type { Service } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fiyat/ölçü kartları: dükkândaki fiyat listesi kartları gibi. */
export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <div className="mt-10 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <motion.article
          key={s.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: EASE, delay: (i % 3) * 0.07 }}
          className="group relative flex min-h-[13rem] flex-col justify-between bg-[var(--paper)] p-6 transition-colors hover:bg-[var(--accent)]/15"
        >
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]">
              {s.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {s.description}
            </p>
          </div>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="price-tag text-base">{s.priceLabel}</span>
            {s.unitNote ? (
              <span className="text-xs text-[var(--ink-muted)]">
                {s.unitNote}
              </span>
            ) : null}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
