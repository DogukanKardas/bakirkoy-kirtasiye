import { getBrands } from "@db/queries";
import { BrandsManager } from "@/components/admin/brands-manager";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return <BrandsManager brands={brands} />;
}
