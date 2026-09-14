"use client";

import { useRef, useState } from "react";
import type { AdminLocale } from "@/lib/data-manager";
import { SERVICE_LAYOUT_LIST, resolveServiceLayout, type ServiceLayoutId } from "@/lib/service-layouts";
import { uploadToCloudinary } from "@/lib/client-upload";
import LayoutWireframe from "@/components/service-layouts/Wireframe";
import RichTextEditor from "./RichTextEditor";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

export type EditablePageTranslation = { title: string; intro: string; body?: string };

export type EditablePageData = {
  coverImage?: string;
  layout?: ServiceLayoutId;
  translations: Record<AdminLocale, EditablePageTranslation>;
};

/** Shared "Word page" editor for Studio/Services: cover image, one layout for the whole
 * page, and a free-form rich-text body per language. H3 headings in the body become
 * anchor-linked burger-menu entries (see lib/parse-content-blocks.ts). Mirrors the
 * narrative part of ProjectForm.tsx, without the project-only fields (slug/year/font/gallery). */
export default function PageEditorForm({
  data,
  onChange,
  coverImageFolder,
  bodyImageFolder,
  coverImageLabel = "Cover image",
}: {
  data: EditablePageData;
  onChange: (next: EditablePageData) => void;
  coverImageFolder: string;
  bodyImageFolder: string;
  coverImageLabel?: string;
}) {
  const [lang, setLang] = useState<AdminLocale>("en");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const t = data.translations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  function setTranslation(key: keyof EditablePageTranslation, value: string) {
    onChange({
      ...data,
      translations: { ...data.translations, [lang]: { ...t, [key]: value } },
    });
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const url = await uploadToCloudinary(file, folder);
    return url as string;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file, coverImageFolder);
      onChange({ ...data, coverImage: url });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Cover image + layout */}
      <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={coverImageLabel}>
            <div className="flex items-center gap-3">
              <input
                value={data.coverImage ?? ""}
                onChange={(e) => onChange({ ...data, coverImage: e.target.value })}
                className="input flex-1"
                placeholder="/images/grey-arch/..."
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="btn-secondary shrink-0"
              >
                Upload
              </button>
            </div>
            {data.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.coverImage} alt="" className="mt-2 h-24 w-full rounded-sm object-cover" />
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Layout Style">
            <p className="mb-3 -mt-1 text-xs text-stone-400">
              Controls how the text and images below are arranged on the page.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SERVICE_LAYOUT_LIST.map((option) => {
                const selected = option.id === resolveServiceLayout(data.layout);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange({ ...data, layout: option.id as ServiceLayoutId })}
                    aria-pressed={selected}
                    className={`group relative rounded-sm border p-2 text-left transition-colors ${
                      selected
                        ? "border-graphite-900 bg-paper-100 dark:border-paper-100"
                        : "border-stone-200 hover:border-stone-400 dark:border-line-300"
                    }`}
                  >
                    <LayoutWireframe id={option.id} className="w-full rounded-xs" />
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full border ${
                          selected
                            ? "border-graphite-900 bg-graphite-900 dark:border-paper-100 dark:bg-paper-100"
                            : "border-stone-300"
                        }`}
                      />
                      <span className="text-xs font-medium text-graphite-900">{option.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-stone-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>

      {/* Translated content */}
      <div className="rounded-sm border border-stone-200 bg-white dark:border-line-200 dark:bg-paper-200">
        <div className="flex border-b border-stone-200 dark:border-line-200">
          {LOCALES.map((l) => (
            <button
              key={l.key}
              type="button"
              onClick={() => setLang(l.key)}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                lang === l.key
                  ? "-mb-px border-graphite-900 text-graphite-900"
                  : "border-transparent text-stone-500 hover:text-graphite-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            <Field label="Title">
              <input
                value={t.title}
                onChange={(e) => setTranslation("title", e.target.value)}
                className="input"
                dir={dir}
              />
            </Field>
            <Field label="Intro text">
              <textarea
                value={t.intro}
                onChange={(e) => setTranslation("intro", e.target.value)}
                rows={3}
                className="input resize-y"
                dir={dir}
              />
            </Field>
          </div>
        </div>

        {/* Free-form narrative — H3 headings become anchor-linked burger-menu entries */}
        <div className="border-t border-stone-200 bg-stone-100 p-6 dark:border-line-200 dark:bg-paper-300 sm:p-10">
          <div
            className="mx-auto max-w-[760px] bg-white px-10 py-14 shadow-soft dark:bg-paper-200 sm:px-16"
            dir={dir}
          >
            <RichTextEditor
              value={t.body ?? ""}
              onChange={(html) => setTranslation("body", html)}
              dir={dir}
              variant="page"
              onUploadImage={(file) => uploadFile(file, bodyImageFolder)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-stone-600">{label}</label>
      {children}
    </div>
  );
}
