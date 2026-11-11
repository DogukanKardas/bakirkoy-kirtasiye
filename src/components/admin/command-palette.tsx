"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

export function CommandPalette({
  products,
  role,
}: {
  products: { id: string; name: string; sku: string }[];
  role: "owner" | "editor";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pages = useMemo(
    () =>
      [
        { label: "Panel", href: "/admin" },
        { label: "Ürünler", href: "/admin/urunler" },
        { label: "Yeni Ürün", href: "/admin/urunler/yeni" },
        { label: "İçe / Dışa Aktar", href: "/admin/urunler/aktar" },
        { label: "Kategoriler", href: "/admin/kategoriler" },
        { label: "Markalar", href: "/admin/markalar" },
        { label: "Koleksiyonlar", href: "/admin/koleksiyonlar" },
        { label: "Ana Sayfa", href: "/admin/ana-sayfa" },
        { label: "Liste Talepleri", href: "/admin/listeler" },
        ...(role === "owner"
          ? [
              { label: "Ayarlar", href: "/admin/ayarlar" },
              { label: "Kullanıcılar", href: "/admin/kullanicilar" },
            ]
          : []),
      ],
    [role],
  );

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <Command
        label="Komut paleti"
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--paper)] shadow-2xl"
      >
        <Command.Input
          autoFocus
          placeholder="Sayfa veya ürün ara…"
          className="w-full border-b border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
          <Command.Empty className="px-3 py-6 text-center text-[var(--ink-muted)]">
            Sonuç yok
          </Command.Empty>
          <Command.Group
            heading="Sayfalar"
            className="text-xs text-[var(--ink-muted)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
          >
            {pages.map((p) => (
              <Command.Item
                key={p.href}
                value={p.label}
                onSelect={() => go(p.href)}
                className="cursor-pointer rounded-md px-3 py-2 text-[var(--ink)] aria-selected:bg-[var(--paper-deep)]"
              >
                {p.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group
            heading="Ürünler"
            className="text-xs text-[var(--ink-muted)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
          >
            {products.map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.name} ${p.sku ?? ""}`}
                onSelect={() => go(`/admin/urunler/${p.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-[var(--ink)] aria-selected:bg-[var(--paper-deep)]"
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-3 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                  {p.sku}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
