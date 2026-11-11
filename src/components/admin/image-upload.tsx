"use client";

import { useEffect, useState } from "react";
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
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function SortableImage({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: url });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="group relative aspect-square overflow-hidden rounded-md border border-[var(--line)] bg-[var(--paper-deep)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Görsel ${index + 1}`}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 cursor-grab rounded bg-black/50 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
        title="Sürükle"
      >
        ⠿
      </button>
      {index === 0 && (
        <span className="absolute bottom-1 left-1 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--ink)]">
          Kapak
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
        title="Kaldır"
      >
        ✕
      </button>
    </div>
  );
}

export function ImageUpload({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const supabase = getBrowserSupabase();
    const urls = [...value];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) {
        toast.error(`Yüklenemedi: ${file.name} — ${error.message}`);
        continue;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(path);
      urls.push(publicUrl);
    }
    setUploading(false);
    onChange(urls);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(String(active.id));
      const newIndex = value.indexOf(String(over.id));
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const uploadTile = (
    <label
      className={`grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-[var(--line)] text-2xl text-[var(--ink-muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] ${uploading ? "animate-pulse" : ""}`}
      title="Görsel yükle"
    >
      {uploading ? "…" : "+"}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  if (!mounted) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-md border border-[var(--line)] bg-[var(--paper-deep)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          {uploadTile}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {value.map((url, i) => (
              <SortableImage
                key={url}
                url={url}
                index={i}
                onRemove={() => onChange(value.filter((u) => u !== url))}
              />
            ))}
            {uploadTile}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-[var(--ink-muted)]">
        Sürükleyerek sıralayın — ilk görsel kapak olur.
      </p>
    </div>
  );
}
