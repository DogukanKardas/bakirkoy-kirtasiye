"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; ownerOnly?: boolean; badge?: number };

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: Item;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--ink)] text-[var(--paper)]"
          : "text-[var(--ink-soft)] hover:bg-[var(--paper-deep)]"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60"
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="ml-auto rounded-full bg-[var(--accent-2)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminSidebar({
  shopName,
  role,
  newListsCount,
  commerceEnabled,
  newOrdersCount,
}: {
  shopName: string;
  role: "owner" | "editor";
  newListsCount: number;
  commerceEnabled: boolean;
  newOrdersCount: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("bk-admin-sidebar") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("bk-admin-sidebar", !c ? "1" : "0");
      return !c;
    });
  };

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Genel",
      items: [{ href: "/admin", label: "Panel" }],
    },
    {
      title: "Katalog",
      items: [
        { href: "/admin/urunler", label: "Ürünler" },
        { href: "/admin/kategoriler", label: "Kategoriler" },
        { href: "/admin/markalar", label: "Markalar" },
        { href: "/admin/koleksiyonlar", label: "Koleksiyonlar" },
      ],
    },
    {
      title: "Vitrin",
      items: [
        { href: "/admin/ana-sayfa", label: "Ana Sayfa" },
        { href: "/admin/hizmetler", label: "Hizmetler" },
      ],
    },
    {
      title: "Talepler",
      items: [
        // e-ticaret kapalıyken siparişler menüde gizli
        ...(commerceEnabled
          ? [
              {
                href: "/admin/siparisler",
                label: "Siparişler",
                badge: newOrdersCount,
              },
            ]
          : []),
        {
          href: "/admin/listeler",
          label: "Liste Talepleri",
          badge: newListsCount,
        },
        { href: "/admin/mesajlar", label: "Mesajlar" },
      ],
    },
    {
      title: "Yönetim",
      items: [
        { href: "/admin/ayarlar", label: "Ayarlar", ownerOnly: true },
        { href: "/admin/kullanicilar", label: "Kullanıcılar", ownerOnly: true },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[var(--line)] bg-[var(--paper)] transition-all ${collapsed ? "w-14" : "w-56"}`}
    >
      <div
        className={`flex items-center gap-2 border-b border-[var(--line)] px-3 py-4 ${collapsed ? "justify-center" : ""}`}
      >
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent)] font-[family-name:var(--font-display)] text-sm font-black text-[var(--ink)]"
          aria-hidden
        >
          K
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {shopName}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              Yönetim
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-2">
        {sections.map((s) => {
          const items = s.items.filter((i) => !i.ownerOnly || role === "owner");
          if (!items.length) return null;
          return (
            <div key={s.title}>
              {!collapsed && (
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                  {s.title}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((i) => (
                  <NavLink
                    key={i.href}
                    item={i}
                    collapsed={collapsed}
                    active={isActive(i.href)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--line)] p-2">
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--paper-deep)] ${collapsed ? "justify-center" : ""}`}
        >
          <span aria-hidden>↗</span>
          {!collapsed && "Siteyi Görüntüle"}
        </Link>
        <button
          onClick={toggleCollapsed}
          className={`mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--ink-muted)] transition hover:bg-[var(--paper-deep)] ${collapsed ? "justify-center" : ""}`}
        >
          <span aria-hidden>{collapsed ? "»" : "«"}</span>
          {!collapsed && "Daralt"}
        </button>
      </div>
    </aside>
  );
}
