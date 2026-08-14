"use client";

import { useState, useEffect } from "react";
import type { ServicesData, ServicesTranslation, ServiceGroupData, ServiceItemData, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

const EMPTY_SERVICE: ServiceItemData = {
  id: "",
  title: "",
  description: "",
  includes: "",
  deliverables: [],
  suitableFor: "",
};

export default function ServicesAdminPage() {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<AdminLocale>("en");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { setData(d as ServicesData); setLoading(false); });
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const t: ServicesTranslation | null = data?.translations[lang] ?? null;

  function setTopLevel(field: "title" | "intro", value: string) {
    if (!data) return;
    setData({
      ...data,
      translations: {
        ...data.translations,
        [lang]: { ...data.translations[lang], [field]: value },
      },
    });
  }

  function setGroup(groupIndex: number, field: keyof Omit<ServiceGroupData, "services">, value: string) {
    if (!data || !t) return;
    const groups = [...t.groups];
    groups[groupIndex] = { ...groups[groupIndex], [field]: value };
    setData({
      ...data,
      translations: {
        ...data.translations,
        [lang]: { ...t, groups },
      },
    });
  }

  function setService(groupIndex: number, serviceIndex: number, field: keyof ServiceItemData, value: string | string[]) {
    if (!data || !t) return;
    const groups = [...t.groups];
    const services = [...groups[groupIndex].services];
    services[serviceIndex] = { ...services[serviceIndex], [field]: value };
    groups[groupIndex] = { ...groups[groupIndex], services };
    setData({
      ...data,
      translations: {
        ...data.translations,
        [lang]: { ...t, groups },
      },
    });
  }

  function setDeliverables(groupIndex: number, serviceIndex: number, value: string) {
    const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
    setService(groupIndex, serviceIndex, "deliverables", arr);
  }

  async function handleSave() {
    if (!data) return;
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

  if (loading || !data || !t) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Services</h1>
          <p className="mt-1 text-sm text-stone-500">Edit service groups and individual services for all languages.</p>
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

      {/* Page intro */}
      <div className="mb-6 rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">Page Header</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label">Page Title</label>
            <input value={t.title} onChange={(e) => setTopLevel("title", e.target.value)} className="input" dir={dir} />
          </div>
          <div>
            <label className="label">Page Intro</label>
            <textarea value={t.intro} onChange={(e) => setTopLevel("intro", e.target.value)} rows={3} className="input resize-y" dir={dir} />
          </div>
        </div>
      </div>

      {/* Service groups */}
      <div className="space-y-4">
        {t.groups.map((group, gi) => (
          <div key={group.id} className="rounded-sm border border-stone-200 bg-white dark:border-line-200 dark:bg-paper-200">
            {/* Group header */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div>
                <span className="text-sm font-semibold text-graphite-900">{group.title || group.id}</span>
                <span className="ml-3 text-xs text-stone-400">{group.services.length} services</span>
              </div>
              <span className="text-stone-400">{expandedGroup === group.id ? "▲" : "▼"}</span>
            </button>

            {expandedGroup === group.id && (
              <div className="border-t border-stone-100 p-5 dark:border-line-300">
                <div className="mb-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="label">Group Title</label>
                    <input value={group.title} onChange={(e) => setGroup(gi, "title", e.target.value)} className="input" dir={dir} />
                  </div>
                  <div>
                    <label className="label">Group Intro</label>
                    <textarea value={group.intro} onChange={(e) => setGroup(gi, "intro", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                  </div>
                </div>

                {/* Services in this group */}
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">Services</h3>
                <div className="space-y-3">
                  {group.services.map((svc, si) => {
                    const svcKey = `${group.id}-${si}`;
                    return (
                      <div key={svc.id} className="rounded-sm border border-stone-100 dark:border-line-300">
                        <button
                          onClick={() => setExpandedService(expandedService === svcKey ? null : svcKey)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-sm text-graphite-900">{svc.title || svc.id}</span>
                          <span className="text-xs text-stone-400">{expandedService === svcKey ? "▲" : "▼"}</span>
                        </button>

                        {expandedService === svcKey && (
                          <div className="border-t border-stone-50 p-4 dark:border-line-300 space-y-3">
                            <div>
                              <label className="label">Title</label>
                              <input value={svc.title} onChange={(e) => setService(gi, si, "title", e.target.value)} className="input" dir={dir} />
                            </div>
                            <div>
                              <label className="label">Description</label>
                              <textarea value={svc.description} onChange={(e) => setService(gi, si, "description", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                            </div>
                            <div>
                              <label className="label">Includes (optional)</label>
                              <input value={svc.includes ?? ""} onChange={(e) => setService(gi, si, "includes", e.target.value)} className="input" dir={dir} />
                            </div>
                            <div>
                              <label className="label">Deliverables (one per line)</label>
                              <textarea
                                value={svc.deliverables.join("\n")}
                                onChange={(e) => setDeliverables(gi, si, e.target.value)}
                                rows={4}
                                className="input resize-y font-mono text-xs"
                                dir={dir}
                              />
                            </div>
                            <div>
                              <label className="label">Suitable For</label>
                              <textarea value={svc.suitableFor} onChange={(e) => setService(gi, si, "suitableFor", e.target.value)} rows={2} className="input resize-y" dir={dir} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
