"use client";

import { useState, useEffect } from "react";
import type { OverviewData, OverviewTranslation, OverviewPoint, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

export default function OverviewAdminPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<AdminLocale>("en");

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => { setData(d as OverviewData); setLoading(false); });
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const t: OverviewTranslation | null = data?.translations[lang] ?? null;

  function setField<K extends keyof OverviewTranslation>(field: K, value: OverviewTranslation[K]) {
    if (!data) return;
    setData({
      ...data,
      translations: {
        ...data.translations,
        [lang]: { ...data.translations[lang], [field]: value },
      },
    });
  }

  function setPoint(field: "philosophyPoints" | "processSteps", index: number, key: "title" | "description", value: string) {
    if (!t) return;
    const arr = [...t[field]] as OverviewPoint[];
    arr[index] = { ...arr[index], [key]: value };
    setField(field, arr);
  }

  function setListField(field: "heritagePoints" | "digitalArchPoints", value: string) {
    const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
    setField(field, arr);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/overview", {
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
          <h1 className="text-2xl font-semibold text-graphite-900">Overview / Homepage</h1>
          <p className="mt-1 text-sm text-stone-500">Edit the homepage sections for all languages.</p>
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
        {/* Hero */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Hero Section</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Eyebrow</label>
              <input value={t.heroEyebrow} onChange={(e) => setField("heroEyebrow", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Headline</label>
              <input value={t.heroHeadline} onChange={(e) => setField("heroHeadline", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Subheadline</label>
              <textarea value={t.heroSubheadline} onChange={(e) => setField("heroSubheadline", e.target.value)} rows={3} className="input resize-y" dir={dir} />
            </div>
            <div>
              <label className="label">CTA: Explore Services</label>
              <input value={t.heroCtaExplore} onChange={(e) => setField("heroCtaExplore", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">CTA: View Portfolio</label>
              <input value={t.heroCtaPortfolio} onChange={(e) => setField("heroCtaPortfolio", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">CTA: Start Project</label>
              <input value={t.heroCtaStart} onChange={(e) => setField("heroCtaStart", e.target.value)} className="input" dir={dir} />
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Philosophy Section</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Eyebrow</label>
              <input value={t.philosophyEyebrow} onChange={(e) => setField("philosophyEyebrow", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Title</label>
              <input value={t.philosophyTitle} onChange={(e) => setField("philosophyTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Body</label>
              <textarea value={t.philosophyBody} onChange={(e) => setField("philosophyBody", e.target.value)} rows={3} className="input resize-y" dir={dir} />
            </div>
          </div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">Points</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.philosophyPoints.map((pt, i) => (
              <div key={i} className="rounded-sm border border-stone-100 p-3 dark:border-line-300 space-y-2">
                <div>
                  <label className="label">Point {i + 1} — Title</label>
                  <input value={pt.title} onChange={(e) => setPoint("philosophyPoints", i, "title", e.target.value)} className="input" dir={dir} />
                </div>
                <div>
                  <label className="label">Point {i + 1} — Description</label>
                  <textarea value={pt.description} onChange={(e) => setPoint("philosophyPoints", i, "description", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Process Section</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Eyebrow</label>
              <input value={t.processEyebrow} onChange={(e) => setField("processEyebrow", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Title</label>
              <input value={t.processTitle} onChange={(e) => setField("processTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Intro</label>
              <textarea value={t.processIntro} onChange={(e) => setField("processIntro", e.target.value)} rows={2} className="input resize-y" dir={dir} />
            </div>
          </div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">Steps</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.processSteps.map((step, i) => (
              <div key={i} className="rounded-sm border border-stone-100 p-3 dark:border-line-300 space-y-2">
                <div>
                  <label className="label">Step {i + 1} — Title</label>
                  <input value={step.title} onChange={(e) => setPoint("processSteps", i, "title", e.target.value)} className="input" dir={dir} />
                </div>
                <div>
                  <label className="label">Step {i + 1} — Description</label>
                  <textarea value={step.description} onChange={(e) => setPoint("processSteps", i, "description", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heritage */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Heritage Section</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Eyebrow</label>
              <input value={t.heritageEyebrow} onChange={(e) => setField("heritageEyebrow", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Title</label>
              <input value={t.heritageTitle} onChange={(e) => setField("heritageTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Body</label>
              <textarea value={t.heritageBody} onChange={(e) => setField("heritageBody", e.target.value)} rows={3} className="input resize-y" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Points (one per line)</label>
              <textarea
                value={t.heritagePoints.join("\n")}
                onChange={(e) => setListField("heritagePoints", e.target.value)}
                rows={5}
                className="input resize-y font-mono text-xs"
                dir={dir}
              />
            </div>
            <div>
              <label className="label">CTA Label</label>
              <input value={t.heritageCta} onChange={(e) => setField("heritageCta", e.target.value)} className="input" dir={dir} />
            </div>
          </div>
        </div>

        {/* Digital Arch */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Digital Arch Section</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Eyebrow</label>
              <input value={t.digitalArchEyebrow} onChange={(e) => setField("digitalArchEyebrow", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">Title</label>
              <input value={t.digitalArchTitle} onChange={(e) => setField("digitalArchTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Body</label>
              <textarea value={t.digitalArchBody} onChange={(e) => setField("digitalArchBody", e.target.value)} rows={3} className="input resize-y" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Points (one per line)</label>
              <textarea
                value={t.digitalArchPoints.join("\n")}
                onChange={(e) => setListField("digitalArchPoints", e.target.value)}
                rows={5}
                className="input resize-y font-mono text-xs"
                dir={dir}
              />
            </div>
            <div>
              <label className="label">CTA Label</label>
              <input value={t.digitalArchCta} onChange={(e) => setField("digitalArchCta", e.target.value)} className="input" dir={dir} />
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
          <h2 className="mb-4 text-sm font-semibold text-graphite-900">Contact CTA Section</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Title</label>
              <input value={t.contactCtaTitle} onChange={(e) => setField("contactCtaTitle", e.target.value)} className="input" dir={dir} />
            </div>
            <div>
              <label className="label">CTA Button Label</label>
              <input value={t.contactCtaCta} onChange={(e) => setField("contactCtaCta", e.target.value)} className="input" dir={dir} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Body</label>
              <textarea value={t.contactCtaBody} onChange={(e) => setField("contactCtaBody", e.target.value)} rows={3} className="input resize-y" dir={dir} />
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
