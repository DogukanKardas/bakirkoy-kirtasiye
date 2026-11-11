"use client";

import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CartProvider } from "@/lib/cart";
import { ListProvider } from "@/lib/list";
import type { ServerCartItem } from "@/lib/cart-server";

export function SiteProviders({
  children,
  cartEnabled,
  initialCart,
}: {
  children: ReactNode;
  cartEnabled: boolean;
  initialCart: ServerCartItem[];
}) {
  return (
    <NuqsAdapter>
      <CartProvider enabled={cartEnabled} initialItems={initialCart}>
        <ListProvider>{children}</ListProvider>
      </CartProvider>
    </NuqsAdapter>
  );
}
