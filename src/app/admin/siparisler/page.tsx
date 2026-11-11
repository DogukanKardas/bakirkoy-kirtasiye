import { notFound } from "next/navigation";
import { getAdminOrders } from "@db/admin-queries";
import { getSettings } from "@db/queries";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const settings = await getSettings();
  if (!settings.commerceEnabled) notFound();

  const { status } = await searchParams;
  const orders = await getAdminOrders(status || undefined);

  return <OrdersTable orders={orders} activeStatus={status ?? ""} />;
}
