import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@db/queries";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const settings = await getSettings();
  if (!settings.commerceEnabled) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display-2 text-[var(--ink)]">Sepet</h1>
      <CartView />
    </div>
  );
}
