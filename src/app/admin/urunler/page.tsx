import { Suspense } from "react";
import { getAdminProducts } from "@db/admin-queries";
import { getCategories } from "@db/queries";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getCategories(),
  ]);
  return (
    <Suspense>
      <ProductsTable products={products} categories={categories} />
    </Suspense>
  );
}
