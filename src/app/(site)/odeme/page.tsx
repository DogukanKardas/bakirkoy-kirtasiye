import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@db/queries";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = {
  title: "Sipariş",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  if (!settings.commerceEnabled) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display-2 text-[var(--ink)]">Sipariş</h1>
      <CheckoutView
        shopAddress={`${settings.address} ${settings.district} / ${settings.city}`.trim()}
        shopPhone={settings.phone}
      />
    </div>
  );
}
