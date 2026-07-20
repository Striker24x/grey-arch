"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CategoriesData, CategoryGroup, CategoryItem, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string; dir: "ltr" | "rtl" }[] = [
  { key: "en", label: "EN — English", dir: "ltr" },
  { key: "de", label: "DE — Deutsch", dir: "ltr" },
  { key: "ar", label: "AR — عربي",    dir: "rtl" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [data, setData]           = useState<CategoriesData>({ groups: [] });
  const [loading, setLoading]     = useState(true);
  const [activeGroup, setActiveGroup] = useState(0);
  const [saving, setSaving]       = useState(false);

  // category edit state
  const [editingCatId, setEditingCatId]   = useState<string | null>(null);
  const [editCatTrans, setEditCatTrans]   = useState<Record<AdminLocale, string>>({ en: "", de: "", ar: "" });

  // new category state
  const [newCatTrans, setNewCatTrans]     = useState<Record<AdminLocale, string>>({ en: "", de: "", ar: "" });

  // group edit state
  const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
  const [editGroupTrans, setEditGroupTrans]   = useState<Record<AdminLocale, string>>({ en: "", de: "", ar: "" });

  // new group modal
  const [showNewGroup, setShowNewGroup]   = useState(false);
  const [newGroupTrans, setNewGroupTrans] = useState<Record<AdminLocale, string>>({ en: "", de: "", ar: "" });

  // feedback
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setData(d as CategoriesData); setLoading(false); });
  }, []);

  async function save(updated: CategoriesData) {
    setSaving(true);
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setData(updated);
    setSaving(false);
    router.refresh();
    setSavedMsg("Gespeichert ✓");
    setTimeout(() => setSavedMsg(""), 2000);
  }

  // ── Category CRUD ──────────────────────────────────────────

  function startEditCat(cat: CategoryItem) {
    setEditingCatId(cat.id);
    setEditCatTrans({ ...cat.translations });
  }

  function cancelEditCat() { setEditingCatId(null); }

  function saveEditCat(groupIdx: number, catId: string) {
    if (!editCatTrans.en.trim()) return;
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === groupIdx
          ? { ...g, categories: g.categories.map((c) => c.id === catId ? { ...c, translations: { ...editCatTrans } } : c) }
          : g
      ),
    };
    save(updated);
    setEditingCatId(null);
  }

  function addCategory() {
    if (!newCatTrans.en.trim()) return;
    const id = newCatTrans.en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === activeGroup
          ? { ...g, categories: [...g.categories, { id, translations: { ...newCatTrans } }] }
          : g
      ),
    };
    setNewCatTrans({ en: "", de: "", ar: "" });
    save(updated);
  }

  function deleteCategory(groupIdx: number, catId: string) {
    if (!confirm("Diese Kategorie löschen?")) return;
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === groupIdx ? { ...g, categories: g.categories.filter((c) => c.id !== catId) } : g
      ),
    };
    save(updated);
  }

  // ── Group CRUD ─────────────────────────────────────────────

  function startEditGroup(idx: number, g: CategoryGroup) {
    setEditingGroupIdx(idx);
    setEditGroupTrans({ ...g.translations });
  }

  function cancelEditGroup() { setEditingGroupIdx(null); }

  function saveEditGroup(idx: number) {
    if (!editGroupTrans.en.trim()) return;
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) => i === idx ? { ...g, translations: { ...editGroupTrans } } : g),
    };
    save(updated);
    setEditingGroupIdx(null);
  }

  function addGroup() {
    if (!newGroupTrans.en.trim()) return;
    const id = newGroupTrans.en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const updated: CategoriesData = {
      groups: [...data.groups, { id, translations: { ...newGroupTrans }, categories: [] }],
    };
    setNewGroupTrans({ en: "", de: "", ar: "" });
    setShowNewGroup(false);
    save(updated);
  }

  function deleteGroup(idx: number) {
    if (!confirm("Diese gesamte Gruppe und alle Kategorien löschen?")) return;
    const updated: CategoriesData = { groups: data.groups.filter((_, i) => i !== idx) };
    setActiveGroup(Math.min(activeGroup, updated.groups.length - 1));
    save(updated);
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  const group = data.groups[activeGroup];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Kategorien</h1>
          <p className="mt-1 text-sm text-stone-500">
            Mehrsprachig · wird als Portfolio-Filter verwendet
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-medium text-green-600">{savedMsg}</span>
          )}
          <button onClick={() => setShowNewGroup(true)} className="btn-secondary">
            + Neue Gruppe
          </button>
        </div>
      </div>

      {/* Group tabs */}
      <div className="mb-6 flex items-end gap-0 border-b border-stone-200">
        {data.groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => { setActiveGroup(i); setEditingCatId(null); }}
            className={`relative border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              i === activeGroup
                ? "-mb-px border-graphite-900 text-graphite-900"
                : "border-transparent text-stone-500 hover:text-graphite-900"
            }`}
          >
            {g.translations.en}
            <span className="ml-1.5 text-xs text-stone-400">({g.categories.length})</span>
          </button>
        ))}
      </div>

      {group && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* ── Category list ───────────────────────────────── */}
          <div className="space-y-2">
            {/* Group name edit */}
            {editingGroupIdx === activeGroup ? (
              <div className="mb-4 rounded-sm border border-graphite-900 bg-white p-4">
                <p className="mb-3 text-xs font-medium text-stone-500">Gruppenname bearbeiten</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LOCALES.map((l) => (
                    <div key={l.key}>
                      <label className="label">{l.label}</label>
                      <input
                        value={editGroupTrans[l.key]}
                        onChange={(e) => setEditGroupTrans((prev) => ({ ...prev, [l.key]: e.target.value }))}
                        dir={l.dir}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => saveEditGroup(activeGroup)} disabled={!editGroupTrans.en.trim() || saving} className="btn-primary text-xs px-4 py-1.5">
                    {saving ? "Speichern…" : "Speichern"}
                  </button>
                  <button onClick={cancelEditGroup} className="btn-secondary text-xs px-4 py-1.5">Abbrechen</button>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-graphite-900">{group.translations.en}</h2>
                  {group.translations.de && group.translations.de !== group.translations.en && (
                    <p className="text-xs text-stone-400">DE: {group.translations.de} · AR: {group.translations.ar}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => startEditGroup(activeGroup, group)} className="text-xs text-graphite-900 hover:underline">
                    Gruppe umbenennen
                  </button>
                  <button onClick={() => deleteGroup(activeGroup)} className="text-xs text-red-500 hover:underline">
                    Gruppe löschen
                  </button>
                </div>
              </div>
            )}

            {group.categories.length === 0 && (
              <p className="text-sm text-stone-400">Keine Kategorien in dieser Gruppe.</p>
            )}

            {/* Category rows */}
            {group.categories.map((cat) =>
              editingCatId === cat.id ? (
                /* ── Edit mode ── */
                <div key={cat.id} className="rounded-sm border border-graphite-900 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <code className="text-xs text-stone-400">id: {cat.id}</code>
                  </div>
                  <div className="mb-3 grid gap-2 sm:grid-cols-3">
                    {LOCALES.map((l) => (
                      <div key={l.key}>
                        <label className="label">{l.label}</label>
                        <input
                          value={editCatTrans[l.key]}
                          onChange={(e) => setEditCatTrans((prev) => ({ ...prev, [l.key]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditCat(activeGroup, cat.id);
                            if (e.key === "Escape") cancelEditCat();
                          }}
                          dir={l.dir}
                          className="input"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEditCat(activeGroup, cat.id)}
                      disabled={!editCatTrans.en.trim() || saving}
                      className="btn-primary text-xs px-4 py-1.5"
                    >
                      {saving ? "Speichern…" : "Speichern"}
                    </button>
                    <button onClick={cancelEditCat} className="btn-secondary text-xs px-4 py-1.5">
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Read mode ── */
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-sm border border-stone-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-graphite-900">{cat.translations.en}</p>
                    <p className="text-xs text-stone-400">
                      <span className="font-mono">id: {cat.id}</span>
                      {cat.translations.de && (
                        <span className="ml-2">· DE: {cat.translations.de} · AR: {cat.translations.ar}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEditCat(cat)}
                      className="text-xs text-graphite-900 hover:underline"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => deleteCategory(activeGroup, cat.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ── Add new category ────────────────────────────── */}
          <div className="self-start rounded-sm border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-graphite-900">
              Neue Kategorie → {group.translations.en}
            </h2>
            <div className="space-y-3">
              {LOCALES.map((l) => (
                <div key={l.key}>
                  <label className="label">{l.label}</label>
                  <input
                    value={newCatTrans[l.key]}
                    onChange={(e) => setNewCatTrans((prev) => ({ ...prev, [l.key]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                    className="input"
                    placeholder={l.key === "en" ? "Name (wird zur ID)" : "Übersetzung"}
                    dir={l.dir}
                  />
                </div>
              ))}
              <button
                onClick={addCategory}
                disabled={!newCatTrans.en.trim() || saving}
                className="btn-primary w-full mt-2"
              >
                {saving ? "Speichern…" : "+ Kategorie hinzufügen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New group modal */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-sm font-semibold text-graphite-900">Neue Gruppe erstellen</h2>
            <div className="space-y-3">
              {LOCALES.map((l) => (
                <div key={l.key}>
                  <label className="label">{l.label}</label>
                  <input
                    value={newGroupTrans[l.key]}
                    onChange={(e) => setNewGroupTrans((prev) => ({ ...prev, [l.key]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") setShowNewGroup(false); }}
                    className="input"
                    placeholder={l.key === "en" ? "Group name" : "Übersetzung"}
                    dir={l.dir}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowNewGroup(false)} className="btn-secondary flex-1">Abbrechen</button>
              <button
                onClick={addGroup}
                disabled={!newGroupTrans.en.trim()}
                className="btn-primary flex-1"
              >
                Gruppe erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
