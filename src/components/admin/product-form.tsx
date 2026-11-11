"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Brand, Category } from "@db/queries";
import type { AdminProduct } from "@db/admin-queries";
import { slugify } from "@/lib/format";
import { saveProductAction } from "@/lib/actions/products";
import { RichText } from "./rich-text";
import { ImageUpload } from "./image-upload";
import { AButton, ACard, AInput, ASelect, AToggle } from "./ui";

const schema = z.object({
  name: z.string().min(2, "Ürün adı gerekli"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Küçük harf, rakam ve tire kullanın"),
  sku: z.string().min(2, "SKU gerekli (en az 2 karakter)"),
  priceTl: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  stock: z.coerce.number().int().min(0, "Stok 0'dan küçük olamaz"),
  description: z.string().default(""),
  categoryId: z.string().min(1, "Kategori seçin"),
  brandId: z.string().default(""),
  tags: z.string().default(""),
  active: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({ name: z.string().min(1, "Varyant adı") })).default([]),
});

type FormValues = z.input<typeof schema>;

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product: AdminProduct | null;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      priceTl: product ? product.price / 100 : 0,
      stock: product?.stock ?? 0,
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      tags: (product?.tags ?? []).join(", "),
      active: product?.active ?? true,
      isFeatured: product?.isFeatured ?? false,
      isNew: product?.isNew ?? false,
      seoTitle: product?.seoTitle ?? "",
      seoDescription: product?.seoDescription ?? "",
      images: (product?.images ?? [])
        .map((i) => i.url)
        .concat(product?.imageUrl && !(product?.images ?? []).length ? [product.imageUrl] : [])
        .filter(Boolean),
      variants: product?.variants ?? [],
    },
  });

  const variants = useFieldArray({ control: form.control, name: "variants" });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const parsed = schema.parse(values);
      const res = await saveProductAction({
        id: product?.id,
        name: parsed.name,
        slug: parsed.slug,
        sku: parsed.sku,
        price: Math.round(parsed.priceTl * 100),
        stock: parsed.stock,
        description: parsed.description,
        categoryId: parsed.categoryId,
        brandId: parsed.brandId || null,
        tags: parsed.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        active: parsed.active,
        isFeatured: parsed.isFeatured,
        isNew: parsed.isNew,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        images: parsed.images.map((url) => ({ url, alt: parsed.name })),
        variants: parsed.variants,
      });
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success(product ? "Ürün güncellendi" : "Ürün eklendi");
        router.push("/admin/urunler");
        router.refresh();
      }
    });
  });

  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const name = form.watch("name");
  const slug = form.watch("slug");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          {product ? "Ürünü Düzenle" : "Yeni Ürün"}
        </h1>
        <div className="flex gap-2">
          <AButton variant="ghost" onClick={() => router.push("/admin/urunler")}>
            Vazgeç
          </AButton>
          <AButton type="submit" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </AButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ACard className="space-y-3 p-4">
            <div>
              <AInput
                label="Ürün Adı"
                {...form.register("name")}
                onChange={(e) => {
                  form.setValue("name", e.target.value, { shouldValidate: true });
                  if (!slugTouched) {
                    form.setValue("slug", slugify(e.target.value));
                  }
                }}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <AInput
                  label="Slug"
                  {...form.register("slug")}
                  onChange={(e) => {
                    setSlugTouched(true);
                    form.setValue("slug", slugify(e.target.value), {
                      shouldValidate: true,
                    });
                  }}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
                )}
              </div>
              <div>
                <AInput label="SKU" {...form.register("sku")} />
                {errors.sku && (
                  <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm text-[var(--ink-soft)]">Açıklama</p>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <RichText
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Ürün açıklaması…"
                  />
                )}
              />
            </div>
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Varyantlar</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Renk, boyut gibi seçenekler (örn. Mavi, A5).
            </p>
            {variants.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <input
                  {...form.register(`variants.${i}.name`)}
                  placeholder="Örn. Mavi"
                  className="flex-1 rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
                />
                <AButton variant="ghost" onClick={() => variants.remove(i)}>
                  ✕
                </AButton>
              </div>
            ))}
            <AButton
              variant="outline"
              onClick={() => variants.append({ name: "" })}
            >
              + Varyant Ekle
            </AButton>
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">SEO</h2>
            <AInput
              label={`SEO Başlığı (${seoTitle?.length ?? 0}/60)`}
              maxLength={70}
              placeholder={name || "Arama sonuçlarında görünen başlık"}
              {...form.register("seoTitle")}
            />
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--ink-soft)]">
                SEO Açıklaması ({seoDescription?.length ?? 0}/160)
              </span>
              <textarea
                maxLength={170}
                rows={2}
                {...form.register("seoDescription")}
                className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
              />
            </label>
            <div className="rounded-md bg-[var(--paper-deep)] p-3">
              <p className="text-xs text-[var(--ink-muted)]">Google önizleme</p>
              <p className="mt-1 truncate text-sm font-medium text-blue-700">
                {seoTitle || name || "Ürün başlığı"}
              </p>
              <p className="truncate text-xs text-emerald-700">
                …/urun/{slug || "urun-adi"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-soft)]">
                {seoDescription || "Ürün açıklaması burada görünür…"}
              </p>
            </div>
          </ACard>
        </div>

        <div className="space-y-4">
          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Durum</h2>
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <AToggle
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  label="Yayında"
                />
              )}
            />
            <Controller
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <AToggle
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  label="Öne çıkan"
                />
              )}
            />
            <Controller
              control={form.control}
              name="isNew"
              render={({ field }) => (
                <AToggle
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  label="Yeni etiketi"
                />
              )}
            />
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Fiyat & Stok</h2>
            <div>
              <AInput
                label="Satış Fiyatı (TL)"
                inputMode="decimal"
                {...form.register("priceTl")}
              />
              {errors.priceTl && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.priceTl.message}
                </p>
              )}
            </div>
            <div>
              <AInput
                label="Stok Adedi"
                inputMode="numeric"
                {...form.register("stock")}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Organizasyon</h2>
            <div>
              <ASelect label="Kategori" {...form.register("categoryId")}>
                <option value="">Kategori seçin…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </ASelect>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <ASelect label="Marka" {...form.register("brandId")}>
              <option value="">Markasız</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </ASelect>
            <AInput
              label="Etiketler (virgülle)"
              placeholder="okul, defter, a4"
              {...form.register("tags")}
            />
          </ACard>

          <ACard className="space-y-3 p-4">
            <h2 className="font-semibold">Görseller</h2>
            <Controller
              control={form.control}
              name="images"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  folder="products"
                />
              )}
            />
          </ACard>
        </div>
      </div>
    </form>
  );
}
