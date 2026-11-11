import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getBrands,
  getCategories,
  getCollectionById,
  getCollectionProductsCached,
  getFeaturedProducts,
  getHomeSections,
  getSettings,
  type HomeSection,
} from "@db/queries";
import { HeroSection } from "@/components/site/home/hero-section";
import { CategoriesStrip } from "@/components/site/home/categories-strip";
import { FeaturedEditorial } from "@/components/site/home/featured-editorial";
import { ListCtaSection } from "@/components/site/home/list-cta-section";

import { SmoothScroll } from "@/components/site/smooth-scroll";

// Aşağı fold: ayrı chunk (SSR açık — RSC'de ssr:false yasak)
const ManifestoSection = dynamic(() =>
  import("@/components/site/home/manifesto-section").then(
    (m) => m.ManifestoSection,
  ),
);
const CollectionShowcase = dynamic(() =>
  import("@/components/site/home/collection-showcase").then(
    (m) => m.CollectionShowcase,
  ),
);
const BrandsMarquee = dynamic(() =>
  import("@/components/site/home/brands-marquee").then((m) => m.BrandsMarquee),
);
const ShopSection = dynamic(() =>
  import("@/components/site/home/shop-section").then((m) => m.ShopSection),
);

function BannerSection({ content }: { content: Record<string, unknown> }) {
  const heading = String(content.heading ?? "");
  const text = String(content.text ?? "");
  const ctaLabel = String(content.ctaLabel ?? "");
  const ctaHref = String(content.ctaHref ?? "");
  return (
    <section className="border-t border-[var(--line)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <h2 className="display-3 text-[var(--ink)]">{heading}</h2>
        <div className="flex flex-col justify-end gap-4 text-[var(--ink-soft)]">
          <p className="leading-relaxed">{text}</p>
          {ctaLabel && ctaHref ? (
            <p>
              <Link
                href={ctaHref}
                className="inline-block border-b border-[var(--ink)] pb-0.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent)]"
              >
                {ctaLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [settings, sections] = await Promise.all([
    getSettings(),
    getHomeSections(),
  ]);

  const rendered = await Promise.all(
    sections.map(async (section: HomeSection) => {
      const c = section.content;
      const str = (key: string, fallback = "") =>
        String(c[key] ?? fallback);

      switch (section.type) {
        case "hero":
          return (
            <HeroSection
              key={section.id}
              line1={str("line1", "Her fikir")}
              line2={str("line2", "bir kalemle")}
              line3={str("line3", "başlar.")}
              highlight={str("highlight")}
              lead={str(
                "lead",
                `${settings.shopName}, ${settings.district}'da okul ve ofis ihtiyacınız için kapısı her zaman açık bir dükkân.`,
              )}
              whatsapp={settings.whatsapp}
            />
          );

        case "manifesto":
          return (
            <ManifestoSection
              key={section.id}
              text={str(
                "text",
                "Kalemi eline alıp denemeden, defterin kâğıdına dokunmadan alışveriş olmaz diyenlerin dükkânıyız.",
              )}
            />
          );

        case "categories": {
          const categories = await getCategories();
          return (
            <CategoriesStrip
              key={section.id}
              categories={categories}
              heading={str("heading", "Neler var neler")}
              note={str("note", "Raflar arasında kaybolun.")}
            />
          );
        }

        case "featured": {
          const ids = Array.isArray(c.product_ids)
            ? (c.product_ids as string[])
            : [];
          const products = await getFeaturedProducts(
            6,
            ids.length ? ids : undefined,
          );
          return (
            <FeaturedEditorial
              key={section.id}
              products={products}
              heading={str("heading", section.title)}
              note={str("note")}
              showPrices={settings.showPrices}
            />
          );
        }

        case "collection": {
          const collectionId = str("collection_id");
          if (!collectionId) return null;
          const collection = await getCollectionById(collectionId);
          if (!collection) return null;
          const products = await getCollectionProductsCached(collection.id);
          const heroImage =
            collection.imageUrl ||
            products[0]?.imageUrl ||
            products[0]?.images[0]?.url ||
            null;
          return (
            <CollectionShowcase
              key={section.id}
              name={collection.name}
              slug={collection.slug}
              imageUrl={heroImage}
              productCount={products.length}
            />
          );
        }

        case "list_cta":
          return (
            <ListCtaSection
              key={section.id}
              heading={str("heading", section.title)}
              text={str("text")}
              whatsapp={settings.whatsapp}
              steps={[1, 2, 3].map((n) => ({
                title: str(`step${n}`),
                text: str(`step${n}d`),
              }))}
            />
          );

        case "brands": {
          const brands = await getBrands();
          return (
            <BrandsMarquee
              key={section.id}
              brands={brands}
              label={str("label", section.title)}
            />
          );
        }

        case "shop":
          return (
            <ShopSection
              key={section.id}
              heading={str("heading", section.title)}
              text={str("text")}
              address={settings.address}
              district={settings.district}
              city={settings.city}
              hours={settings.hours}
              exceptions={settings.hoursExceptions}
              mapEmbedUrl={settings.mapEmbedUrl}
              images={
                Array.isArray(c.images) ? (c.images as string[]) : []
              }
            />
          );

        case "banner":
          return <BannerSection key={section.id} content={c} />;

        default:
          return null;
      }
    }),
  );

  return (
    <div>
      <SmoothScroll />
      {rendered}
    </div>
  );
}
