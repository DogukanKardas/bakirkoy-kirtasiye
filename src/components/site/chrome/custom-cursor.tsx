"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Özel imleç: küçük mürekkep noktası + takip eden ince halka.
 * Yalnız ince işaretçili (fare) cihazlarda; metin alanlarında gizlenir.
 * Native cursor `html.custom-cursor` altında gizlenir.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 900, damping: 60, mass: 0.4 });
  const dotY = useSpring(y, { stiffness: 900, damping: 60, mass: 0.4 });
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      setHovering(
        !!t.closest("a, button, [role='button'], label, [data-cursor='link']"),
      );
      setTextMode(
        !!t.closest("input, textarea, select, [contenteditable='true']"),
      );
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* halka */}
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[95]"
      >
        <motion.div
          animate={{
            scale: textMode ? 0 : hovering ? 1.9 : down ? 0.8 : 1,
            opacity: textMode ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`-ml-4 -mt-4 h-8 w-8 rounded-full border ${
            hovering
              ? "border-[var(--ink)] bg-[var(--accent)]/40"
              : "border-[var(--ink)]/60"
          }`}
        />
      </motion.div>
      {/* mürekkep noktası */}
      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY }}
        className="pointer-events-none fixed left-0 top-0 z-[95]"
      >
        <motion.div
          animate={{ scale: textMode ? 0 : down ? 1.6 : 1, opacity: textMode ? 0 : 1 }}
          className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
        />
      </motion.div>
    </>
  );
}
