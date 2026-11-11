import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ListDrawerHost } from "@/components/site/list-drawer";
import { CartDrawerHost } from "@/components/site/cart-drawer";
import { SearchOverlay } from "@/components/site/search-overlay";
import { SiteProviders } from "@/components/site/providers";
import { Preloader } from "@/components/site/preloader";
import { CookieBanner } from "@/components/site/cookie-banner";
import { DeferredChrome } from "@/components/site/chrome/deferred-chrome";
import { getCategories, getSettings } from "@db/queries";
import { getInitialCart } from "@/lib/cart-server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories, initialCart] = await Promise.all([
    getSettings(),
    getCategories(),
    getInitialCart(),
  ]);

  return (
    <SiteProviders cartEnabled={settings.commerceEnabled} initialCart={initialCart}>
      <a href="#icerik" className="skip-link">
        İçeriğe atla
      </a>
      <Preloader shopName={settings.shopName} />
      <SiteHeader settings={settings} />
      <main
        id="icerik"
        className="flex-1 outline-none max-sm:pb-28"
        tabIndex={-1}
      >
        {children}
      </main>
      <SiteFooter settings={settings} />
      {settings.commerceEnabled ? (
        <CartDrawerHost />
      ) : (
        <ListDrawerHost whatsapp={settings.whatsapp} shopName={settings.shopName} />
      )}
      <SearchOverlay
        categories={categories}
        showPrices={settings.showPrices}
      />
      <DeferredChrome />
      <CookieBanner />
    </SiteProviders>
  );
}
