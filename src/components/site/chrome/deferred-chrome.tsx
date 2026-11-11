"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PageWipe = dynamic(
  () => import("./page-wipe").then((m) => m.PageWipe),
  { ssr: false },
);
const CustomCursor = dynamic(
  () => import("./custom-cursor").then((m) => m.CustomCursor),
  { ssr: false },
);
const ScrollRuler = dynamic(
  () => import("./scroll-ruler").then((m) => m.ScrollRuler),
  { ssr: false },
);

/** İlk boyama sonrası (idle) yüklenen süs chrome — LCP'yi meşgul etmesin. */
export function DeferredChrome() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(run, { timeout: 2500 });
      return () =>
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;
  return (
    <>
      <PageWipe />
      <CustomCursor />
      <ScrollRuler />
    </>
  );
}
