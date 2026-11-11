import type { ReactNode } from "react";

/** Yasal metin sayfaları için ortak iskelet (kâğıt & mürekkep dili). */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        {eyebrow}
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">{title}</h1>
      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        Son güncelleme: {updated}
      </p>
      <div className="mt-10 space-y-8 leading-relaxed text-[var(--ink-soft)] [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:text-[var(--ink)] [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-[var(--ink)] [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_strong]:text-[var(--ink)]">
        {children}
      </div>
    </div>
  );
}
