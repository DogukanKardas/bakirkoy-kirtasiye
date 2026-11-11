"use client";

import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import { useHydrated } from "@/lib/use-hydrated";

const HeroCanvas = lazy(() => import("./hero-canvas"));

/** Masaüstü + hareket izni varsa 3D; değilse hafif fallback. */
function Hero3DStage() {
  const [mode, setMode] = useState<"pending" | "canvas" | "fallback">("pending");

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    setMode(!reduced && !mobile && !saveData ? "canvas" : "fallback");
  }, []);

  return (
    <div
      data-hero-stage
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {mode === "canvas" ? (
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      ) : null}
      {mode === "fallback" ? <StaticObjects /> : null}
    </div>
  );
}

function StaticObjects() {
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div
        style={hydrated ? { y: y1, rotate: 24 } : { rotate: 24 }}
        className="absolute right-[8%] top-[16%] h-40 w-3.5 rounded-full bg-[#f2c14e] sm:h-56"
      >
        <span className="absolute -bottom-5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[18px] border-x-transparent border-t-[var(--ink)]" />
      </motion.div>
      <motion.div
        style={hydrated ? { y: y2, rotate: -8 } : { rotate: -8 }}
        className="absolute left-[4%] top-[52%] h-24 w-20 rounded-[2px] border border-[var(--ink)] bg-[#8a2f24] sm:h-32 sm:w-28"
      >
        <span className="absolute inset-y-0 left-1.5 w-[3px] bg-[var(--ink)]" />
      </motion.div>
      <motion.div
        style={hydrated ? { y: y3, rotate: 10 } : { rotate: 10 }}
        className="absolute bottom-[14%] right-[16%] h-4 w-36 bg-[#dcae7e] sm:w-48"
      >
        <span className="absolute inset-x-2 top-0 flex justify-between">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-1.5 w-px bg-[var(--ink)]" />
          ))}
        </span>
      </motion.div>
    </div>
  );
}

function ScrollIndicator() {
  const hydrated = useHydrated();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 90], [1, 0]);
  return (
    <motion.div
      style={hydrated ? { opacity } : { opacity: 1 }}
      className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      aria-hidden
    >
      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
        kaydır
      </span>
      <span className="relative h-10 w-px overflow-hidden bg-[var(--line)]">
        <motion.span
          className="absolute left-0 top-0 h-4 w-px bg-[var(--ink)]"
          animate={{ y: [-16, 40] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

export function HeroEffects() {
  return (
    <>
      <Hero3DStage />
      <ScrollIndicator />
    </>
  );
}
