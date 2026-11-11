import { getCategories } from "@db/queries";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesManager categories={categories} />;
}
