import { getAdminCollections, getAdminHomeSections, getAdminProducts } from "@db/admin-queries";
import { HomeBuilder } from "@/components/admin/home-builder";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [sections, products, collections] = await Promise.all([
    getAdminHomeSections(),
    getAdminProducts(),
    getAdminCollections(),
  ]);
  return (
    <HomeBuilder
      sections={sections}
      products={products}
      collections={collections}
    />
  );
}
