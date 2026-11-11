import { getAdminListRequests } from "@db/admin-queries";
import { getSettings } from "@db/queries";
import { ListsKanban } from "@/components/admin/lists-kanban";

export const dynamic = "force-dynamic";

export default async function AdminListsPage() {
  const [requests, settings] = await Promise.all([
    getAdminListRequests(),
    getSettings(),
  ]);
  return <ListsKanban requests={requests} shopName={settings.shopName} />;
}
