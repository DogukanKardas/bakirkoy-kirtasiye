"use client";

import { memo, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useHydrated } from "@/lib/use-hydrated";

/** Tek kelime: scroll progress'inin kendi diliminde solarak koyulaşır. */
const Word = memo(function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const hydrated = useHydrated();
  // Başlangıç opaklığı ≥ ~0.55 → büyük metinde WCAG AA (~3:1) kontrast
  const opacity = useTransform(progress, range, [0.58, 1]);
  return (
    <motion.span
      style={hydrated ? { opacity } : { opacity: 0.58 }}
      className="inline-block"
    >
      {children}&nbsp;
    </motion.span>
  );
});

export function ManifestoSection({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.42"],
  });
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <section className="border-b border-[var(--line)]">
      <div
        ref={ref}
        className="mx-auto w-full max-w-5xl px-4 py-28 sm:px-6 sm:py-40"
      >
        <p className="mb-10 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
          Dükkânın sözü
        </p>
        <p className="sr-only">{text}</p>
        <p
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[clamp(1.7rem,4vw,3.1rem)] leading-[1.28] tracking-[-0.01em] text-[var(--ink)]"
        >
          {words.map((word, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, Math.min(1, (i + 1.4) / words.length)]}
            >
              {word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}
