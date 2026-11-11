"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      {/* mürekkep lekesi */}
      <svg
        viewBox="0 0 200 200"
        aria-hidden
        className="h-40 w-40 sm:h-48 sm:w-48"
      >
        <path
          d="M99 22c30 4 52 22 60 48 8 25 0 54-18 72-19 18-48 26-73 18-26-8-44-30-48-57-4-28 8-56 30-70 14-9 32-13 49-11Z"
          fill="var(--paper-deep)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M70 90c10-8 26-10 34-2s6 22-2 28-22 4-28-4-6-16 6-20"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="142" cy="60" r="5" fill="var(--ink)" opacity="0.35" />
        <circle cx="52" cy="150" r="4" fill="var(--ink)" opacity="0.3" />
        <circle cx="158" cy="140" r="3" fill="var(--ink)" opacity="0.25" />
      </svg>
      <p className="mt-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
        Bir şeyler ters gitti
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">
        Mürekkep sayfaya döküldü.
      </h1>
      <p className="mt-4 max-w-md text-[var(--ink-soft)]">
        Sayfa yüklenirken beklenmedik bir hata oldu. Kurutma kâğıdıyla
        uğraşırken siz yeniden deneyebilirsiniz.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
        >
          Yeniden dene
        </button>
        <Link
          href="/"
          className="border border-[var(--ink)] px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
