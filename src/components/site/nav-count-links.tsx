"use client";

import Link from "next/link";
import { useList } from "@/lib/list";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--paper)]">
      {count}
    </span>
  );
}

export function ListCountLink() {
  const { count } = useList();
  return (
    <Link
      href="/liste"
      className="relative transition hover:text-[var(--ink)]"
    >
      Listem
      <Badge count={count} />
    </Link>
  );
}
