import { getAdminProducts } from "@db/admin-queries";
import { getBrands, getCategories } from "@db/queries";
import { ImportExportWizard } from "@/components/admin/import-export";

export const dynamic = "force-dynamic";

export default async function ImportExportPage() {
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    getBrands(),
  ]);
  return (
    <ImportExportWizard
      products={products}
      categories={categories}
      brands={brands}
    />
  );
}
