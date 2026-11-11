"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Scroll cetveli: sayfanın sağ kenarında cetvel; sayfa yüksekliğini
 * "santim"e çevirir, mürekkep işareti ilerlemeyi gösterir.
 * Yalnız geniş ekranda ve reduced-motion kapalıyken görünür.
 */
export function ScrollRuler() {
  const hydrated = useHydrated();
  const [cm, setCm] = useState(0);
  const [enabled, setEnabled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.4,
  });
  const needleTop = useTransform(progress, [0, 1], ["0%", "100%"]);
  const currentCm = useTransform(progress, (v) => Math.round(v * cm));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1280px)").matches;
    if (reduced || !wide) return;
    setEnabled(true);

    const measure = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      // her viewport yüksekliği bir A4 boyu (29.7cm) sayılır
      setCm(Math.max(1, Math.round((total / window.innerHeight) * 29.7)));
    };
    measure();
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 1200); // geç yüklenen içerik için
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  if (!enabled || !hydrated || cm <= 1) return null;

  const ticks = Array.from({ length: cm + 1 }, (_, i) => i);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-10 right-4 top-10 z-30 w-10"
    >
      {/* cetvel gövdesi */}
      <div className="absolute inset-y-0 right-3 w-px bg-[var(--ink)]/25" />
      {ticks.map((i) => {
        const major = i % 5 === 0;
        return (
          <div
            key={i}
            className="absolute right-3 flex items-center justify-end gap-1"
            style={{ top: `${(i / cm) * 100}%` }}
          >
            {major ? (
              <span className="font-[family-name:var(--font-mono)] text-[8px] text-[var(--ink-muted)]">
                {i}
              </span>
            ) : null}
            <span
              className={`h-px bg-[var(--ink)]/45 ${major ? "w-2.5" : "w-1.5"}`}
            />
          </div>
        );
      })}
      {/* mürekkep işareti */}
      <motion.div
        style={{ top: needleTop }}
        className="absolute right-1 flex -translate-y-1/2 items-center"
      >
        <span className="mr-0.5 border-y-[5px] border-r-[7px] border-y-transparent border-r-[var(--accent-2)]" />
      </motion.div>
      {/* güncel cm etiketi */}
      <motion.div
        style={{ top: needleTop }}
        className="absolute right-5 -translate-y-1/2"
      >
        <motion.span className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--ink-soft)]">
          {currentCm}
        </motion.span>
      </motion.div>
    </div>
  );
}
