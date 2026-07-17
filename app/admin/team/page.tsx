"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { TeamRecord, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "ar", label: "العربية" },
];

const empty = (): TeamRecord => ({
  id: "",
  initials: "",
  translations: {
    en: { name: "", role: "", bio: "", tags: [] },
    de: { name: "", role: "", bio: "", tags: [] },
    ar: { name: "", role: "", bio: "", tags: [] },
  },
});

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [lang, setLang] = useState<AdminLocale>("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => setMembers(d as TeamRecord[]))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(empty());
    setIsNew(true);
    setLang("en");
    setError("");
  }

  function openEdit(m: TeamRecord) {
    setEditing(JSON.parse(JSON.stringify(m)) as TeamRecord);
    setIsNew(false);
    setLang("en");
    setError("");
  }

  function setField(field: keyof Omit<TeamRecord, "translations">, value: string) {
    setEditing((e) => e && { ...e, [field]: value });
  }

  function setTransField(field: "name" | "role" | "bio", value: string) {
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

  function setTags(value: string) {
    const tags = value.split(",").map((t) => t.trim()).filter(Boolean);
    setEditing((e) =>
      e && {
        ...e,
        translations: {
          ...e.translations,
          [lang]: { ...e.translations[lang], tags },
        },
      }
    );
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/team" : `/api/admin/team/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setMembers((prev) =>
        isNew ? [...prev, saved as TeamRecord] : prev.map((m) => (m.id === saved.id ? (saved as TeamRecord) : m))
      );
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team member?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (editing?.id === id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Team</h1>
          <p className="mt-1 text-sm text-stone-500">{members.length} members</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add member</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* List */}
        <div className="rounded-sm border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Initials</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Name (EN)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Role (EN)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-600">{m.initials}</td>
                    <td className="px-4 py-3 text-graphite-900">{m.translations.en.name}</td>
                    <td className="px-4 py-3 text-stone-500">{m.translations.en.role}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(m)} className="text-xs font-medium text-graphite-900 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:underline">
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
              {isNew ? "New member" : "Edit member"}
            </h2>

            {error && <div className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

            <div className="mb-4 space-y-3">
              <div>
                <label className="label">Initials</label>
                <input
                  value={editing.initials}
                  onChange={(e) => setField("initials", e.target.value)}
                  className="input"
                  placeholder="L A"
                />
              </div>
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
                <label className="label">Name</label>
                <input
                  value={editing.translations[lang].name}
                  onChange={(e) => setTransField("name", e.target.value)}
                  className="input"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <input
                  value={editing.translations[lang].role}
                  onChange={(e) => setTransField("role", e.target.value)}
                  className="input"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  value={editing.translations[lang].bio}
                  onChange={(e) => setTransField("bio", e.target.value)}
                  rows={3}
                  className="input resize-y"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  value={editing.translations[lang].tags.join(", ")}
                  onChange={(e) => setTags(e.target.value)}
                  className="input"
                  placeholder="Tag 1, Tag 2"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
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
