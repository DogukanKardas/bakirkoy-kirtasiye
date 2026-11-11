"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export function RichText({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? "Yazmaya başlayın…" }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[140px] px-3 py-2 outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-sm transition ${
      active
        ? "bg-[var(--ink)] text-[var(--paper)]"
        : "text-[var(--ink-soft)] hover:bg-[var(--paper-deep)]"
    }`;

  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--paper)] focus-within:border-[var(--ink)]">
      <div className="flex flex-wrap gap-0.5 border-b border-[var(--line)] p-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={btn(!!editor?.isActive("bold"))}
          title="Kalın"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={btn(!!editor?.isActive("italic"))}
          title="İtalik"
        >
          <em>İ</em>
        </button>
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btn(!!editor?.isActive("heading", { level: 2 }))}
          title="Başlık"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btn(!!editor?.isActive("heading", { level: 3 }))}
          title="Alt başlık"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={btn(!!editor?.isActive("bulletList"))}
          title="Madde listesi"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={btn(!!editor?.isActive("orderedList"))}
          title="Numaralı liste"
        >
          1. Liste
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Bağlantı adresi:");
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={btn(!!editor?.isActive("link"))}
          title="Bağlantı"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().unsetAllMarks().run()}
          className={btn(false)}
          title="Biçimi temizle"
        >
          Temizle
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
