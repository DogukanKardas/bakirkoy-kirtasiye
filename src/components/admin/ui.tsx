"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function AButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "outline";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--accent-2)] disabled:opacity-50",
    ghost: "text-[var(--ink-soft)] hover:bg-[var(--paper-deep)]",
    danger: "bg-red-700 text-white hover:bg-red-800 disabled:opacity-50",
    outline:
      "border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3.5 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function AInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block text-sm">
      {label ? (
        <span className="mb-1 block text-[var(--ink-soft)]">{label}</span>
      ) : null}
      <input
        {...props}
        className={`w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ink)] ${props.className ?? ""}`}
      />
    </label>
  );
}

export function ATextarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block text-sm">
      {label ? (
        <span className="mb-1 block text-[var(--ink-soft)]">{label}</span>
      ) : null}
      <textarea
        {...props}
        className={`w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none transition focus:border-[var(--ink)] ${props.className ?? ""}`}
      />
    </label>
  );
}

export function ASelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block text-sm">
      {label ? (
        <span className="mb-1 block text-[var(--ink-soft)]">{label}</span>
      ) : null}
      <select
        {...props}
        className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
      >
        {children}
      </select>
    </label>
  );
}

export function ACard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--line)] bg-[var(--paper)] ${className}`}
    >
      {children}
    </div>
  );
}

export function ABadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "yellow" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--paper-deep)] text-[var(--ink-soft)]",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-900",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function AToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--ink-soft)]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-[var(--accent-2)]" : "bg-[var(--line)]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-4.5 left-[18px]" : "left-0.5"}`}
        />
      </button>
      {label}
    </label>
  );
}

export function AModal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        className={`relative max-h-[85vh] w-full overflow-auto rounded-lg border border-[var(--line)] bg-[var(--paper)] p-5 shadow-xl ${wide ? "max-w-3xl" : "max-w-md"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-xl">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AConfirm({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Onayla",
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <AModal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[var(--ink-soft)]">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <AButton variant="ghost" onClick={onClose}>
          Vazgeç
        </AButton>
        <AButton
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </AButton>
      </div>
    </AModal>
  );
}

export function ATabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--line)]">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
            active === t.key
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function AEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--ink-muted)]">
      {children}
    </div>
  );
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    t.current = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t.current);
  }, [value, ms]);
  return v;
}
