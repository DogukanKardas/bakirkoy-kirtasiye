import Link from "next/link";

/** Buruşturulmuş kâğıt topu (SVG, elle çizilmiş kırışıklar). */
function CrumpledPaper() {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      className="h-44 w-44 animate-[crumple-bob_3.2s_ease-in-out_infinite] sm:h-56 sm:w-56"
    >
      {/* top gövdesi */}
      <path
        d="M100 14c34 2 58 16 72 40 14 23 12 52 2 76-11 25-34 44-62 50-29 6-58-3-76-24C19 137 14 109 22 84 31 55 62 12 100 14Z"
        fill="var(--paper-deep)"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* kırışıklar */}
      <g
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      >
        <path d="M52 60l28 14-10 22 26 8" />
        <path d="M120 40l-14 26 30 10-8 26" />
        <path d="M60 140l30-12 12 20 26-14" />
        <path d="M140 120l-24 8 18 18" />
        <path d="M84 34l10 18M44 100l20 6M150 74l-16 12" />
      </g>
      {/* gölge */}
      <ellipse cx="100" cy="188" rx="46" ry="6" fill="var(--ink)" opacity="0.12" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center">
      <CrumpledPaper />
      <p className="mt-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
        Hata 404
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">
        Bu sayfa buruşturulup atılmış.
      </h1>
      <p className="mt-4 max-w-md text-[var(--ink-soft)]">
        Aradığınız sayfayı bulamadık — belki hiç yazılmamıştır, belki de
        çöp kutusunu boylamıştır. Katalog hâlâ raflarda.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
        >
          Ana sayfaya dön
        </Link>
        <Link
          href="/urunler"
          className="border border-[var(--ink)] px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
        >
          Kataloğa göz at
        </Link>
      </div>
    </div>
  );
}
