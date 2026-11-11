import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";
import { getSettings } from "@db/queries";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  style: ["normal"],
  weight: ["500", "700"],
  display: "optional",
  adjustFontFallback: true,
  preload: true,
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  // optional: LCP font beklemez (yavaş mobilde render delay düşer)
  display: "optional",
  adjustFontFallback: true,
  preload: true,
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  adjustFontFallback: true,
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: s.shopName,
      template: `%s · ${s.shopName}`,
    },
    description: s.slogan,
    alternates: { canonical: "/" },
    icons: {
      icon: s.faviconUrl || s.logoUrl,
      apple: s.faviconUrl || s.logoUrl,
    },
    openGraph: {
      title: s.shopName,
      description: s.slogan,
      locale: "tr_TR",
      type: "website",
      siteName: s.shopName,
      images: s.ogImageUrl ? [{ url: s.ogImageUrl }] : undefined,
    },
  };
}

const DAY_SCHEMA: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const s = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl()}/#store`,
    name: s.shopName,
    description: s.slogan,
    url: siteUrl(),
    image: s.ogImageUrl || s.logoUrl || undefined,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address || undefined,
      addressLocality: s.district || undefined,
      addressRegion: s.city || undefined,
      addressCountry: "TR",
    },
    openingHoursSpecification: Object.entries(s.hours)
      .filter(([, h]) => h)
      .map(([day, h]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_SCHEMA[day],
        opens: h!.open,
        closes: h!.close,
      })),
    sameAs: [s.instagramUrl, s.facebookUrl].filter(Boolean),
    priceRange: "₺",
  };

  return (
    <html
      lang="tr"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
      style={
        {
          "--accent": s.accentColor,
          "--accent-2": s.secondaryColor,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-full flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
