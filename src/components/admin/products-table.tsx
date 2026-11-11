"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import type { Category } from "@db/queries";
import type { AdminProduct } from "@db/admin-queries";
import { formatPrice } from "@/lib/format";
import {
  bulkProductsAction,
  deleteProductsAction,
  saveProductAction,
} from "@/lib/actions/products";
import { ABadge, AButton, AConfirm, AToggle } from "./ui";

function toPayload(p: AdminProduct, patch: Record<string, unknown> = {}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    sku: p.sku || "SKU-YOK",
    price: p.price,
    stock: p.stock,
    categoryId: p.categoryId,
    brandId: p.brandId,
    tags: p.tags,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    images: p.images,
    variants: p.variants,
    active: p.active,
    ...patch,
  };
}

function EditablePrice({
  product,
  onSaved,
}: {
  product: AdminProduct;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState((product.price / 100).toFixed(2));
  const [pending, startTransition] = useTransition();

  const save = () => {
    const tl = Number(value.replace(",", "."));
    const kurus = Math.round(tl * 100);
    if (!Number.isFinite(tl) || kurus < 0 || kurus === product.price) {
      setEditing(false);
      setValue((product.price / 100).toFixed(2));
      return;
    }
    startTransition(async () => {
      const res = await saveProductAction(toPayload(product, { price: kurus }));
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Fiyat güncellendi");
        onSaved();
      }
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="Düzenlemek için tıklayın"
        className="rounded px-1 font-[family-name:var(--font-mono)] text-sm transition hover:bg-[var(--paper-deep)]"
      >
        {formatPrice(product.price)}
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={value}
      disabled={pending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-24 rounded border border-[var(--ink)] bg-[var(--paper)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-sm outline-none"
      aria-label="Fiyat (TL)"
    />
  );
}

function EditableStock({
  product,
  onSaved,
}: {
  product: AdminProduct;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.stock));
  const [pending, startTransition] = useTransition();

  const save = () => {
    const stock = Math.max(0, Math.round(Number(value)));
    if (!Number.isFinite(stock) || stock === product.stock) {
      setEditing(false);
      setValue(String(product.stock));
      return;
    }
    startTransition(async () => {
      const res = await saveProductAction(toPayload(product, { stock }));
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Stok güncellendi");
        onSaved();
      }
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="Düzenlemek için tıklayın"
        className={`rounded px-1.5 font-[family-name:var(--font-mono)] text-sm transition hover:bg-[var(--paper-deep)] ${product.stock === 0 ? "font-bold text-red-600" : ""}`}
      >
        {product.stock}
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={value}
      disabled={pending}
      inputMode="numeric"
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-16 rounded border border-[var(--ink)] bg-[var(--paper)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-sm outline-none"
      aria-label="Stok adedi"
    />
  );
}

export function ProductsTable({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("kategori") ?? "",
  );
  const [stockFilter, setStockFilter] = useState(
    searchParams.get("stok") ?? "",
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [bulkValue, setBulkValue] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [pending, startTransition] = useTransition();
  const [colsOpen, setColsOpen] = useState(false);

  const refresh = () => router.refresh();

  const data = useMemo(() => {
    let rows = products;
    if (categoryFilter) rows = rows.filter((p) => p.categorySlug === categoryFilter);
    if (stockFilter === "var") rows = rows.filter((p) => p.stock > 0);
    if (stockFilter === "yok") rows = rows.filter((p) => p.stock === 0);
    return rows;
  }, [products, categoryFilter, stockFilter]);

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((k) => rowSelection[k])
        .map((i) => data[Number(i)]?.id)
        .filter(Boolean) as string[],
    [rowSelection, data],
  );

  const columns = useMemo<ColumnDef<AdminProduct>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Tümünü seç"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Satırı seç"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Ürün",
        cell: ({ row }) => {
          const p = row.original;
          const img = p.images[0]?.url ?? p.imageUrl;
          return (
            <div className="flex items-center gap-2.5">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt=""
                  className="h-9 w-9 rounded border border-[var(--line)] object-cover"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded border border-[var(--line)] bg-[var(--paper-deep)] text-xs text-[var(--ink-muted)]">
                  —
                </span>
              )}
              <div className="min-w-0">
                <Link
                  href={`/admin/urunler/${p.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {p.name}
                </Link>
                <p className="truncate text-xs text-[var(--ink-muted)]">
                  {p.brandName ?? ""} {p.isFeatured ? "• Öne çıkan" : ""}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => (
          <span className="font-[family-name:var(--font-mono)] text-xs">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Kategori",
        cell: ({ getValue }) => (
          <span className="text-sm">{String(getValue() ?? "") || "—"}</span>
        ),
      },
      {
        accessorKey: "price",
        header: "Fiyat",
        cell: ({ row }) => (
          <EditablePrice product={row.original} onSaved={refresh} />
        ),
      },
      {
        accessorKey: "stock",
        header: "Stok",
        cell: ({ row }) => (
          <EditableStock product={row.original} onSaved={refresh} />
        ),
      },
      {
        accessorKey: "active",
        header: "Durum",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <AToggle
                checked={p.active}
                onChange={(v) => {
                  startTransition(async () => {
                    const res = await saveProductAction(
                      toPayload(p, { active: v }),
                    );
                    if ("error" in res) toast.error(res.error);
                    else {
                      toast.success(v ? "Yayında" : "Gizlendi");
                      refresh();
                    }
                  });
                }}
              />
              {p.active ? (
                <ABadge tone="green">Yayında</ABadge>
              ) : (
                <ABadge tone="red">Gizli</ABadge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "views",
        header: "Görüntülenme",
        cell: ({ getValue }) => (
          <span className="font-[family-name:var(--font-mono)] text-xs">
            {Number(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Güncelleme",
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          return (
            <span className="text-xs text-[var(--ink-muted)]">
              {v ? new Date(v).toLocaleDateString("tr-TR") : "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/urunler/${row.original.id}`}
              className="rounded px-2 py-1 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--paper-deep)]"
            >
              Düzenle
            </Link>
            <button
              onClick={() => setConfirmDelete([row.original.id])}
              className="rounded px-2 py-1 text-sm text-red-600 transition hover:bg-red-50"
            >
              Sil
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, columnVisibility, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(data.indexOf(row)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
    globalFilterFn: (row, _col, value) => {
      const q = String(value).toLocaleLowerCase("tr");
      const p = row.original;
      return [p.name, p.sku, p.brandName ?? "", p.categoryName]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(q);
    },
  });

  const runBulk = (
    op: "show" | "hide" | "delete" | "category" | "price_percent" | "price_amount",
    value?: string,
  ) => {
    if (!selectedIds.length) return;
    startTransition(async () => {
      const res = await bulkProductsAction({ ids: selectedIds, op, value });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(`${selectedIds.length} ürün güncellendi`);
        setRowSelection({});
        setBulkValue("");
        refresh();
      }
    });
  };

  const doDelete = (ids: string[]) => {
    startTransition(async () => {
      const res = await deleteProductsAction(ids);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(`${ids.length} ürün silindi (yayından kaldırıldı)`);
        setRowSelection({});
        refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Ürünler
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/urunler/aktar">
            <AButton variant="outline">İçe / Dışa Aktar</AButton>
          </Link>
          <Link href="/admin/urunler/yeni">
            <AButton>Yeni Ürün</AButton>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Ara: ad, SKU, marka…"
          className="w-64 rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
          aria-label="Kategori filtresi"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
          aria-label="Stok filtresi"
        >
          <option value="">Stok: tümü</option>
          <option value="var">Stokta olanlar</option>
          <option value="yok">Stokta olmayanlar</option>
        </select>
        <div className="relative ml-auto">
          <AButton variant="outline" onClick={() => setColsOpen((o) => !o)}>
            Sütunlar
          </AButton>
          {colsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setColsOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border border-[var(--line)] bg-[var(--paper)] p-2 shadow-lg">
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.id !== "select" && c.id !== "actions")
                  .map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-[var(--paper-deep)]"
                    >
                      <input
                        type="checkbox"
                        checked={c.getIsVisible()}
                        onChange={c.getToggleVisibilityHandler()}
                      />
                      {typeof c.columnDef.header === "string"
                        ? c.columnDef.header
                        : c.id}
                    </label>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--accent-2)] bg-[var(--paper)] p-2.5 text-sm">
          <span className="font-medium">{selectedIds.length} ürün seçili</span>
          <AButton variant="ghost" disabled={pending} onClick={() => runBulk("show")}>
            Yayına Al
          </AButton>
          <AButton variant="ghost" disabled={pending} onClick={() => runBulk("hide")}>
            Gizle
          </AButton>
          <select
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm"
            aria-label="Kategori seç"
          >
            <option value="">Kategori seç…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <AButton
            variant="ghost"
            disabled={pending || !bulkCategory}
            onClick={() => runBulk("category", bulkCategory)}
          >
            Kategoriye Taşı
          </AButton>
          <input
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            placeholder="örn. 10"
            className="w-20 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm"
            aria-label="Fiyat değeri"
          />
          <AButton
            variant="ghost"
            disabled={pending || !bulkValue}
            onClick={() => runBulk("price_percent", bulkValue)}
          >
            % Zam/İndirim
          </AButton>
          <AButton
            variant="ghost"
            disabled={pending || !bulkValue}
            onClick={() => runBulk("price_amount", bulkValue)}
          >
            ₺ Ekle/Çıkar
          </AButton>
          <AButton
            variant="danger"
            disabled={pending}
            onClick={() => setConfirmDelete(selectedIds)}
          >
            Sil
          </AButton>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--paper)]">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[var(--line)]">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]"
                  >
                    {h.column.getCanSort() ? (
                      <button
                        onClick={h.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-[var(--ink)]"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: "↑", desc: "↓" }[
                          h.column.getIsSorted() as string
                        ] ?? ""}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-[var(--ink-muted)]"
                >
                  Ürün bulunamadı.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--paper-deep)]/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
        <span>
          Toplam {table.getFilteredRowModel().rows.length} ürün
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5"
            aria-label="Sayfa boyutu"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n} / sayfa
              </option>
            ))}
          </select>
          <AButton
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            ← Önceki
          </AButton>
          <AButton
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Sonraki →
          </AButton>
        </div>
      </div>

      <AConfirm
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        title="Ürün silinsin mi?"
        body={`${confirmDelete?.length ?? 0} ürün yayından kaldırılacak.`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
