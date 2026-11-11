"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ABadge, ACard } from "./ui";

type LogRow = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  at: string;
};

const ACTION_LABEL: Record<string, string> = {
  create: "ekledi",
  update: "güncelledi",
  delete: "sildi",
  reorder: "sıraladı",
  bulk: "toplu işlem",
  import: "içe aktardı",
  role: "rol değiştirdi",
  status: "durum değiştirdi",
};

const ENTITY_LABEL: Record<string, string> = {
  product: "ürün",
  category: "kategori",
  brand: "marka",
  collection: "koleksiyon",
  home_section: "ana sayfa bölümü",
  settings: "ayarlar",
  list_request: "liste talebi",
  user: "kullanıcı",
};

export function Dashboard({
  totalProducts,
  outOfStock,
  weeklyLists,
  newLists,
  topViewed,
  logs,
}: {
  totalProducts: number;
  outOfStock: number;
  weeklyLists: number;
  newLists: number;
  topViewed: { name: string; views: number }[];
  logs: LogRow[];
}) {
  const stats = [
    { label: "Toplam Ürün", value: totalProducts, href: "/admin/urunler" },
    {
      label: "Stokta Olmayan",
      value: outOfStock,
      href: "/admin/urunler?stok=yok",
      warn: outOfStock > 0,
    },
    {
      label: "Bu Haftaki Liste Talepleri",
      value: weeklyLists,
      href: "/admin/listeler",
    },
    { label: "Yeni Talep", value: newLists, href: "/admin/listeler" },
  ];

  const quickActions = [
    { label: "Yeni Ürün", href: "/admin/urunler/yeni" },
    { label: "Excel ile İçe Aktar", href: "/admin/urunler/aktar" },
    { label: "Liste Talepleri", href: "/admin/listeler" },
    { label: "Ana Sayfayı Düzenle", href: "/admin/ana-sayfa" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Panel</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <ACard className="h-full p-4 transition hover:border-[var(--ink)]">
              <p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">
                {s.label}
              </p>
              <p
                className={`mt-1 font-[family-name:var(--font-display)] text-4xl ${s.warn ? "text-red-600" : ""}`}
              >
                {s.value}
              </p>
            </ACard>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ACard className="p-4 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">En Çok Görüntülenen 10 Ürün</h2>
            <ABadge>görüntülenme</ABadge>
          </div>
          {topViewed.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
              Henüz görüntülenme verisi yok.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topViewed}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis type="number" stroke="var(--ink-muted)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    stroke="var(--ink-muted)"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--paper)",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="views" fill="var(--accent-2)" radius={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ACard>

        <ACard className="p-4">
          <h2 className="mb-2 font-semibold">Son Aktiviteler</h2>
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--ink-muted)]">
              Henüz kayıt yok.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="rounded-md bg-[var(--paper-deep)] px-2.5 py-2"
                >
                  <p className="truncate">
                    <strong>{l.actor.split("@")[0]}</strong>{" "}
                    {ENTITY_LABEL[l.entity] ?? l.entity}{" "}
                    {ACTION_LABEL[l.action] ?? l.action}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {new Date(l.at).toLocaleString("tr-TR", {
                      timeZone: "Europe/Istanbul",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ACard>
      </div>

      <ACard className="p-4">
        <h2 className="mb-3 font-semibold">Hızlı Aksiyonlar</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium transition hover:border-[var(--ink)] hover:bg-[var(--paper-deep)]"
            >
              {a.label} →
            </Link>
          ))}
        </div>
      </ACard>
    </div>
  );
}
