import { getAdminCollections, getAdminProducts } from "@db/admin-queries";
import { CollectionsManager } from "@/components/admin/collections-manager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    getAdminCollections(),
    getAdminProducts(),
  ]);
  return <CollectionsManager collections={collections} products={products} />;
}
