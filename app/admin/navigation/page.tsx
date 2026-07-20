"use client";

import { useState, useEffect } from "react";
import { useAdminLang, type AdminLang } from "../_components/AdminLangContext";
import { getAdminT } from "../_components/adminI18n";
import type { NavItem, NavigationData, NavLabels } from "@/lib/data-manager";

const LANG_META: { key: AdminLang; label: string; dir: "ltr" | "rtl" }[] = [
  { key: "de", label: "DE — Deutsch", dir: "ltr" },
  { key: "en", label: "EN — English", dir: "ltr" },
  { key: "ar", label: "AR — عربي",    dir: "rtl" },
];

function emptyLabels(fallback = ""): NavLabels {
  return { en: fallback, de: fallback, ar: fallback };
}

export default function NavigationPage() {
  const { lang: adminLang } = useAdminLang();
  const T   = getAdminT(adminLang);
  const P   = T.nav_page;
  const dir = adminLang === "ar" ? "rtl" : "ltr";

  const [data, setData]           = useState<NavigationData>({ items: [] });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabels, setEditLabels] = useState<NavLabels>(emptyLabels());
  const [editHref, setEditHref]   = useState("");
  const [newLabels, setNewLabels] = useState<NavLabels>(emptyLabels());
  const [newHref, setNewHref]     = useState("");

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => r.json())
      .then((d) => { setData(d as NavigationData); setLoading(false); });
  }, []);

  async function save(updated: NavigationData) {
    setSaving(true);
    await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setData(updated);
    setSaving(false);
  }

  function startEdit(item: NavItem) {
    setEditingId(item.id);
    setEditLabels({ ...item.labels });
    setEditHref(item.href);
  }

  function cancelEdit() { setEditingId(null); }

  function saveEdit(id: string) {
    const href = editHref.trim();
    if (!editLabels.en.trim() || !href) return;
    const path = href.startsWith("/") ? href : `/${href}`;
    save({ items: data.items.map((item) => item.id === id ? { ...item, labels: editLabels, href: path } : item) });
    setEditingId(null);
  }

  function toggleVisibility(id: string) {
    save({ items: data.items.map((item) => item.id === id ? { ...item, visible: !item.visible } : item) });
  }

  function deleteItem(id: string) {
    if (!confirm(P.confirmDelete)) return;
    save({ items: data.items.filter((item) => item.id !== id) });
  }

  function addItem() {
    const label = newLabels[adminLang].trim() || newLabels.en.trim();
    const href  = newHref.trim();
    if (!label || !href) return;
    const id   = (newLabels.en || label).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const path = href.startsWith("/") ? href : `/${href}`;
    save({ items: [...data.items, { id, href: path, labels: { ...newLabels }, visible: true, custom: true }] });
    setNewLabels(emptyLabels());
    setNewHref("");
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 border-b border-stone-200 pb-6 dark:border-line-200">
        <h1 className="text-2xl font-semibold text-graphite-900">{P.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{P.desc}</p>
      </div>

      {/* Items list */}
      <div className="mb-8 space-y-2">
        {data.items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="rounded-sm border border-graphite-900 bg-white px-5 py-4 dark:bg-paper-200">
              <p className="mb-3 text-xs font-medium text-stone-500">{P.editSection}</p>

              <div className="mb-3 grid gap-3 sm:grid-cols-3">
                {LANG_META.map((l) => (
                  <div key={l.key}>
                    <label className="mb-1 block text-xs text-stone-400">{l.label}</label>
                    <input
                      value={editLabels[l.key]}
                      onChange={(e) => setEditLabels((prev) => ({ ...prev, [l.key]: e.target.value }))}
                      dir={l.dir}
                      className="input"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs text-stone-400">{P.pathLabel}</label>
                <input
                  value={editHref}
                  onChange={(e) => setEditHref(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") cancelEdit(); }}
                  dir="ltr"
                  className="input sm:max-w-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(item.id)}
                  disabled={!editLabels.en.trim() || !editHref.trim() || saving}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  {saving ? P.saving : P.save}
                </button>
                <button
                  onClick={cancelEdit}
                  className="btn-secondary text-xs px-4 py-1.5"
                >
                  {P.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-sm border border-stone-200 bg-white px-5 py-4 dark:border-line-200 dark:bg-paper-200"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleVisibility(item.id)}
                  disabled={saving}
                  title={item.visible ? P.hide : P.show}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                    item.visible ? "bg-graphite-900" : "bg-stone-300 dark:bg-stone-500"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      item.visible ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <div>
                  <p className={`text-sm font-medium ${item.visible ? "text-graphite-900" : "text-stone-400 dark:text-stone-500"}`}>
                    {item.labels[adminLang] || item.labels.en}
                  </p>
                  <p className="text-xs text-stone-400" dir="ltr">{item.href}</p>
                </div>

                {!item.visible && (
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-400 dark:bg-paper-300 dark:text-stone-500">{P.hidden}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(item)} className="text-xs text-graphite-900 hover:underline">
                  {P.edit}
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-xs text-red-400 hover:text-red-600 hover:underline dark:text-red-400">
                  {P.delete}
                </button>
              </div>
            </div>
          )
        )}

        {data.items.length === 0 && (
          <p className="text-sm text-stone-400">{P.empty}</p>
        )}
      </div>

      {/* Add new item */}
      <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">{P.addTitle}</h2>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {LANG_META.map((l) => (
            <div key={l.key}>
              <label className="mb-1 block text-xs text-stone-500">{l.label}</label>
              <input
                value={newLabels[l.key]}
                onChange={(e) => setNewLabels((prev) => ({ ...prev, [l.key]: e.target.value }))}
                dir={l.dir}
                placeholder={l.key === "en" ? P.labelRequired : P.translation}
                className="input"
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-stone-500">{P.pathLabel}</label>
          <input
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
            placeholder="/gallery"
            onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
            dir="ltr"
            className="input sm:max-w-xs"
          />
        </div>

        <button
          onClick={addItem}
          disabled={!newLabels.en.trim() || !newHref.trim() || saving}
          className="btn-primary"
        >
          {saving ? P.saving : P.add}
        </button>
      </div>
    </div>
  );
}
