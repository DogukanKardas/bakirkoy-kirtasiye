"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydrated } from "@/lib/use-hydrated";
import { getOpenState } from "@/lib/shop-hours";
import type { Hours, HoursException } from "@db/queries";

/** Canlı rozet: her dakika yeniden hesaplar. */
function OpenBadge({
  hours,
  exceptions,
}: {
  hours: Hours;
  exceptions: HoursException[];
}) {
  const [state, setState] = useState<{ open: boolean; todayLabel: string } | null>(null);

  useEffect(() => {
    const compute = () => setState(getOpenState(hours, exceptions));
    compute();
    const t = window.setInterval(compute, 60_000);
    return () => window.clearInterval(t);
  }, [hours, exceptions]);

  return (
    <span className="inline-flex items-center gap-2.5 border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm">
      <span className="relative flex h-2 w-2">
        {state?.open ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-60" />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            state === null
              ? "bg-[var(--ink-muted)]"
              : state.open
                ? "bg-green-700"
                : "bg-red-700"
          }`}
        />
      </span>
      <span className="font-medium text-[var(--ink)]">
        {state === null
          ? "Çalışma saatleri"
          : state.open
            ? "Şu an açığız"
            : "Şu an kapalıyız"}
      </span>
      {state ? (
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
          {state.todayLabel}
        </span>
      ) : null}
    </span>
  );
}

/** Atmosfer kolajı: fotoğraflar varsa onlar, yoksa tipografik paneller; katmanlar farklı hızda akar. */
function ParallaxCollage({ images }: { images: string[] }) {
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yBack = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yMid = useTransform(scrollYProgress, [0, 1], [90, -30]);
  const yFront = useTransform(scrollYProgress, [0, 1], [130, -15]);

  const panel = (src: string | null, cls: string, label: string) =>
    src ? (
      <div className={`${cls} relative`}>
        <Image src={src} alt={label} fill sizes="(max-width: 640px) 60vw, 30vw" className="object-cover" />
      </div>
    ) : (
      <div className={`${cls} ruled flex items-end bg-[var(--paper-deep)] p-4`}>
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {label}
        </span>
      </div>
    );

  return (
    <div ref={ref} className="relative h-[26rem] sm:h-[30rem]" aria-hidden={!images.length}>
      <motion.div
        style={hydrated ? { y: yBack } : { y: 50 }}
        className="absolute left-0 top-6 w-[62%]"
      >
        {panel(images[0] ?? null, "aspect-[4/5] w-full border border-[var(--line)]", "raf aralığı · fotoğraf yakında")}
      </motion.div>
      <motion.div
        style={hydrated ? { y: yMid } : { y: 90 }}
        className="absolute right-0 top-0 w-[46%]"
      >
        {panel(images[1] ?? null, "aspect-square w-full border border-[var(--line)]", "tezgâh · fotoğraf yakında")}
      </motion.div>
      <motion.div
        style={hydrated ? { y: yFront } : { y: 130 }}
        className="absolute bottom-0 right-[16%] w-[38%]"
      >
        {images[2] ? (
          <div className="relative aspect-[3/4] w-full border border-[var(--line)]">
            <Image
              src={images[2]}
              alt="Dükkândan bir köşe"
              fill
              sizes="(max-width: 640px) 60vw, 30vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[3/4] w-full items-center justify-center border border-[var(--ink)] bg-[var(--accent)]">
            <span className="font-[family-name:var(--font-display)] text-4xl italic text-[var(--ink)]">
              {new Date().getFullYear() - 1984}&nbsp;yıldır
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function ShopSection({
  heading,
  text,
  address,
  district,
  city,
  hours,
  exceptions,
  mapEmbedUrl,
  images,
}: {
  heading: string;
  text: string;
  address: string;
  district: string;
  city: string;
  hours: Hours;
  exceptions: HoursException[];
  mapEmbedUrl: string;
  images: string[];
}) {
  const mapsHref =
    mapEmbedUrl && mapEmbedUrl.startsWith("http")
      ? mapEmbedUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${address}, ${district} ${city}`,
        )}`;

  return (
    <section className="overflow-hidden border-b border-[var(--line)]">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Dükkân
          </p>
          <h2 className="display-2 mt-4 text-[var(--ink)]">{heading}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink-soft)]">
            {text}
          </p>
          <div className="mt-7">
            <OpenBadge hours={hours} exceptions={exceptions} />
          </div>
          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Adres
            </p>
            <p className="mt-2 leading-relaxed text-[var(--ink)]">
              {address}
              <br />
              {district} / {city}
            </p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block border-b border-[var(--ink)] pb-0.5 text-sm font-medium transition hover:bg-[var(--accent)]"
            >
              Haritada aç →
            </a>
          </div>
        </div>
        <ParallaxCollage images={images} />
      </div>
    </section>
  );
}
