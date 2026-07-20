"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProjectRecord, ProjectTranslation, AdminLocale, CategoriesData } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

// Fallback static list used until API responds
const FALLBACK_CATEGORIES = [
  "projects", "heritage", "conservation", "residential",
  "interior", "landscape", "planning", "modeling", "digitalArch",
];

const TEXT_FIELDS: { key: keyof ProjectTranslation; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description", multiline: true },
  { key: "client", label: "Client" },
  { key: "buildingType", label: "Building Type" },
  { key: "area", label: "Area" },
  { key: "scope", label: "Scope" },
  { key: "summary", label: "Summary", multiline: true },
  { key: "challenge", label: "Challenge", multiline: true },
  { key: "approach", label: "Approach", multiline: true },
  { key: "process", label: "Process", multiline: true },
  { key: "drawings", label: "Drawings", multiline: true },
  { key: "materials", label: "Materials", multiline: true },
  { key: "visualization", label: "Visualization", multiline: true },
];

const emptyTranslation = (): ProjectTranslation => ({
  name: "", location: "", status: "Concept", servicesProvided: [],
  description: "", client: "", buildingType: "", area: "", scope: "",
  summary: "", challenge: "", approach: "", process: "",
  drawings: "", materials: "", visualization: "",
});

const FONT_OPTIONS = [
  { value: "", label: "— Website-Schriftart (Standard) —" },
  { value: "Playfair Display",     label: "Playfair Display" },
  { value: "Cormorant Garamond",   label: "Cormorant Garamond" },
  { value: "EB Garamond",          label: "EB Garamond" },
  { value: "Crimson Pro",          label: "Crimson Pro" },
  { value: "Libre Baskerville",    label: "Libre Baskerville" },
  { value: "Source Serif 4",       label: "Source Serif 4" },
  { value: "Josefin Sans",         label: "Josefin Sans" },
  { value: "Raleway",              label: "Raleway" },
  { value: "Montserrat",           label: "Montserrat" },
  { value: "Lato",                 label: "Lato" },
  { value: "Cinzel",               label: "Cinzel" },
  { value: "Italiana",             label: "Italiana" },
  { value: "Bodoni Moda",          label: "Bodoni Moda" },
  { value: "Quattrocento",         label: "Quattrocento" },
];

function emptyProject(): ProjectRecord {
  return {
    slug: "", year: String(new Date().getFullYear()),
    categories: [], image: "", galleryImages: [],
    translations: { en: emptyTranslation(), de: emptyTranslation(), ar: emptyTranslation() },
  };
}

