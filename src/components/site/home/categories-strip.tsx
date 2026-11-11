"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import type { Category } from "@db/queries";

/** Görseli olmayan kategoriler için tipografik panel. */
function CategoryVisual({ name }: { name: string }) {
  return (
    <div className="ruled flex h-full w-full items-center justify-center bg-[var(--paper-deep)]">
      <span className="font-[family-name:var(--font-display)] text-[9rem] leading-none text-[var(--ink)] opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.28]">
        {name.charAt(0)}
      </span>
    </div>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className="group relative block h-[24rem] w-[78vw] shrink-0 snap-center overflow-hidden border border-[var(--line)] bg-[var(--paper)] sm:h-[27rem] sm:w-[26rem]"
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 78vw, 416px"
            className="object-cover"
          />
        ) : (
          <CategoryVisual name={category.name} />
        )}
      </div>
      {/* üst bilgi */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <span
          className="font-[family-name:var(--font-display)] text-6xl leading-none text-transparent sm:text-7xl"
          style={{ WebkitTextStroke: "1.5px var(--ink)" }}
        >
          {num}
        </span>
        <span className="border border-[var(--ink)] bg-[var(--paper)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Rafı aç →
        </span>
      </div>
      {/* alt başlık */}
      <div className="absolute inset-x-0 bottom-0 border-t border-[var(--line)] bg-[var(--paper)]/95 p-5 backdrop-blur-sm">
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

export function CategoriesStrip({
  categories,
  heading,
  note,
}: {
  categories: Category[];
  heading: string;
  note: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const measure = () => {
      setPinEnabled(mqDesktop.matches && mqMotion.matches);
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section
      ref={sectionRef}
      className="relative border-b border-[var(--line)]"
      style={pinEnabled ? { height: "320vh" } : undefined}
    >
      <div
        className={
          pinEnabled
            ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
            : "py-20"
        }
      >
        <div className="mx-auto mb-8 flex w-full max-w-7xl items-end justify-between px-4 sm:px-6">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              Raflar
            </p>
            <h2 className="display-3 mt-3 text-[var(--ink)]">{heading}</h2>
          </div>
          <p className="hidden max-w-[16rem] text-right text-sm text-[var(--ink-muted)] sm:block">
            {note}
          </p>
        </div>

        <motion.div
          ref={trackRef}
          style={pinEnabled ? { x } : undefined}
          className={`flex gap-5 px-4 sm:px-6 ${
            pinEnabled
              ? "w-max will-change-transform"
              : "snap-x snap-mandatory overflow-x-auto pb-4 lg:overflow-visible"
          }`}
        >
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
          {/* kapanış kartı: tüm katalog */}
          <Link
            href="/urunler"
            className="group flex h-[24rem] w-[78vw] shrink-0 snap-center flex-col items-center justify-center gap-4 border border-dashed border-[var(--ink-muted)] bg-transparent transition-colors hover:bg-[var(--accent)] sm:h-[27rem] sm:w-[26rem]"
          >
            <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Tüm katalog
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              filtrelere buradan →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
