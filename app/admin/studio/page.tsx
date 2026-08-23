"use client";

import { useEffect, useState } from "react";
import type { StudioData } from "@/lib/data-manager";
import PageEditorForm, { type EditablePageData } from "../_components/PageEditorForm";

const EMPTY: StudioData = {
  translations: {
    en: { title: "", intro: "", body: "" },
    de: { title: "", intro: "", body: "" },
    ar: { title: "", intro: "", body: "" },
  },
};

function toEditable(data: StudioData): EditablePageData {
  return { coverImage: data.workspaceImage, layout: data.layout, translations: data.translations };
}

function fromEditable(data: EditablePageData): StudioData {
  return { workspaceImage: data.coverImage, layout: data.layout, translations: data.translations };
}

export default function StudioAdminPage() {
  const [data, setData] = useState<StudioData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/studio")
      .then((r) => r.json())
      .then((d) => { setData(d as StudioData); setLoading(false); });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/studio", {
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
          <h1 className="text-2xl font-semibold text-graphite-900">Studio</h1>
          <p className="mt-1 text-sm text-stone-500">Edit the Studio page content for all languages.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <PageEditorForm
        data={toEditable(data)}
        onChange={(next) => setData(fromEditable(next))}
        coverImageFolder="images/grey-arch/studio"
        bodyImageFolder="images/grey-arch/studio-body"
        coverImageLabel="Workspace image"
      />

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
