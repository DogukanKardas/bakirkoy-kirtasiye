"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Mıknatıslı buton sarmalayıcı: işaretçi yaklaştıkça içerik ona doğru çekilir,
 * ayrılınca yay ile yerine oturur. Dokunmatik / reduced-motion'da pasiftir.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  /** 0-1 arası; büyük değer daha güçlü çekim */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 16, mass: 0.3 });
  const y = useSpring(rawY, { stiffness: 200, damping: 16, mass: 0.3 });
  const disabled = useRef(false);

  const check = () => {
    if (disabled.current) return true;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      disabled.current = true;
      return true;
    }
    return false;
  };

  return (
    <motion.span
      ref={ref}
      style={{ x, y }}
      className={`inline-block ${className}`}
      onPointerMove={(e) => {
        if (check()) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        rawY.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