export default function ProjectForm({
  initial,
  isNew,
}: {
  initial?: ProjectRecord;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<ProjectRecord>(initial ?? emptyProject());
  const [lang, setLang] = useState<AdminLocale>("en");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const font = data.font;
    if (!font) { setFontLoaded(false); return; }
    setFontLoaded(false);
    const id = "admin-project-font-preview";
    document.getElementById(id)?.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;700&display=swap`;
    link.onload = () => setFontLoaded(true);
    document.head.appendChild(link);
    return () => { document.getElementById(id)?.remove(); };
  }, [data.font]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        const cat = d as CategoriesData;
        const flat = cat.groups.flatMap((g) =>
          g.categories.map((c) => ({ id: c.id, label: c.translations.en || c.id }))
        );
        setCategories(flat.length ? flat : FALLBACK_CATEGORIES.map((id) => ({ id, label: id })));
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES.map((id) => ({ id, label: id })));
      });
  }, []);

  function setShared(key: keyof Omit<ProjectRecord, "translations">, value: unknown) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setTranslation(key: keyof ProjectTranslation, value: string) {
    setData((d) => ({
      ...d,
      translations: {
        ...d.translations,
        [lang]: { ...d.translations[lang], [key]: value },
      },
    }));
  }

  function setServices(value: string) {
    setData((d) => ({
      ...d,
      translations: {
        ...d.translations,
        [lang]: {
          ...d.translations[lang],
          servicesProvided: value.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      },
    }));
  }

  function toggleCategory(cat: string) {
    setData((d) => ({
      ...d,
      categories: d.categories.includes(cat)
        ? d.categories.filter((c) => c !== cat)
        : [...d.categories, cat],
    }));
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url as string;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "images/grey-arch/portfolio");
      setShared("image", url);
    } catch {
      setError("Image upload failed");
    }
    setUploading(false);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, "images/grey-arch/gallery")));
      setData((d) => ({ ...d, galleryImages: [...d.galleryImages, ...urls] }));
    } catch {
      setError("Gallery upload failed");
    }
    setUploading(false);
  }

  function removeGalleryImage(url: string) {
    setData((d) => ({ ...d, galleryImages: d.galleryImages.filter((i) => i !== url) }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/projects" : `/api/admin/projects/${initial?.slug}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = "Save failed";
        try { const b = await res.json(); msg = (b as { error?: string }).error ?? msg; } catch { /* non-JSON error body */ }
        throw new Error(msg);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/projects/${initial?.slug}`, { method: "DELETE" });
    router.push("/admin/projects");
    router.refresh();
  }

  const t = data.translations[lang];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Shared fields */}
      <div className="rounded-sm border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">Shared fields</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (URL-safe, no spaces)">
            <input
              value={data.slug}
              onChange={(e) => setShared("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              disabled={!isNew}
              className="input"
              placeholder="my-project-name"
            />
          </Field>
          <Field label="Year">
            <input
              value={data.year}
              onChange={(e) => setShared("year", e.target.value)}
              className="input"
              placeholder="2024"
            />
          </Field>
        </div>

        {/* Project-specific font */}
        <div className="mt-4">
          <Field label="Projekt-Schriftart (überschreibt Website-Schriftart nur für dieses Projekt)">
            <div className="flex items-center gap-3">
              <select
                value={data.font ?? ""}
                onChange={(e) => setShared("font", e.target.value || undefined)}
                className="input flex-1"
              >
                {FONT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {data.font && (
                <button
                  type="button"
                  onClick={() => setShared("font", undefined)}
                  title="Schriftart entfernen"
                  className="shrink-0 text-xs text-red-400 hover:text-red-600"
                >
                  ✕ Entfernen
                </button>
              )}
            </div>
            {data.font && fontLoaded && (
              <p
                className="mt-2 rounded bg-stone-50 px-4 py-3 text-base text-graphite-900"
                style={{ fontFamily: `"${data.font}", serif` }}
              >
                Vorschau: The quick brown fox — 0123456789
              </p>
            )}
            {data.font && !fontLoaded && (
              <p className="mt-1 text-xs text-stone-400">Schriftart wird geladen…</p>
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Categories">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                    data.categories.includes(c.id)
                      ? "border-graphite-900 bg-graphite-900 text-white"
                      : "border-stone-300 text-stone-600 hover:border-graphite-900"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cover image">
            <div className="flex items-center gap-3">
              <input
                value={data.image}
                onChange={(e) => setShared("image", e.target.value)}
                className="input flex-1"
                placeholder="/images/grey-arch/portfolio/..."
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary shrink-0"
              >
                Upload
              </button>
            </div>
            {data.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.image} alt="" className="mt-2 h-24 w-full rounded-sm object-cover" />
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Gallery images">
            <div className="flex flex-wrap gap-2">
              {data.galleryImages.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-20 w-20 rounded-sm object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-20 items-center justify-center rounded-sm border-2 border-dashed border-stone-300 text-2xl text-stone-400 hover:border-graphite-900 hover:text-graphite-900"
              >
                +
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Translated fields */}
      <div className="rounded-sm border border-stone-200 bg-white">
        <div className="flex border-b border-stone-200">
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
            {TEXT_FIELDS.map(({ key, label, multiline }) => (
              <Field key={key} label={label}>
                {multiline ? (
                  <textarea
                    value={t[key] as string}
                    onChange={(e) => setTranslation(key, e.target.value)}
                    rows={3}
                    className="input resize-y"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  />
                ) : (
                  <input
                    value={t[key] as string}
                    onChange={(e) => setTranslation(key, e.target.value)}
                    className="input"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  />
                )}
              </Field>
            ))}

            <Field label="Services provided (one per line)">
              <textarea
                value={t.servicesProvided.join("\n")}
                onChange={(e) => setServices(e.target.value)}
                rows={3}
                className="input resize-y"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-stone-200 pt-4">
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete project"}
          </button>
        )}
        <div className={`flex gap-3 ${isNew ? "ml-auto" : ""}`}>
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary"
          >
            {saving ? "Saving…" : "Save project"}
          </button>
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
