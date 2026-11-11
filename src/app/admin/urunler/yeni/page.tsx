import { getBrands, getCategories } from "@db/queries";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  return <ProductForm product={null} categories={categories} brands={brands} />;
}
