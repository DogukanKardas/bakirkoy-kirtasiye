import { notFound } from "next/navigation";
import { getAdminOrder } from "@db/admin-queries";
import { getSettings } from "@db/queries";
import { OrderDetail } from "@/components/admin/order-detail";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const settings = await getSettings();
  if (!settings.commerceEnabled) notFound();

  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return <OrderDetail order={order} />;
}
