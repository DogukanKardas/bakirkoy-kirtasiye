"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Brand } from "@db/queries";
import { deleteBrandAction, upsertBrandAction } from "@/lib/actions/brands";
import { ImageUpload } from "./image-upload";
import { AButton, ACard, AConfirm, AEmpty, AInput, AModal } from "./ui";

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Brand | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string[]>([]);

  const openEdit = (b: Brand | "new") => {
    setEditTarget(b);
    setName(b === "new" ? "" : b.name);
    setLogo(b === "new" ? [] : b.logoUrl ? [b.logoUrl] : []);
  };

  const save = () => {
    if (name.trim().length < 2) {
      toast.error("Marka adı gerekli");
      return;
    }
    startTransition(async () => {
      const res = await upsertBrandAction({
        id: editTarget === "new" ? undefined : (editTarget as Brand).id,
        name: name.trim(),
        logoUrl: logo[0] ?? "",
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Marka kaydedildi");
        setEditTarget(null);
        router.refresh();
      }
    });
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteBrandAction(deleteTarget.id);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Marka silindi; ürünler markasız kaldı");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Markalar
        </h1>
        <AButton onClick={() => openEdit("new")}>Yeni Marka</AButton>
      </div>

      {brands.length === 0 ? (
        <AEmpty>
          Henüz marka yok. Faber-Castell, UHU gibi markaları ekleyin.
        </AEmpty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <ACard key={b.id} className="p-4 text-center">
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  className="mx-auto h-14 w-14 rounded-full border border-[var(--line)] object-cover"
                />
              ) : (
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--paper-deep)] font-[family-name:var(--font-display)] text-2xl">
                  {b.name.charAt(0)}
                </span>
              )}
              <p className="mt-2 truncate font-medium">{b.name}</p>
              <p className="truncate font-[family-name:var(--font-mono)] text-xs text-[var(--ink-muted)]">
                {b.slug}
              </p>
              <div className="mt-3 flex justify-center gap-1">
                <AButton variant="ghost" onClick={() => openEdit(b)}>
                  Düzenle
                </AButton>
                <button
                  onClick={() => setDeleteTarget(b)}
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
        title={editTarget === "new" ? "Yeni Marka" : "Markayı Düzenle"}
      >
        <div className="space-y-3">
          <AInput
            label="Marka Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className="mb-1 text-sm text-[var(--ink-soft)]">Logo</p>
            <ImageUpload
              value={logo}
              onChange={(urls) => setLogo(urls.slice(-1))}
              folder="brands"
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
        title="Marka silinsin mi?"
        body={`"${deleteTarget?.name}" silinecek; bu markaya bağlı ürünler markasız kalır.`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
