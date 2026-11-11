"use client";

import Link from "next/link";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Step = { title: string; text: string };

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.li
      className="relative border border-[var(--line)] bg-[var(--paper)] p-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, ease: EASE, delay: 0.35 + index * 0.16 }}
    >
      <span
        className="font-[family-name:var(--font-display)] text-5xl leading-none text-transparent"
        style={{ WebkitTextStroke: "1.25px var(--ink)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
        {step.text}
      </p>
    </motion.li>
  );
}

export function ListCtaSection({
  heading,
  text,
  steps,
  whatsapp,
}: {
  heading: string;
  text: string;
  steps: Step[];
  whatsapp: string;
}) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--paper-deep)]/45">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Okul listesi servisi
          </p>
          <h2 className="display-2 mt-4 text-[var(--ink)]">{heading}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink-soft)]">
            {text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  "Merhaba, okul listemi gönderiyorum.",
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
              >
                Listeyi WhatsApp&rsquo;tan gönder
              </a>
            ) : null}
            <Link
              href="/liste"
              className="border border-[var(--ink)] px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
            >
              Sitede listemi oluşturuyorum
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* adımları bağlayan mürekkep çizgisi: görünür olunca çizilir */}
          <motion.span
            className="absolute -left-6 top-6 hidden h-[calc(100%-3rem)] w-px origin-top bg-[var(--ink)] lg:block"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
            aria-hidden
          />
          <ol className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
