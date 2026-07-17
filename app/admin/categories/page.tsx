"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CategoriesData, CategoryGroup, CategoryItem, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string; dir: "ltr" | "rtl" }[] = [
  { key: "en", label: "EN", dir: "ltr" },
  { key: "de", label: "DE", dir: "ltr" },
  { key: "ar", label: "AR", dir: "rtl" },
];

const DEFAULT_GROUP: Omit<CategoryGroup, "id"> = {
  translations: { en: "New Group", de: "Neue Gruppe", ar: "مجموعة جديدة" },
  categories: [],
};

export default function CategoriesPage() {
  const router = useRouter();
  const [data, setData] = useState<CategoriesData>({ groups: [] });
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newCatTranslations, setNewCatTranslations] = useState<Record<AdminLocale, string>>({
    en: "", de: "", ar: "",
  });
  const [newGroupTranslations, setNewGroupTranslations] = useState<Record<AdminLocale, string>>({
    en: "", de: "", ar: "",
  });
  const [showNewGroup, setShowNewGroup] = useState(false);

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
  }

  function addCategory() {
    if (!newCatTranslations.en.trim()) return;
    const id = newCatTranslations.en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === activeGroup
          ? { ...g, categories: [...g.categories, { id, translations: { ...newCatTranslations } }] }
          : g
      ),
    };
    setNewCatTranslations({ en: "", de: "", ar: "" });
    save(updated);
  }

  function deleteCategory(groupIdx: number, catId: string) {
    if (!confirm("Delete this category?")) return;
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === groupIdx ? { ...g, categories: g.categories.filter((c) => c.id !== catId) } : g
      ),
    };
    save(updated);
  }

  function updateCatTranslation(groupIdx: number, catId: string, locale: AdminLocale, value: string) {
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              categories: g.categories.map((c) =>
                c.id === catId ? { ...c, translations: { ...c.translations, [locale]: value } } : c
              ),
            }
          : g
      ),
    };
    setData(updated);
  }

  function saveCatEdit(groupIdx: number, cat: CategoryItem) {
    const updated: CategoriesData = {
      groups: data.groups.map((g, i) =>
        i === groupIdx
          ? { ...g, categories: g.categories.map((c) => (c.id === cat.id ? cat : c)) }
          : g
      ),
    };
    save(updated);
  }

  function addGroup() {
    if (!newGroupTranslations.en.trim()) return;
    const id = newGroupTranslations.en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const updated: CategoriesData = {
      groups: [...data.groups, { id, translations: { ...newGroupTranslations }, categories: [] }],
    };
    setNewGroupTranslations({ en: "", de: "", ar: "" });
    setShowNewGroup(false);
    save(updated);
  }

  function deleteGroup(idx: number) {
    if (!confirm("Delete this entire group and all its categories?")) return;
    const updated: CategoriesData = { groups: data.groups.filter((_, i) => i !== idx) };
    setActiveGroup(Math.min(activeGroup, updated.groups.length - 1));
    save(updated);
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  const group = data.groups[activeGroup];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Categories</h1>
          <p className="mt-1 text-sm text-stone-500">
            3 Gruppen · mehrsprachig · wird als Portfolio-Filter verwendet
          </p>
        </div>
        <button onClick={() => setShowNewGroup(true)} className="btn-secondary">
          + Neue Gruppe
        </button>
      </div>

      {/* Group tabs */}
      <div className="flex items-end gap-0 border-b border-stone-200 mb-6">
        {data.groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(i)}
            className={`relative border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              i === activeGroup
                ? "-mb-px border-graphite-900 text-graphite-900"
                : "border-transparent text-stone-500 hover:text-graphite-900:text-stone-200"
            }`}
          >
            {g.translations.en}
            <span className="ml-1.5 text-xs text-stone-400">
              ({g.categories.length})
            </span>
          </button>
        ))}
      </div>

      {group && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Category list */}
          <div className="space-y-3">
            {group.categories.length === 0 && (
              <p className="text-sm text-stone-400">Keine Kategorien in dieser Gruppe.</p>
            )}
            {group.categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-sm border border-stone-200 bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <code className="text-xs text-stone-400">id: {cat.id}</code>
                  <button
                    onClick={() => deleteCategory(activeGroup, cat.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {LOCALES.map((l) => (
                    <div key={l.key}>
                      <label className="label">{l.label}</label>
                      <input
                        value={cat.translations[l.key]}
                        onChange={(e) => updateCatTranslation(activeGroup, cat.id, l.key, e.target.value)}
                        onBlur={() => saveCatEdit(activeGroup, cat)}
                        className="input dark-input text-sm"
                        dir={l.dir}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div className="rounded-sm border border-stone-200 bg-white p-5 self-start">
            <h2 className="mb-4 text-sm font-semibold text-graphite-900">
              Neue Kategorie → {group.translations.en}
            </h2>
            <div className="space-y-3">
              {LOCALES.map((l) => (
                <div key={l.key}>
                  <label className="label">{l.label}</label>
                  <input
                    value={newCatTranslations[l.key]}
                    onChange={(e) =>
                      setNewCatTranslations((prev) => ({ ...prev, [l.key]: e.target.value }))
                    }
                    className="input dark-input"
                    placeholder={l.key === "en" ? "Category name (used as ID)" : "Translation"}
                    dir={l.dir}
                  />
                </div>
              ))}
              <button
                onClick={addCategory}
                disabled={!newCatTranslations.en.trim() || saving}
                className="btn-primary w-full mt-2"
              >
                {saving ? "Saving…" : "Add category"}
              </button>
            </div>

            <div className="mt-6 border-t border-stone-100 pt-4">
              <button
                onClick={() => deleteGroup(activeGroup)}
                className="text-xs text-red-500 hover:underline"
              >
                Gruppe löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New group modal */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-sm font-semibold text-graphite-900">Neue Gruppe</h2>
            <div className="space-y-3">
              {LOCALES.map((l) => (
                <div key={l.key}>
                  <label className="label">{l.label}</label>
                  <input
                    value={newGroupTranslations[l.key]}
                    onChange={(e) =>
                      setNewGroupTranslations((prev) => ({ ...prev, [l.key]: e.target.value }))
                    }
                    className="input dark-input"
                    dir={l.dir}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowNewGroup(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={addGroup}
                disabled={!newGroupTranslations.en.trim()}
                className="btn-primary flex-1"
              >
                Create group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
