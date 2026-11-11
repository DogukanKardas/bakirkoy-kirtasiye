"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Koleksiyon vitrini: tam ekran sahne; scroll ilerledikçe
 * görsel maskesi (clip-path inset) genişleyip tüm ekranı kaplar.
 */
export function CollectionShowcase({
  name,
  slug,
  imageUrl,
  productCount,
}: {
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}) {
  const hydrated = useHydrated();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0.12, 0.62],
    ["inset(16% 22% 16% 22%)", "inset(0% 0% 0% 0%)"],
  );
  const imgScale = useTransform(scrollYProgress, [0.12, 0.85], [1.18, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.7], [46, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);

  return (
    <section ref={ref} className="relative h-[190vh] border-b border-[var(--line)]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* genişleyen görsel maskesi */}
        <motion.div
          style={hydrated ? { clipPath } : { clipPath: "inset(16% 22% 16% 22%)" }}
          className="absolute inset-0 will-change-[clip-path]"
        >
          {imageUrl ? (
            <motion.div
              style={hydrated ? { scale: imgScale } : { scale: 1.18 }}
              className="relative h-full w-full"
            >
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            /* görsel henüz yoksa: kâğıt diliyle tipografik zemin */
            <motion.div
              style={hydrated ? { scale: imgScale } : { scale: 1.18 }}
              className="ruled flex h-full w-full items-center justify-center bg-[var(--ink)]"
            >
              <span className="font-[family-name:var(--font-display)] text-[26vw] leading-none text-[var(--paper)] opacity-[0.07]">
                {name.charAt(0)}
              </span>
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/35" />
        </motion.div>

        {/* üstünde koleksiyon adı */}
        <motion.div
          style={hydrated ? { y: textY, opacity: textOpacity } : { opacity: 0 }}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--paper)]/85">
            Koleksiyon · {productCount} ürün
          </p>
          <h2 className="display-1 mt-5 max-w-[14ch] text-[var(--paper)]">
            {name}
          </h2>
          <Link
            href={`/koleksiyon/${slug}`}
            className="mt-9 inline-block border border-[var(--paper)]/80 px-7 py-3.5 text-sm font-semibold text-[var(--paper)] backdrop-blur-sm transition hover:bg-[var(--paper)] hover:text-[var(--ink)]"
          >
            Hikâyesini oku
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
