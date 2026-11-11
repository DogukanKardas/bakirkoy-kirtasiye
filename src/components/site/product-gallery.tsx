"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ProductImage } from "@db/queries";

export function ProductGallery({
  images,
  name,
  productId,
}: {
  images: ProductImage[];
  name: string;
  productId: string;
}) {
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const hasImages = images.length > 0;
  const current = images[Math.min(active, images.length - 1)];

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }, []);

  /* mobil swipe: snap scroll pozisyonundan aktif görseli takip et */
  const onStripScroll = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive((prev) => (prev === idx ? prev : idx));
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight")
        setActive((a) => Math.min(a + 1, images.length - 1));
      if (e.key === "ArrowLeft") setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  if (!hasImages) {
    return (
      <div
        className="flex aspect-[4/3] items-end bg-[var(--paper-deep)] p-8"
        style={{ viewTransitionName: `product-${productId}` }}
        data-vt-hero={productId}
      >
        <span className="font-[family-name:var(--font-display)] text-8xl italic text-[var(--ink)]/12">
          {name.slice(0, 1)}
        </span>
      </div>
    );
  }

  const main = (
    <div
      className="relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-[var(--paper-deep)]"
      onMouseEnter={() => setZooming(true)}
      onMouseLeave={() => setZooming(false)}
      onMouseMove={onMove}
      onClick={() => setLightbox(true)}
      role="button"
      tabIndex={0}
      aria-label="Görseli büyüt"
      onKeyDown={(e) => {
        if (e.key === "Enter") setLightbox(true);
      }}
    >
      <Image
        src={current.url}
        alt={current.alt || name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover transition-transform duration-300"
        style={
          zooming
            ? { transform: "scale(1.8)", transformOrigin: origin }
            : undefined
        }
      />
    </div>
  );

  return (
    <div>
      {/* masaüstü: büyük görsel + zoom; mobil: swipe şeridi */}
      <div
        className="hidden sm:block"
        style={{ viewTransitionName: `product-${productId}` }}
        data-vt-hero={productId}
      >
        {main}
      </div>
      <div className="sm:hidden" data-vt-hero={productId}>
          <div
            ref={stripRef}
            onScroll={onStripScroll}
            className="flex snap-x snap-mandatory overflow-x-auto"
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] w-full shrink-0 snap-center bg-[var(--paper-deep)]"
              >
                <Image
                  src={img.url}
                  alt={img.alt || name}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* küçük görseller (masaüstü) */}
      {images.length > 1 ? (
        <div className="mt-4 hidden gap-3 sm:flex">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square w-20 overflow-hidden border transition ${
                i === active
                  ? "border-[var(--ink)]"
                  : "border-[var(--line)] opacity-60 hover:opacity-100"
              }`}
              aria-label={`Görsel ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* lightbox */}
      <AnimatePresence>
        {lightbox ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.img
              key={current.url}
              src={current.url}
              alt={current.alt || name}
              className="max-h-full max-w-full object-contain"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 ? (
              <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
                <button
                  type="button"
                  className="border border-white/40 px-4 py-2 text-sm text-white disabled:opacity-30"
                  disabled={active === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((a) => Math.max(a - 1, 0));
                  }}
                >
                  ← Önceki
                </button>
                <button
                  type="button"
                  className="border border-white/40 px-4 py-2 text-sm text-white disabled:opacity-30"
                  disabled={active === images.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((a) => Math.min(a + 1, images.length - 1));
                  }}
                >
                  Sonraki →
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="absolute right-4 top-4 border border-white/40 px-3 py-1.5 text-sm text-white"
              onClick={() => setLightbox(false)}
            >
              Kapat ✕
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
