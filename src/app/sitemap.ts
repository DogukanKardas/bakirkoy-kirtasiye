import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import {
  getActiveCollections,
  getCategories,
  getProductsForSitemap,
  getSettings,
} from "@db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();

  const staticPages: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/urunler", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/hizmetler", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/liste", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/hakkimizda", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/iletisim", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/kvkk", priority: 0.2, changeFrequency: "yearly" as const },
    {
      path: "/cerez-politikasi",
      priority: 0.2,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/mesafeli-satis-sozlesmesi",
      priority: 0.2,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/iade-degisim",
      priority: 0.2,
      changeFrequency: "yearly" as const,
    },
  ].map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const [products, categories, collections] = await Promise.all([
    getProductsForSitemap(),
    getCategories(),
    getActiveCollections(),
  ]);

  return [
    ...staticPages,
    ...categories.map(
      (c): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/kategori/${c.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...collections.map(
      (c): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/koleksiyon/${c.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...products.map(
      (p): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/urun/${p.slug}`),
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: settings.commerceEnabled ? 0.8 : 0.7,
      }),
    ),
  ];
}
