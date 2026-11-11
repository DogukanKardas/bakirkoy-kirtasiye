"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { openAdminNav } from "./admin-sidebar";
import { useAdminTheme } from "./admin-providers";

const LABELS: Record<string, string> = {
  admin: "Panel",
  urunler: "Ürünler",
  yeni: "Yeni",
  kategoriler: "Kategoriler",
  markalar: "Markalar",
  koleksiyonlar: "Koleksiyonlar",
  "ana-sayfa": "Ana Sayfa",
  listeler: "Liste Talepleri",
  ayarlar: "Ayarlar",
  kullanicilar: "Kullanıcılar",
  aktar: "İçe / Dışa Aktar",
};

export function AdminTopbar({
  email,
  role,
}: {
  email: string;
  role: "owner" | "editor";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useAdminTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: LABELS[seg] ?? "Düzenle",
  }));

  const search = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/admin/urunler?q=${encodeURIComponent(term)}`);
  };

  const logout = async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    toast.success("Çıkış yapıldı");
    router.push("/admin/giris");
    router.refresh();
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--paper)] px-4">
      <button
        type="button"
        onClick={openAdminNav}
        className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line)] text-sm md:hidden"
        aria-label="Menüyü aç"
      >
        ☰
      </button>
      <nav
        aria-label="breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-sm"
      >
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-[var(--ink-muted)]">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium">{c.label}</span>
            ) : (
              <Link
                href={c.href}
                className="text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
              >
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <form onSubmit={search} className="hidden sm:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ürün ara…"
            className="w-44 rounded-md border border-[var(--line)] bg-[var(--paper-deep)] px-3 py-1.5 text-sm outline-none transition focus:w-60 focus:border-[var(--ink)]"
          />
        </form>
        <button
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
            )
          }
          className="hidden items-center gap-1 rounded-md border border-[var(--line)] px-2 py-1.5 text-xs text-[var(--ink-muted)] transition hover:border-[var(--ink)] md:flex"
          title="Komut paleti"
        >
          ⌘K
        </button>
        <button
          onClick={toggle}
          className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm transition hover:border-[var(--ink)]"
          title={dark ? "Açık tema" : "Koyu tema"}
          aria-label="Tema değiştir"
        >
          {dark ? "☀" : "☾"}
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm transition hover:border-[var(--ink)]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--ink)]">
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-[140px] truncate sm:inline">
              {email}
            </span>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-50 mt-1 w-52 rounded-md border border-[var(--line)] bg-[var(--paper)] p-1 shadow-lg">
                <p className="px-3 py-2 text-xs text-[var(--ink-muted)]">
                  {email}
                  <br />
                  Rol: <strong>{role}</strong>
                </p>
                <button
                  onClick={logout}
                  className="w-full rounded px-3 py-2 text-left text-sm text-red-600 transition hover:bg-[var(--paper-deep)]"
                >
                  Çıkış Yap
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
