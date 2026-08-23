"use client";

import { useEffect, useState } from "react";
import type { ServicesData } from "@/lib/data-manager";
import PageEditorForm, { type EditablePageData } from "../_components/PageEditorForm";

const EMPTY: ServicesData = {
  translations: {
    en: { title: "", intro: "", body: "" },
    de: { title: "", intro: "", body: "" },
    ar: { title: "", intro: "", body: "" },
  },
};

function toEditable(data: ServicesData): EditablePageData {
  return { coverImage: data.heroImage, layout: data.layout, translations: data.translations };
}

function fromEditable(data: EditablePageData): ServicesData {
  return { heroImage: data.coverImage, layout: data.layout, translations: data.translations };
}

export default function ServicesAdminPage() {
  const [data, setData] = useState<ServicesData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { setData(d as ServicesData); setLoading(false); });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Leistungen</h1>
          <p className="mt-1 text-sm text-stone-500">Edit the Services page content for all languages.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <PageEditorForm
        data={toEditable(data)}
        onChange={(next) => setData(fromEditable(next))}
        coverImageFolder="images/grey-arch/services"
        bodyImageFolder="images/grey-arch/services-body"
        coverImageLabel="Hero image"
      />

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
