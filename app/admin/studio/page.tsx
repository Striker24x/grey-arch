"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { StudioData, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

const EMPTY: StudioData = {
  translations: {
    en: {
      title: "", intro: "",
      historyTitle: "", historyBody: "",
      missionTitle: "", missionBody: "",
      visionTitle: "", visionBody: "",
      approachTitle: "", approachBody: "",
      approachSteps: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
      valuesTitle: "",
      valuesItems: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
    de: {
      title: "", intro: "",
      historyTitle: "", historyBody: "",
      missionTitle: "", missionBody: "",
      visionTitle: "", visionBody: "",
      approachTitle: "", approachBody: "",
      approachSteps: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
      valuesTitle: "",
      valuesItems: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
    ar: {
      title: "", intro: "",
      historyTitle: "", historyBody: "",
      missionTitle: "", missionBody: "",
      visionTitle: "", visionBody: "",
      approachTitle: "", approachBody: "",
      approachSteps: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
      valuesTitle: "",
      valuesItems: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
  },
};

export default function StudioAdminPage() {
  const [data, setData] = useState<StudioData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<AdminLocale>("en");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/studio")
      .then((r) => r.json())
      .then((d) => { setData(d as StudioData); setLoading(false); });
  }, []);

  const t = data.translations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  function setField<K extends keyof typeof t>(field: K, value: typeof t[K]) {
    setData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], [field]: value },
      },
    }));
  }

  function setStep(index: number, key: "title" | "description", value: string) {
    const steps = [...t.approachSteps];
    steps[index] = { ...steps[index], [key]: value };
    setField("approachSteps", steps);
  }

  function setValueItem(index: number, key: "title" | "description", value: string) {
    const items = [...t.valuesItems];
    items[index] = { ...items[index], [key]: value };
    setField("valuesItems", items);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/studio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "grey-arch/studio");
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const json = await res.json() as { url?: string };
    if (json.url) {
      const updated = { ...data, workspaceImage: json.url };
      setData(updated);
      await fetch("/api/admin/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Studio</h1>
          <p className="mt-1 text-sm text-stone-500">Edit the Studio page content for all languages.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {/* Workspace image */}
      <div className="mb-6 rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">Workspace Image</h2>
        <div className="flex items-start gap-6">
          <div className="relative h-40 w-64 shrink-0 overflow-hidden rounded-sm border border-stone-200 bg-stone-100 dark:border-line-300 dark:bg-paper-300">
            {data.workspaceImage ? (
              <Image src={data.workspaceImage} alt="Studio workspace" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-stone-400">No image uploaded</div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-stone-500">Upload a new workspace photo. This replaces the default studio image on the Studio page.</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-sm border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-graphite-900 transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-line-300 dark:bg-paper-300 dark:hover:bg-paper-400"
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            {data.workspaceImage && (
              <button
                onClick={async () => {
                  const updated = { ...data, workspaceImage: undefined };
                  setData(updated);
                  await fetch("/api/admin/studio", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated),
                  });
                }}
                className="ml-2 text-sm text-stone-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Language tabs */}
      <div className="mb-6 flex border-b border-stone-200 dark:border-line-200">
        {LOCALES.map((l) => (
          <button
            key={l.key}
            onClick={() => setLang(l.key)}
            className={`border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              lang === l.key
                ? "-mb-px border-graphite-900 text-graphite-900"
                : "border-transparent text-stone-500 hover:text-graphite-900"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Intro */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Page Intro</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input value={t.title} onChange={(e) => setField("title", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Intro text</label>
              <textarea value={t.intro} onChange={(e) => setField("intro", e.target.value)} rows={3} className="input resize-y" dir={dir} />
            </div>
          </div>
        </div>

        {/* History / Mission / Vision */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">History / Mission / Vision</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              <div>
                <label className="label">History — Title</label>
                <input value={t.historyTitle} onChange={(e) => setField("historyTitle", e.target.value)} className="input" dir={dir} />
              </div>
              <div>
                <label className="label">History — Body</label>
                <textarea value={t.historyBody} onChange={(e) => setField("historyBody", e.target.value)} rows={4} className="input resize-y" dir={dir} />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Mission — Title</label>
                <input value={t.missionTitle} onChange={(e) => setField("missionTitle", e.target.value)} className="input" dir={dir} />
              </div>
              <div>
                <label className="label">Mission — Body</label>
                <textarea value={t.missionBody} onChange={(e) => setField("missionBody", e.target.value)} rows={4} className="input resize-y" dir={dir} />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Vision — Title</label>
                <input value={t.visionTitle} onChange={(e) => setField("visionTitle", e.target.value)} className="input" dir={dir} />
              </div>
              <div>
                <label className="label">Vision — Body</label>
                <textarea value={t.visionBody} onChange={(e) => setField("visionBody", e.target.value)} rows={4} className="input resize-y" dir={dir} />
              </div>
            </div>
          </div>
        </div>

        {/* Approach */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Approach</h2>
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label">Approach — Title</label>
              <input value={t.approachTitle} onChange={(e) => setField("approachTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Approach — Body</label>
              <textarea value={t.approachBody} onChange={(e) => setField("approachBody", e.target.value)} rows={2} className="input resize-y" dir={dir} />
            </div>
          </div>
          <h3 className="mb-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Steps</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.approachSteps.map((step, i) => (
              <div key={i} className="rounded-sm border border-stone-100 p-3 dark:border-line-300 space-y-2">
                <div>
                  <label className="label">Step {i + 1} — Title</label>
                  <input value={step.title} onChange={(e) => setStep(i, "title", e.target.value)} className="input" dir={dir} />
                </div>
                <div>
                  <label className="label">Step {i + 1} — Description</label>
                  <textarea value={step.description} onChange={(e) => setStep(i, "description", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-sm font-semibold text-graphite-900">Values</h2>
            <div className="flex-1">
              <label className="label">Values — Title</label>
              <input value={t.valuesTitle} onChange={(e) => setField("valuesTitle", e.target.value)} className="input" dir={dir} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.valuesItems.map((v, i) => (
              <div key={i} className="rounded-sm border border-stone-100 p-3 dark:border-line-300 space-y-2">
                <div>
                  <label className="label">Value {i + 1} — Title</label>
                  <input value={v.title} onChange={(e) => setValueItem(i, "title", e.target.value)} className="input" dir={dir} />
                </div>
                <div>
                  <label className="label">Value {i + 1} — Description</label>
                  <textarea value={v.description} onChange={(e) => setValueItem(i, "description", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
