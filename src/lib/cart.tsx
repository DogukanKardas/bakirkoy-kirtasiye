"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  clearCartAction,
  removeCartItemAction,
  setCartQtyAction,
} from "@/lib/actions/cart";
import type { ServerCartItem } from "@/lib/cart-server";

export type CartItem = ServerCartItem;

type AddInput = {
  productId: string;
  name: string;
  price: number;
  slug: string;
  stock: number;
  sku?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  enabled: boolean;
  addItem: (item: AddInput, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  /** checkout sonrası yerel state'i sıfırlar (sunucu sepeti zaten dönüştü) */
  resetLocal: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  enabled = false,
  initialItems = [],
}: {
  children: ReactNode;
  enabled?: boolean;
  initialItems?: ServerCartItem[];
}) {
  const [items, setItems] = useState<CartItem[]>(enabled ? initialItems : []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // eşzamanlı optimistic güncellemelerde rollback için son sunucu durumu
  const lastSynced = useRef<CartItem[]>(enabled ? initialItems : []);

  const sync = useCallback(
    (result: { ok: true; items: ServerCartItem[] } | { error: string }) => {
      if ("ok" in result) {
        lastSynced.current = result.items;
        setItems(result.items);
      } else {
        // sunucu reddettiyse optimistic değişikliği geri al
        setItems(lastSynced.current);
      }
    },
    [],
  );

  const addItem = useCallback(
    (item: AddInput, qty = 1) => {
      if (!enabled) return;
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, item.stock);
          return prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: nextQty, stock: item.stock }
              : p,
          );
        }
        return [
          ...prev,
          {
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            stock: item.stock,
            sku: item.sku ?? null,
            quantity: Math.min(qty, item.stock),
          },
        ];
      });
      void addToCartAction(item.productId, qty).then(sync);
    },
    [enabled, sync],
  );

  const updateQty = useCallback(
    (productId: string, quantity: number) => {
      if (!enabled) return;
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((p) => p.productId !== productId)
          : prev.map((p) =>
              p.productId === productId
                ? { ...p, quantity: Math.max(1, Math.min(quantity, p.stock)) }
                : p,
            ),
      );
      void setCartQtyAction(productId, quantity).then(sync);
    },
    [enabled, sync],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (!enabled) return;
      setItems((prev) => prev.filter((p) => p.productId !== productId));
      void removeCartItemAction(productId).then(sync);
    },
    [enabled, sync],
  );

  const clear = useCallback(() => {
    if (!enabled) return;
    setItems([]);
    void clearCartAction().then(sync);
  }, [enabled, sync]);

  const resetLocal = useCallback(() => {
    lastSynced.current = [];
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      enabled,
      addItem,
      removeItem,
      updateQty,
      clear,
      resetLocal,
      drawerOpen,
      setDrawerOpen,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    [items, enabled, addItem, removeItem, updateQty, clear, resetLocal, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
