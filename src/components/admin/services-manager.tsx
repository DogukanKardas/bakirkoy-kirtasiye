"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@db/queries";
import {
  deleteServiceAction,
  upsertServiceAction,
} from "@/lib/actions/services";
import {
  ABadge,
  AButton,
  ACard,
  AConfirm,
  AEmpty,
  AInput,
  AModal,
  ATextarea,
} from "./ui";

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Service | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [unitNote, setUnitNote] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);

  const openEdit = (s: Service | "new") => {
    setEditTarget(s);
    setName(s === "new" ? "" : s.name);
    setDescription(s === "new" ? "" : s.description);
    setPriceLabel(s === "new" ? "" : s.priceLabel);
    setUnitNote(s === "new" ? "" : s.unitNote);
    setSortOrder(s === "new" ? services.length + 1 : s.sortOrder);
    setActive(s === "new" ? true : s.active);
  };

  const save = () => {
    if (name.trim().length < 2) {
      toast.error("Hizmet adı gerekli");
      return;
    }
    startTransition(async () => {
      const res = await upsertServiceAction({
        id: editTarget === "new" ? undefined : (editTarget as Service).id,
        name: name.trim(),
        description: description.trim(),
        priceLabel: priceLabel.trim(),
        unitNote: unitNote.trim(),
        sortOrder,
        active,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Hizmet kaydedildi");
        setEditTarget(null);
        router.refresh();
      }
    });
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteServiceAction(deleteTarget.id);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Hizmet silindi");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Hizmetler
        </h1>
        <AButton onClick={() => openEdit("new")}>Yeni Hizmet</AButton>
      </div>

      {services.length === 0 ? (
        <AEmpty>
          Henüz hizmet yok. Fotokopi, baskı, ciltleme gibi hizmetleri ekleyin.
        </AEmpty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ACard key={s.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{s.name}</p>
                <ABadge tone={s.active ? "green" : "neutral"}>
                  {s.active ? "Yayında" : "Gizli"}
                </ABadge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-soft)]">
                {s.description}
              </p>
              <p className="mt-2 font-[family-name:var(--font-mono)] text-sm">
                {s.priceLabel}
                <span className="ml-1 text-xs text-[var(--ink-muted)]">
                  {s.unitNote}
                </span>
              </p>
              <div className="mt-3 flex gap-1">
                <AButton variant="ghost" onClick={() => openEdit(s)}>
                  Düzenle
                </AButton>
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </ACard>
          ))}
        </div>
      )}

      <AModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget === "new" ? "Yeni Hizmet" : "Hizmeti Düzenle"}
      >
        <div className="space-y-3">
          <AInput
            label="Hizmet Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <ATextarea
            label="Açıklama"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <AInput
              label="Fiyat etiketi (örn. ₺5)"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
            />
            <AInput
              label="Birim notu (örn. sayfa başına)"
              value={unitNote}
              onChange={(e) => setUnitNote(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AInput
              label="Sıra"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
            <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 accent-[var(--ink)]"
              />
              Yayında
            </label>
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
        title="Hizmet silinsin mi?"
        body={`"${deleteTarget?.name}" vitrinden kaldırılacak.`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
