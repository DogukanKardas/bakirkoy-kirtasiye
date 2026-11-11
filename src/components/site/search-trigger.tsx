"use client";

export function SearchTrigger() {
  return (
    <button
      type="button"
      title="Ara (Ctrl+K)"
      onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
      className="flex items-center gap-2 text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
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
      <span className="text-sm font-medium">Ara</span>
      <kbd
        aria-hidden
        className="hidden border border-[var(--line)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink-muted)] md:inline"
      >
        ⌘K
      </kbd>
    </button>
  );
}
