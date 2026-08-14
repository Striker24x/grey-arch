"use client";

import { useState, useEffect } from "react";
import type { ConnectData, ConnectTranslation, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

export default function ConnectAdminPage() {
  const [data, setData] = useState<ConnectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<AdminLocale>("en");

  useEffect(() => {
    fetch("/api/admin/connect")
      .then((r) => r.json())
      .then((d) => { setData(d as ConnectData); setLoading(false); });
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const t: ConnectTranslation | null = data?.translations[lang] ?? null;

  function setField<K extends keyof ConnectTranslation>(field: K, value: ConnectTranslation[K]) {
    if (!data) return;
    setData({
      ...data,
      translations: {
        ...data.translations,
        [lang]: { ...data.translations[lang], [field]: value },
      },
    });
  }

  function setOptions(field: "formProjectTypeOptions" | "formBuildingStatusOptions", value: string) {
    const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
    setField(field, arr);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/connect", {
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

  if (loading || !data || !t) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Connect / Contact</h1>
          <p className="mt-1 text-sm text-stone-500">Edit contact page texts and form labels for all languages.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

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
        {/* Page intro */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Page Header</h2>
          <div className="grid gap-4 lg:grid-cols-2">
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

        {/* CTAs */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Call-to-Action Labels</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Start Project</label>
              <input value={t.ctaStartProject} onChange={(e) => setField("ctaStartProject", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Request Consultation</label>
              <input value={t.ctaRequestConsultation} onChange={(e) => setField("ctaRequestConsultation", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Send Plans</label>
              <input value={t.ctaSendPlans} onChange={(e) => setField("ctaSendPlans", e.target.value)} className="input" dir={dir} />
            </div>
          </div>
        </div>

        {/* Form field labels */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Form Field Labels</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["formName", "Name"],
                ["formEmail", "Email"],
                ["formPhone", "Phone"],
                ["formPreferredLanguage", "Preferred Language"],
                ["formProjectType", "Project Type"],
                ["formProjectLocation", "Project Location"],
                ["formBuildingStatus", "Building Status"],
                ["formRequiredService", "Required Service"],
                ["formProjectSize", "Project Size"],
                ["formBudgetRange", "Budget Range"],
                ["formMessage", "Message"],
                ["formSubmit", "Submit Button"],
              ] as [keyof ConnectTranslation, string][]
            ).map(([field, label]) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  value={t[field] as string}
                  onChange={(e) => setField(field, e.target.value)}
                  className="input"
                  dir={dir}
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="label">Consent text</label>
            <textarea value={t.formConsent} onChange={(e) => setField("formConsent", e.target.value)} rows={2} className="input resize-y" dir={dir} />
          </div>
        </div>

        {/* Dropdown options */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Dropdown Options</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="label">Project Type options (one per line)</label>
              <textarea
                value={t.formProjectTypeOptions.join("\n")}
                onChange={(e) => setOptions("formProjectTypeOptions", e.target.value)}
                rows={10}
                className="input resize-y font-mono text-xs"
                dir={dir}
              />
            </div>
            <div>
              <label className="label">Building Status options (one per line)</label>
              <textarea
                value={t.formBuildingStatusOptions.join("\n")}
                onChange={(e) => setOptions("formBuildingStatusOptions", e.target.value)}
                rows={4}
                className="input resize-y font-mono text-xs"
                dir={dir}
              />
            </div>
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
