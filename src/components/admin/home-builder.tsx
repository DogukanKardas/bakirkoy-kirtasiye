"use client";

import { useEffect, useState, useTransition } from "react";
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
import type { Collection, HomeSection } from "@db/queries";
import type { AdminProduct } from "@db/admin-queries";
import {
  reorderHomeSectionsAction,
  updateHomeSectionAction,
} from "@/lib/actions/home-sections";
import { ABadge, AButton, ACard, AInput, AModal, ATextarea, AToggle } from "./ui";

const TYPE_LABEL: Record<string, string> = {
  hero: "Karşılama (Hero)",
  manifesto: "Manifesto",
  categories: "Kategori Şeridi",
  featured: "Rafta Yeni (Öne Çıkanlar)",
  collection: "Koleksiyon Vitrini",
  list_cta: "Okul Listesi CTA",
  brands: "Marka Şeridi",
  shop: "Dükkân Bölümü",
  banner: "Duyuru / Banner",
};

type Draft = {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  enabled: boolean;
};

function ContentEditor({
  draft,
  products,
  collections,
  onChange,
}: {
  draft: Draft;
  products: AdminProduct[];
  collections: Collection[];
  onChange: (content: Record<string, unknown>) => void;
}) {
  const [q, setQ] = useState("");
  const c = draft.content;
  const set = (key: string, value: unknown) => onChange({ ...c, [key]: value });

  if (draft.type === "hero") {
    return (
      <div className="space-y-3">
        <AInput
          label="1. Satır"
          value={String(c.line1 ?? "")}
          onChange={(e) => set("line1", e.target.value)}
        />
        <AInput
          label="2. Satır (vurgulu olacak satırı aşağıdan seçin)"
          value={String(c.line2 ?? "")}
          onChange={(e) => set("line2", e.target.value)}
        />
        <AInput
          label="3. Satır"
          value={String(c.line3 ?? "")}
          onChange={(e) => set("line3", e.target.value)}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ink-soft)]">
            Vurgulanan satır (sarı fosforlu)
          </span>
          <select
            value={String(c.highlight ?? "")}
            onChange={(e) => set("highlight", e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
          >
            <option value="">— vurgu yok —</option>
            {[c.line1, c.line2, c.line3]
              .filter((l): l is string => typeof l === "string" && !!l)
              .map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
          </select>
        </label>
        <ATextarea
          label="Alt paragraf (boş bırakılırsa dükkân bilgisinden üretilir)"
          rows={2}
          value={String(c.lead ?? "")}
          onChange={(e) => set("lead", e.target.value)}
        />
      </div>
    );
  }

  if (draft.type === "featured") {
    const ids = Array.isArray(c.product_ids) ? (c.product_ids as string[]) : [];
    const results = q.trim()
      ? products
          .filter((p) =>
            p.name.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")),
          )
          .slice(0, 6)
      : [];
    return (
      <div className="space-y-3">
        <AInput
          label="Bölüm Başlığı"
          value={String(c.heading ?? "")}
          onChange={(e) => set("heading", e.target.value)}
        />
        <div>
          <p className="mb-1 text-sm text-[var(--ink-soft)]">
            Ürünler (boş bırakılırsa en yeni 6 ürün gösterilir)
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ürün ara…"
            className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
          />
          {results.length > 0 && (
            <ul className="mt-1 rounded-md border border-[var(--line)]">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={ids.includes(p.id)}
                    onClick={() => {
                      set("product_ids", [...ids, p.id]);
                      setQ("");
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--paper-deep)] disabled:opacity-40"
                  >
                    {p.name} {ids.includes(p.id) ? "✓" : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {ids.length > 0 && (
            <ul className="mt-2 space-y-1">
              {ids.map((id) => {
                const p = products.find((x) => x.id === id);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded bg-[var(--paper-deep)] px-2.5 py-1.5 text-sm"
                  >
                    <span className="truncate">{p?.name ?? id}</span>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "product_ids",
                          ids.filter((x) => x !== id),
                        )
                      }
                      className="text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (draft.type === "banner") {
    return (
      <div className="space-y-3">
        <AInput
          label="Başlık"
          value={String(c.heading ?? "")}
          onChange={(e) => set("heading", e.target.value)}
        />
        <ATextarea
          label="Metin"
          rows={3}
          value={String(c.text ?? "")}
          onChange={(e) => set("text", e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AInput
            label="Buton Metni (ops.)"
            value={String(c.ctaLabel ?? "")}
            onChange={(e) => set("ctaLabel", e.target.value)}
          />
          <AInput
            label="Buton Bağlantısı (ops.)"
            placeholder="/liste"
            value={String(c.ctaHref ?? "")}
            onChange={(e) => set("ctaHref", e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (draft.type === "collection") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--ink-soft)]">Koleksiyon</span>
        <select
          value={String(c.collection_id ?? "")}
          onChange={(e) => set("collection_id", e.target.value)}
          className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
        >
          <option value="">— seçin —</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <ATextarea
      label="İçerik (JSON)"
      rows={6}
      value={JSON.stringify(c, null, 2)}
      onChange={(e) => {
        try {
          onChange(JSON.parse(e.target.value));
        } catch {
          // yazım devam ediyor
        }
      }}
    />
  );
}

function SectionRow({
  section,
  onEdit,
  onToggle,
}: {
  section: HomeSection;
  onEdit: () => void;
  onToggle: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-[var(--ink-muted)] hover:text-[var(--ink)]"
        aria-label="Sürükle"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{section.title}</p>
        <p className="text-xs text-[var(--ink-muted)]">
          {TYPE_LABEL[section.type] ?? section.type}
        </p>
      </div>
      {!section.enabled && <ABadge tone="neutral">Kapalı</ABadge>}
      <AToggle checked={section.enabled} onChange={onToggle} label="Açık" />
      <AButton variant="ghost" onClick={onEdit}>
        İçeriği Düzenle
      </AButton>
    </div>
  );
}

export function HomeBuilder({
  sections,
  products,
  collections,
}: {
  sections: HomeSection[];
  products: AdminProduct[];
  collections: Collection[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ordered, setOrdered] = useState(sections);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    startTransition(async () => {
      const res = await reorderHomeSectionsAction(next.map((s) => s.id));
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Sıralama kaydedildi");
        router.refresh();
      }
    });
  };

  const toggle = (section: HomeSection, enabled: boolean) => {
    startTransition(async () => {
      const res = await updateHomeSectionAction({
        id: section.id,
        title: section.title,
        content: section.content,
        enabled,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(enabled ? "Bölüm açıldı" : "Bölüm kapatıldı");
        router.refresh();
      }
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    startTransition(async () => {
      const res = await updateHomeSectionAction({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        enabled: draft.enabled,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Bölüm kaydedildi — sitede anında yayında");
        setDraft(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Ana Sayfa
        </h1>
        <div className="flex gap-2">
          <AButton variant="outline" onClick={() => setPreview(true)}>
            Önizleme
          </AButton>
          <a href="/" target="_blank" rel="noreferrer">
            <AButton variant="ghost">Siteyi Aç ↗</AButton>
          </a>
        </div>
      </div>
      <p className="text-sm text-[var(--ink-muted)]">
        Bölümleri sürükleyerek sıralayın, açıp kapatın veya içeriklerini
        düzenleyin. Değişiklikler kaydedildiği anda sitede görünür.
      </p>

      {!mounted ? (
        <div className="space-y-2">
          {ordered.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {TYPE_LABEL[s.type] ?? s.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={ordered.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {ordered.map((s) => (
              <SectionRow
                key={s.id}
                section={s}
                onToggle={(v) => toggle(s, v)}
                onEdit={() =>
                  setDraft({
                    id: s.id,
                    type: s.type,
                    title: s.title,
                    content: s.content,
                    enabled: s.enabled,
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      )}

      <AModal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft ? `${TYPE_LABEL[draft.type] ?? draft.type} — İçerik` : ""}
        wide
      >
        {draft && (
          <div className="space-y-3">
            <AInput
              label="Bölüm Adı (panel içinde görünür)"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <ContentEditor
              draft={draft}
              products={products}
              collections={collections}
              onChange={(content) => setDraft({ ...draft, content })}
            />
            <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-3">
              <AButton variant="ghost" onClick={() => setDraft(null)}>
                Vazgeç
              </AButton>
              <AButton onClick={saveDraft} disabled={pending}>
                Kaydet
              </AButton>
            </div>
          </div>
        )}
      </AModal>

      <AModal open={preview} onClose={() => setPreview(false)} title="Önizleme (kayıtlı durum)" wide>
        <div className="space-y-3">
          {ordered.filter((s) => s.enabled).map((s) => (
            <div
              key={s.id}
              className="rounded-md border border-[var(--line)] bg-[var(--paper-deep)] p-4"
            >
              <p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">
                {TYPE_LABEL[s.type] ?? s.type}
              </p>
              {s.type === "hero" && (
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                  {String(s.content.line1 ?? "")} {String(s.content.line2 ?? "")}{" "}
                  {String(s.content.line3 ?? "")}
                </p>
              )}
              {s.type === "featured" && (
                <p className="mt-1 text-sm">
                  {String(s.content.heading ?? "Öne çıkanlar")} —{" "}
                  {Array.isArray(s.content.product_ids) &&
                  (s.content.product_ids as string[]).length
                    ? `${(s.content.product_ids as string[]).length} seçili ürün`
                    : "en yeni 6 ürün"}
                </p>
              )}
              {s.type === "banner" && (
                <p className="mt-1 text-sm">
                  <strong>{String(s.content.heading ?? "")}</strong>{" "}
                  {String(s.content.text ?? "").slice(0, 120)}…
                </p>
              )}
              {s.type === "collection" && (
                <p className="mt-1 text-sm">
                  Koleksiyon:{" "}
                  {collections.find(
                    (c) => c.id === String(s.content.collection_id ?? ""),
                  )?.name ?? "—"}
                </p>
              )}
            </div>
          ))}
          <p className="text-xs text-[var(--ink-muted)]">
            Bu, bölümlerin sırasını ve içeriğini gösteren basitleştirilmiş
            önizlemedir; gerçek görünüm için &quot;Siteyi Aç&quot;ı kullanın.
          </p>
        </div>
      </AModal>
    </div>
  );
}
