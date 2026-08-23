"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { JobRecord, AdminLocale } from "@/lib/data-manager";
import RichTextEditor from "../_components/RichTextEditor";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

const empty = (): JobRecord => ({
  id: "",
  slug: "",
  visible: true,
  translations: {
    en: { title: "", location: "", employmentType: "", intro: "", description: "" },
    de: { title: "", location: "", employmentType: "", intro: "", description: "" },
    ar: { title: "", location: "", employmentType: "", intro: "", description: "" },
  },
});

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<JobRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [lang, setLang] = useState<AdminLocale>("en");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d as JobRecord[]))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(empty());
    setIsNew(true);
    setLang("en");
    setError("");
  }

  function openEdit(j: JobRecord) {
    setEditing(JSON.parse(JSON.stringify(j)) as JobRecord);
    setIsNew(false);
    setLang("en");
    setError("");
  }

  function setSlug(value: string) {
    setEditing((e) => e && { ...e, slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") });
  }

  function setVisible(value: boolean) {
    setEditing((e) => e && { ...e, visible: value });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/grey-arch/jobs");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      setEditing((prev) => prev && { ...prev, image: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  function setTransField(field: "title" | "location" | "employmentType" | "intro" | "description", value: string) {
    setEditing((e) =>
      e && {
        ...e,
        translations: {
          ...e.translations,
          [lang]: { ...e.translations[lang], [field]: value },
        },
      }
    );
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.translations.en.title.trim()) {
      setError("Slug and an English title are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/jobs" : `/api/admin/jobs/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setJobs((prev) =>
        isNew ? [...prev, saved as JobRecord] : prev.map((j) => (j.id === saved.id ? (saved as JobRecord) : j))
      );
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this job posting?")) return;
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (editing?.id === id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Jobs</h1>
          <p className="mt-1 text-sm text-stone-500">{jobs.length} postings</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add job</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
        {/* List */}
        <div className="rounded-sm border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">No job postings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Visible</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                    <td className="px-4 py-3 text-graphite-900">{j.translations.en.title || "(untitled)"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{j.slug}</td>
                    <td className="px-4 py-3 text-stone-500">{j.visible ? "Yes" : "Hidden"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(j)} className="text-xs font-medium text-graphite-900 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(j.id)} className="text-xs text-red-500 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Editor */}
        {editing && (
          <div className="rounded-sm border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-graphite-900">
              {isNew ? "New job posting" : "Edit job posting"}
            </h2>

            {error && <div className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

            <div className="mb-4 space-y-3">
              <div>
                <label className="label">Slug (URL-safe, no spaces)</label>
                <input
                  value={editing.slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!isNew}
                  className="input"
                  placeholder="structural-engineer"
                />
              </div>
              <div>
                <label className="label">Cover image</label>
                <div className="flex items-center gap-3">
                  {editing.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editing.image} alt="" className="h-16 w-24 rounded-sm border border-stone-200 object-cover" />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-sm border-2 border-dashed border-stone-300 text-xs text-stone-400">
                      No image
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-secondary text-xs"
                    >
                      {uploading ? "Uploading…" : editing.image ? "Change image" : "Upload image"}
                    </button>
                    {editing.image && (
                      <button
                        type="button"
                        onClick={() => setEditing((prev) => prev && { ...prev, image: undefined })}
                        className="text-left text-xs text-red-500 hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={editing.visible} onChange={(e) => setVisible(e.target.checked)} />
                Visible on the public careers page
              </label>
            </div>

            <div className="mb-3 flex border-b border-stone-200">
              {LOCALES.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLang(l.key)}
                  className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
                    lang === l.key
                      ? "-mb-px border-graphite-900 text-graphite-900"
                      : "border-transparent text-stone-500 hover:text-graphite-900"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input
                  value={editing.translations[lang].title}
                  onChange={(e) => setTransField("title", e.target.value)}
                  className="input"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Location</label>
                  <input
                    value={editing.translations[lang].location}
                    onChange={(e) => setTransField("location", e.target.value)}
                    className="input"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <label className="label">Employment type</label>
                  <input
                    value={editing.translations[lang].employmentType}
                    onChange={(e) => setTransField("employmentType", e.target.value)}
                    className="input"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    placeholder="Full-time"
                  />
                </div>
              </div>
              <div>
                <label className="label">Short teaser (shown on the jobs grid card)</label>
                <textarea
                  value={editing.translations[lang].intro}
                  onChange={(e) => setTransField("intro", e.target.value)}
                  rows={2}
                  className="input resize-y"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="label">Full description</label>
                <div className="rounded-sm border border-line-300 p-3">
                  <RichTextEditor
                    value={editing.translations[lang].description}
                    onChange={(html) => setTransField("description", html)}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    variant="page"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
