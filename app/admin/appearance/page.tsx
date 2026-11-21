"use client";

import { useState, useEffect } from "react";
import { FONTS, FONT_CATEGORIES, type FontEntry } from "@/lib/fonts";

// Global site font. Saved in the database via /api/admin/typography and rendered
// server-side by app/[lang]/layout.tsx — applies to every page and every visitor.

const DEFAULT_LABEL = "Standard (Original-Design)";

const CATEGORY_COLORS: Record<string, string> = {
  Geometric: "bg-blue-100 text-blue-700",
  Humanist: "bg-green-100 text-green-700",
  Condensed: "bg-purple-100 text-purple-700",
  Serif: "bg-amber-100 text-amber-700",
  Mono: "bg-stone-100 text-stone-700",
};

type Status = { kind: "idle" } | { kind: "saving"; font: string | null } | { kind: "saved" } | { kind: "error"; msg: string };

export default function AppearancePage() {
  /** null = original design (Inter + DM Serif Display). undefined = still loading. */
  const [selected, setSelected] = useState<string | null | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState("All");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    // Leftover from the old browser-only implementation — no longer used.
    localStorage.removeItem("site-font");

    fetch("/api/admin/typography")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: { font: string | null }) => setSelected(d.font ?? null))
      .catch((e) => {
        setSelected(null);
        setStatus({ kind: "error", msg: e instanceof Error ? e.message : "Laden fehlgeschlagen" });
      });

    // Load all preview fonts in batches to avoid URL length issues
    const links: HTMLLinkElement[] = [];
    for (let i = 0; i < FONTS.length; i += 20) {
      const families = FONTS.slice(i, i + 20)
        .map((f: FontEntry) => `family=${f.name.replace(/ /g, "+")}`)
        .join("&");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => links.forEach((l) => l.remove());
  }, []);

  async function handleSelect(font: string | null) {
    if (status.kind === "saving" || font === selected) return;
    const previous = selected;
    setSelected(font);
    setStatus({ kind: "saving", font });
    try {
      const res = await fetch("/api/admin/typography", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setSelected(body.font ?? null);
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s)), 2500);
    } catch (e) {
      setSelected(previous);
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : "Speichern fehlgeschlagen" });
    }
  }

  const visible = activeCategory === "All" ? FONTS : FONTS.filter((f) => f.category === activeCategory);
  const loading = selected === undefined;

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Typography</h1>
          <p className="mt-1 text-sm text-stone-500">
            Schriftart für die gesamte Website (alle Seiten inkl. Header, Footer und Startseite). Die Änderung ist sofort für alle Besucher live.
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Aktiv:{" "}
            <span className="font-semibold text-amber-700" data-testid="active-font">
              {loading ? "…" : selected ?? DEFAULT_LABEL}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {status.kind === "saving" && <span className="text-stone-500">Speichert…</span>}
          {status.kind === "saved" && <span className="text-green-700">Gespeichert – live auf der Website</span>}
          {status.kind === "error" && <span className="text-red-600">{status.msg}</span>}
          <a href="/" target="_blank" rel="noreferrer" className="text-stone-500 hover:underline">
            Website ansehen ↗
          </a>
        </div>
      </div>

      {/* Original design */}
      <button
        onClick={() => handleSelect(null)}
        disabled={loading}
        className={`mb-6 w-full rounded-sm border p-4 text-left transition-all sm:max-w-md ${
          selected === null
            ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400 dark:bg-paper-200"
            : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm dark:border-line-200 dark:bg-paper-200"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xl leading-tight text-graphite-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Grey Arc
          </span>
          {selected === null && (
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">✓</span>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500" style={{ fontFamily: "Inter, sans-serif" }}>
          Überschriften DM Serif Display · Fließtext Inter
        </p>
        <span className="mt-3 block text-[11px] font-medium text-stone-700">{DEFAULT_LABEL}</span>
      </button>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FONT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat ? "bg-graphite-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Font grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((font) => {
          const isSelected = selected === font.name;
          const isSaving = status.kind === "saving" && status.font === font.name;
          return (
            <button
              key={font.name}
              onClick={() => handleSelect(font.name)}
              disabled={loading}
              data-font={font.name}
              className={`rounded-sm border p-4 text-left transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400 dark:bg-paper-200"
                  : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm dark:border-line-200 dark:bg-paper-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-xl font-semibold leading-tight text-graphite-900"
                  style={{ fontFamily: `"${font.name}", sans-serif` }}
                >
                  Grey Arc
                </span>
                {isSelected && (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                    {isSaving ? "…" : "✓"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500" style={{ fontFamily: `"${font.name}", sans-serif` }}>
                Architecture & Design Studio
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-700">{font.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[font.category]}`}>
                  {font.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-stone-400">{FONTS.length} Schriftarten · Alle von Google Fonts</p>
    </div>
  );
}
