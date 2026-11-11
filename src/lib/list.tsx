"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ListItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  sku?: string;
  variant?: string;
  /** Müşterinin bu ürün için dükkâna notu ("mavi olsun" gibi). */
  note?: string;
};

/** Aynı ürünün farklı varyantları ayrı satırlarda durur. */
export function listRowId(item: Pick<ListItem, "productId" | "variant">) {
  return `${item.productId}::${item.variant ?? ""}`;
}

type ListContextValue = {
  items: ListItem[];
  addItem: (item: Omit<ListItem, "quantity">, qty?: number) => void;
  addMany: (items: Omit<ListItem, "quantity">[]) => void;
  removeItem: (rowId: string) => void;
  updateQty: (rowId: string, quantity: number) => void;
  updateNote: (rowId: string, note: string) => void;
  clear: () => void;
  count: number;
  total: number;
  ready: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const ListContext = createContext<ListContextValue | null>(null);
const STORAGE_KEY = "bakirkoy-list";

function readStoredItems(): ListItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // eski/bozuk kayıtlara karşı savunmacı süzgeç
    return parsed.filter(
      (i): i is ListItem =>
        i &&
        typeof i.productId === "string" &&
        typeof i.name === "string" &&
        typeof i.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function ListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(readStoredItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* kota dolduysa sessiz geç */
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<ListItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const id = listRowId(item);
      const existing = prev.find((p) => listRowId(p) === id);
      if (existing) {
        return prev.map((p) =>
          listRowId(p) === id ? { ...p, quantity: p.quantity + qty } : p,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const addMany = useCallback(
    (list: Omit<ListItem, "quantity">[]) => {
      setItems((prev) => {
        const next = [...prev];
        for (const item of list) {
          const id = listRowId(item);
          const idx = next.findIndex((p) => listRowId(p) === id);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          } else {
            next.push({ ...item, quantity: 1 });
          }
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<ListContextValue>(() => {
    return {
      items,
      ready,
      addItem,
      addMany,
      removeItem: (rowId) =>
        setItems((prev) => prev.filter((p) => listRowId(p) !== rowId)),
      updateQty: (rowId, quantity) =>
        setItems((prev) =>
          prev
            .map((p) =>
              listRowId(p) === rowId
                ? { ...p, quantity: Math.max(0, quantity) }
                : p,
            )
            .filter((p) => p.quantity > 0),
        ),
      updateNote: (rowId, note) =>
        setItems((prev) =>
          prev.map((p) => (listRowId(p) === rowId ? { ...p, note } : p)),
        ),
      clear: () => setItems([]),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
      drawerOpen,
      setDrawerOpen,
    };
  }, [items, ready, drawerOpen, addItem, addMany]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useList() {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error("useList must be used within ListProvider");
  return ctx;
}
