import { notFound } from "next/navigation";
import { getAdminProducts } from "@db/admin-queries";
import { getBrands, getCategories } from "@db/queries";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    getBrands(),
  ]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <ProductForm product={product} categories={categories} brands={brands} />
  );
}
