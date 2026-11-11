import {
  getAdminAuditLogs,
  getAdminListRequestCounts,
  getAdminProducts,
} from "@db/admin-queries";
import { Dashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, counts, logs] = await Promise.all([
    getAdminProducts(),
    getAdminListRequestCounts(),
    getAdminAuditLogs(12),
  ]);

  const topViewed = [...products]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((p) => ({
      name: p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name,
      views: p.views,
    }));

  return (
    <Dashboard
      totalProducts={products.length}
      outOfStock={products.filter((p) => p.stock === 0).length}
      weeklyLists={counts.weekly}
      newLists={counts.fresh}
      topViewed={topViewed}
      logs={logs.map((l) => ({
        id: l.id,
        actor: l.actorEmail,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId ?? "",
        at: l.createdAt,
      }))}
    />
  );
}
