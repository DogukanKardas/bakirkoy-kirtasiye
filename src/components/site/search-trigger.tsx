"use client";

export function SearchTrigger({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Ara"
      title="Ara (Ctrl+K)"
      onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
      className={`grid h-10 w-10 place-items-center text-[var(--ink-soft)] transition hover:text-[var(--ink)] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
