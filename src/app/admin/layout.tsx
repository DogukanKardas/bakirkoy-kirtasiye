import type { Metadata } from "next";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};
import {
  getAdminListRequestCounts,
  getAdminOrderCounts,
  getAdminProducts,
} from "@db/admin-queries";
import { getSettings } from "@db/queries";
import { AdminProviders } from "@/components/admin/admin-providers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CommandPalette } from "@/components/admin/command-palette";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    // giris sayfasi kabuksuz render edilir
    return <AdminProviders>{children}</AdminProviders>;
  }

  const [settings, products, counts] = await Promise.all([
    getSettings(),
    getAdminProducts(),
    getAdminListRequestCounts(),
  ]);
  // commerce kapalıyken sorguya hiç gerek yok
  const orderCounts = settings.commerceEnabled
    ? await getAdminOrderCounts()
    : { fresh: 0 };

  return (
    <AdminProviders>
      <div className="flex min-h-screen">
        <AdminSidebar
          shopName={settings.shopName}
          role={admin.role}
          newListsCount={counts.fresh}
          commerceEnabled={settings.commerceEnabled}
          newOrdersCount={orderCounts.fresh}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar email={admin.email} role={admin.role} />
          <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
      <CommandPalette
        products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))}
        role={admin.role}
      />
    </AdminProviders>
  );
}
