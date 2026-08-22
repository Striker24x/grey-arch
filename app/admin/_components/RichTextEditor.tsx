"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function RichTextEditor({
  value,
  onChange,
  dir = "ltr",
  variant = "boxed",
  onUploadImage,
}: {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
  /** "boxed" = bordered form field (default). "page" = borderless, flows into a document page. */
  variant?: "boxed" | "page";
  /** When provided, shows an "Insert image" toolbar button that uploads the file and inserts it as a block. */
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const contentClass = variant === "page"
    ? "prose-editor prose-editor-page outline-none"
    : "input min-h-[8rem] resize-y overflow-auto prose-editor";

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // `useEditor` only captures `onChange` once, at creation — without this ref, every
  // keystroke would call the very first `onChange` closure (bound to whichever language
  // tab was active on mount), silently writing all edits into that one translation.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3] } }),
      Image.configure({ inline: false, HTMLAttributes: { class: "rich-image" } }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { dir, class: contentClass },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
  });

  // Re-sync editor content when `value` changes from outside (e.g. switching
  // the language tab reuses the same editor instance for a different translation).
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { dir, class: contentClass } } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, editor, variant]);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor || !onUploadImage) return;
    setUploading(true);
    try {
      const src = await onUploadImage(file);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  const toolbar = (
    <div
      className={
        variant === "page"
          ? "mb-3 flex flex-wrap gap-0.5"
          : "mb-1.5 flex flex-wrap gap-1 rounded-t-sm border border-b-0 border-line-300 bg-stone-50 p-1.5 dark:bg-paper-300"
      }
    >
      <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading">
        H3
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
        • List
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
        1. List
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
        &ldquo;&rdquo;
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
        ↶
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
        ↷
      </ToolbarButton>
      {onUploadImage && (
        <>
          <span className="mx-1 w-px self-stretch bg-line-300" />
          <ToolbarButton onClick={() => fileInputRef.current?.click()} label="Insert image">
            {uploading ? "…" : "🖼 Image"}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
        </>
      )}
    </div>
  );

  if (variant === "page") {
    return (
      <div>
        {toolbar}
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      <EditorContent editor={editor} className="[&_.input]:rounded-t-none" />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-sm px-2 py-1 text-xs transition-colors ${
        active ? "bg-graphite-900 text-white" : "text-stone-600 hover:bg-stone-200 dark:hover:bg-paper-200"
      }`}
    >
      {children}
    </button>
  );
}
