"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { Category } from "@db/queries";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  upsertCategoryAction,
} from "@/lib/actions/categories";
import { ImageUpload } from "./image-upload";
import { AButton, ACard, AConfirm, AInput, AModal } from "./ui";

type TreeNode = Category & { children: Category[] };

function buildTree(categories: Category[]): TreeNode[] {
  const roots = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.position - b.position);
  return roots.map((r) => ({
    ...r,
    children: categories
      .filter((c) => c.parentId === r.id)
      .sort((a, b) => a.position - b.position),
  }));
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
}: {
  category: Category;
  depth: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2.5 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-[var(--ink-muted)] hover:text-[var(--ink)]"
        title="Sürükleyerek sırala"
        aria-label="Sürükle"
      >
        ⠿
      </button>
      {depth > 0 && <span className="text-[var(--ink-muted)]">↳</span>}
      {category.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.imageUrl}
          alt=""
          className="h-8 w-8 rounded border border-[var(--line)] object-cover"
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium">
        {category.name}
      </span>
      <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
        {category.slug}
      </span>
      <button
        onClick={() => onEdit(category)}
        className="rounded px-2 py-1 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--paper-deep)]"
      >
        Düzenle
      </button>
      <button
        onClick={() => onDelete(category)}
        className="rounded px-2 py-1 text-sm text-red-600 transition hover:bg-red-50"
      >
        Sil
      </button>
    </div>
  );
}

export function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Category | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tree = useMemo(() => buildTree(categories), [categories]);

  const openEdit = (c: Category | "new") => {
    setEditTarget(c);
    setName(c === "new" ? "" : c.name);
    setParentId(c === "new" ? "" : (c.parentId ?? ""));
    setImageUrl(c === "new" ? [] : c.imageUrl ? [c.imageUrl] : []);
  };

  const save = () => {
    if (name.trim().length < 2) {
      toast.error("Kategori adı gerekli");
      return;
    }
    startTransition(async () => {
      const res = await upsertCategoryAction({
        id: editTarget === "new" ? undefined : (editTarget as Category).id,
        name: name.trim(),
        parentId: parentId || null,
        imageUrl: imageUrl[0] ?? "",
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Kategori kaydedildi");
        setEditTarget(null);
        router.refresh();
      }
    });
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(deleteTarget.id);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Kategori silindi");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeCat = categories.find((c) => c.id === active.id);
    const overCat = categories.find((c) => c.id === over.id);
    if (!activeCat || !overCat) return;
    if ((activeCat.parentId ?? null) !== (overCat.parentId ?? null)) {
      toast.info(
        "Farklı düzeyler arasında sürükleme yok — iç içe taşımak için Düzenle → Üst Kategori kullanın.",
      );
      return;
    }
    const siblings = categories
      .filter(
        (c) => (c.parentId ?? null) === (activeCat.parentId ?? null),
      )
      .sort((a, b) => a.position - b.position);
    const oldIndex = siblings.findIndex((c) => c.id === active.id);
    const newIndex = siblings.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(siblings, oldIndex, newIndex);
    startTransition(async () => {
      const res = await reorderCategoriesAction(
        reordered.map((c, i) => ({
          id: c.id,
          parentId: c.parentId,
          position: i,
        })),
      );
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Sıralama kaydedildi");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Kategoriler
        </h1>
        <AButton onClick={() => openEdit("new")}>Yeni Kategori</AButton>
      </div>

      <p className="text-sm text-[var(--ink-muted)]">
        Sürükleyerek sıralayın; bir kategoriyi başka bir kategorinin altına
        almak için Düzenle → Üst Kategori seçin.
      </p>

      {!mounted ? (
        <div className="space-y-2">
          {tree.map((root) => (
            <ACard key={root.id} className="space-y-2 p-2">
              <div className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-2.5 py-2 font-medium">
                {root.name}
              </div>
              {root.children.map((child) => (
                <div
                  key={child.id}
                  className="ml-8 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2.5 py-2 text-sm"
                >
                  ↳ {child.name}
                </div>
              ))}
            </ACard>
          ))}
        </div>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-2">
          {tree.map((root) => (
            <ACard key={root.id} className="space-y-2 p-2">
              <SortableContext
                items={tree.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <CategoryRow
                  category={root}
                  depth={0}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              </SortableContext>
              {root.children.length > 0 && (
                <div className="ml-8 space-y-2">
                  <SortableContext
                    items={root.children.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {root.children.map((child) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        depth={1}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </SortableContext>
                </div>
              )}
            </ACard>
          ))}
          {tree.length === 0 && (
            <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
              Henüz kategori yok.
            </p>
          )}
        </div>
      </DndContext>
      )}

      <AModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget === "new" ? "Yeni Kategori" : "Kategoriyi Düzenle"}
      >
        <div className="space-y-3">
          <AInput
            label="Kategori Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--ink-soft)]">
              Üst Kategori (boş = ana kategori)
            </span>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
            >
              <option value="">— Ana kategori —</option>
              {tree
                .filter((r) =>
                  editTarget && editTarget !== "new"
                    ? r.id !== editTarget.id
                    : true,
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </label>
          <div>
            <p className="mb-1 text-sm text-[var(--ink-soft)]">
              Kategori Görseli
            </p>
            <ImageUpload
              value={imageUrl}
              onChange={(urls) => setImageUrl(urls.slice(-1))}
              folder="categories"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AButton variant="ghost" onClick={() => setEditTarget(null)}>
              Vazgeç
            </AButton>
            <AButton onClick={save} disabled={pending}>
              Kaydet
            </AButton>
          </div>
        </div>
      </AModal>

      <AConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Kategori silinsin mi?"
        body={`"${deleteTarget?.name}" silinecek. İçinde ürün varsa silinemez; alt kategoriler ana düzeye taşınır.`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
