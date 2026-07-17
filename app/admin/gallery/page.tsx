"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { GalleryRecord, AdminLocale } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "de", label: "DE" },
  { key: "ar", label: "AR" },
];

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d as GalleryRecord[]))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "images/grey-arch/gallery");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        const newItem: GalleryRecord = {
          id: `gallery-${Date.now()}`,
          image: url as string,
          translations: {
            en: { title: file.name.replace(/\.[^.]+$/, ""), category: "Photo" },
            de: { title: file.name.replace(/\.[^.]+$/, ""), category: "Foto" },
            ar: { title: file.name.replace(/\.[^.]+$/, ""), category: "صورة" },
          },
        };
        const saveRes = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (!saveRes.ok) throw new Error("Save failed");
        const saved = await saveRes.json();
        setItems((prev) => [...prev, saved as GalleryRecord]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this gallery item?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function handleEdit(item: GalleryRecord, lang: AdminLocale, field: "title" | "category", value: string) {
    const updated: GalleryRecord = {
      ...item,
      translations: {
        ...item.translations,
        [lang]: { ...item.translations[lang], [field]: value },
      },
    };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Gallery</h1>
          <p className="mt-1 text-sm text-stone-500">{items.length} images</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary"
          >
            {uploading ? "Uploading…" : "+ Upload images"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-sm border border-stone-200 bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.translations.en.title} className="aspect-square w-full object-cover" />
              <div className="p-3 space-y-3">
                {LOCALES.map((l) => (
                  <div key={l.key} className="space-y-1">
                    <p className="text-xs font-medium text-stone-400">{l.label}</p>
                    <input
                      value={item.translations[l.key].title}
                      onChange={(e) => handleEdit(item, l.key, "title", e.target.value)}
                      className="input text-xs"
                      placeholder="Title"
                      dir={l.key === "ar" ? "rtl" : "ltr"}
                    />
                    <input
                      value={item.translations[l.key].category}
                      onChange={(e) => handleEdit(item, l.key, "category", e.target.value)}
                      className="input text-xs"
                      placeholder="Category"
                      dir={l.key === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-full border border-red-200 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
