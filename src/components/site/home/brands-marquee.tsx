"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useVelocity,
} from "motion/react";
import type { Brand } from "@db/queries";

/**
 * Marka şeridi: temel hızda akar; kullanıcı scroll yaptıkça hızlanır,
 * scroll yönüne göre yön değiştirir. Transform-only, layout yok.
 */
export function BrandsMarquee({
  brands,
  label,
}: {
  brands: Brand[];
  label: string;
}) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const halfWidth = useRef(1);
  const direction = useRef(1);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) halfWidth.current = el.scrollWidth / 2 || 1;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [brands.length]);

  useAnimationFrame((_, delta) => {
    const v = velocity.get();
    if (Math.abs(v) > 12) direction.current = v > 0 ? 1 : -1;
    const boost = Math.min(Math.abs(v) / 900, 5);
    const speed = (0.055 + boost * 0.12) * delta; // px/ms
    let next = x.get() - speed * direction.current;
    const half = halfWidth.current;
    // sar: [-half, 0) aralığında tut
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  if (!brands.length) return null;

  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {brands.map((brand) => (
        <Link
          key={`${brand.id}-${ariaHidden ? "b" : "a"}`}
          href={`/urunler?marka=${brand.slug}`}
          tabIndex={ariaHidden ? -1 : undefined}
          className="group flex items-baseline gap-3 px-8 py-6 sm:px-12"
        >
          <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]/70 transition-colors duration-300 group-hover:text-[var(--ink)] sm:text-5xl">
            {brand.name}
          </span>
          <span className="text-xl text-[var(--accent-2)]/50">✳</span>
        </Link>
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden border-b border-[var(--line)] py-2">
      <p className="mx-auto w-full max-w-7xl px-4 pt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)] sm:px-6">
        {label}
      </p>
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <motion.div style={{ x }} className="flex w-max">
          {row(false)}
          {row(true)}
        </motion.div>
      </div>
    </section>
  );
}
