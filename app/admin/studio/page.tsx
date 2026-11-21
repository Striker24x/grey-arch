"use client";

// Studio-/GrayArc-Seite: alle Inhalte der öffentlichen Seite /[lang]/studio —
// Seitentitel, Einleitung, Gründer-Block (Foto, Name, Titel, Biografie) und der
// frei formatierbare Inhalt. Aufbau wie Admin → Landing Page.

import { useEffect, useState, type ReactNode } from "react";
import { useAdminLang } from "../_components/AdminLangContext";
import AdminImageField from "../_components/AdminImageField";
import RichTextEditor from "../_components/RichTextEditor";
import { uploadToCloudinary } from "@/lib/client-upload";
import type { AdminLocale, StudioData, StudioFounder, StudioFounderTranslation, StudioTranslation } from "@/lib/data-manager";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "de", label: "Deutsch" },
  { key: "en", label: "English" },
];

const PHOTO_FOLDER = "images/grey-arch/studio";
const BODY_FOLDER = "images/grey-arch/studio-body";

type Ui = Record<string, string>;
const UI: Record<"de" | "en", Ui> = {
  de: {
    title: "Studio (GrayArc-Seite)",
    desc: "Alle Inhalte der Seite „GrayArc“. Texte pro Sprache, Bilder gelten für beide Sprachen.",
    save: "Speichern", saving: "Speichert…", saved: "Gespeichert!", unsaved: "Ungespeicherte Änderungen",
    loading: "Lädt…", view: "Seite ansehen ↗", leave: "Es gibt ungespeicherte Änderungen. Seite wirklich verlassen?",
    head: "1 · Seitentitel & Einleitung", pageTitle: "Seitentitel", pageTitleHint: "Leer = Name aus der Navigation",
    intro: "Einleitung (großer Satz unter dem Gründer-Block)",
    founder: "2 · Gründer", founderVisible: "Gründer-Block auf der Seite anzeigen",
    photo: "Foto", name: "Name", credentials: "Titel / Zusatzzeilen (eine pro Zeile)",
    bio: "Biografie (Absätze mit Leerzeile trennen)", alt: "Bildbeschreibung (Alt-Text)",
    body: "3 · Inhalt (Geschichte, Mission, Vision …)",
    bodyHint:
      "Überschriften (H3) werden zu Abschnitten und erscheinen im Burger-Menü als Unterpunkte. Eine nummerierte Liste wird als Schritte auf dunklem Band dargestellt, eine Aufzählung mit fettem Titel je Punkt als Karten. Bilder über „Image“ in der Werkzeugleiste.",
    upload: "Bild hochladen", replace: "Bild ersetzen", remove: "Entfernen", uploading: "Lädt hoch…",
    uploadHint: "JPG, PNG, WebP – wird automatisch optimiert und in Cloudflare R2 gespeichert",
  },
  en: {
    title: "Studio (GrayArc page)",
    desc: "All content of the “GrayArc” page. Texts per language, images are shared by both languages.",
    save: "Save", saving: "Saving…", saved: "Saved!", unsaved: "Unsaved changes",
    loading: "Loading…", view: "View page ↗", leave: "You have unsaved changes. Really leave this page?",
    head: "1 · Page title & intro", pageTitle: "Page title", pageTitleHint: "Empty = name from navigation",
    intro: "Intro (large sentence below the founder block)",
    founder: "2 · Founder", founderVisible: "Show founder block on the page",
    photo: "Photo", name: "Name", credentials: "Title / extra lines (one per line)",
    bio: "Biography (separate paragraphs with a blank line)", alt: "Image description (alt text)",
    body: "3 · Content (history, mission, vision …)",
    bodyHint:
      "Headings (H3) become sections and appear as sub-items in the burger menu. A numbered list is shown as steps on a dark band, a bulleted list with a bold title per item as cards. Insert images via “Image” in the toolbar.",
    upload: "Upload image", replace: "Replace image", remove: "Remove", uploading: "Uploading…",
    uploadHint: "JPG, PNG, WebP – optimised automatically and stored in Cloudflare R2",
  },
};

const EMPTY_FOUNDER_T: StudioFounderTranslation = { name: "", photoAlt: "", credentials: [], bio: [] };

function Card({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
      <h2 className="text-sm font-semibold text-graphite-900">{title}</h2>
      {hint && <p className="mt-1 max-w-3xl text-xs text-stone-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

const linesToArr = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const parasToArr = (v: string) => v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

export default function StudioAdminPage() {
  const { lang: uiLang } = useAdminLang();
  const ui = UI[uiLang] ?? UI.de;

  const [data, setData] = useState<StudioData | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [lang, setLang] = useState<AdminLocale>("de");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  // Free-text buffers for multi-line fields so typing blank lines isn't swallowed.
  const [credBuf, setCredBuf] = useState<Record<string, string>>({});
  const [bioBuf, setBioBuf] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/studio")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: StudioData) => {
        setData(d);
        setSavedJson(JSON.stringify(d));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  const dirty = !!data && JSON.stringify(data) !== savedJson;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ui.leave;
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, ui.leave]);

  if (error && !data) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-sm text-stone-500">{ui.loading}</div>;

  const t: StudioTranslation = data.translations[lang] ?? { title: "", intro: "", body: "" };
  const founder: StudioFounder = data.founder ?? {
    visible: true,
    photo: "",
    translations: { de: EMPTY_FOUNDER_T, en: EMPTY_FOUNDER_T },
  };
  const ft: StudioFounderTranslation = founder.translations[lang] ?? EMPTY_FOUNDER_T;

  const setT = (field: keyof StudioTranslation, value: string) =>
    setData({ ...data, translations: { ...data.translations, [lang]: { ...t, [field]: value } } });
  const setFounder = (patch: Partial<StudioFounder>) => setData({ ...data, founder: { ...founder, ...patch } });
  const setFT = <K extends keyof StudioFounderTranslation>(field: K, value: StudioFounderTranslation[K]) =>
    setFounder({ translations: { ...founder.translations, [lang]: { ...ft, [field]: value } } });

  async function save() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Save failed");
      setSavedJson(JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  const credValue = credBuf[lang] ?? ft.credentials.join("\n");
  const bioValue = bioBuf[lang] ?? ft.bio.join("\n\n");

  const saveBtn = (
    <button onClick={save} disabled={saving || !dirty} className="btn-primary disabled:opacity-40">
      {saving ? ui.saving : saved ? ui.saved : ui.save}
    </button>
  );

  return (
    <div className="p-8">
      <div className="sticky top-0 z-10 -mx-8 mb-6 flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-8 py-5 dark:border-line-200 dark:bg-paper-100">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">{ui.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{ui.desc}</p>
        </div>
        <div className="flex items-center gap-4">
          {dirty && <span className="text-xs text-amber-600">{ui.unsaved}</span>}
          <a href={`/${lang}/studio`} target="_blank" rel="noreferrer" className="text-xs text-stone-500 hover:underline">
            {ui.view}
          </a>
          {saveBtn}
        </div>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

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
        <Card title={ui.head}>
          <Field label={ui.pageTitle} hint={ui.pageTitleHint}>
            <input value={t.title} onChange={(e) => setT("title", e.target.value)} className="input" />
          </Field>
          <Field label={ui.intro}>
            <textarea value={t.intro} onChange={(e) => setT("intro", e.target.value)} rows={3} className="input resize-y" />
          </Field>
        </Card>

        <Card title={ui.founder}>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-graphite-900">
            <input
              type="checkbox"
              checked={founder.visible}
              onChange={(e) => setFounder({ visible: e.target.checked })}
              className="h-4 w-4 accent-graphite-900"
            />
            {ui.founderVisible}
          </label>
          <div className={`grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] ${founder.visible ? "" : "opacity-50"}`}>
            <div>
              <label className="label">{ui.photo}</label>
              <AdminImageField
                url={founder.photo}
                onChange={(u) => setFounder({ photo: u })}
                folder={PHOTO_FOLDER}
                labels={{ upload: ui.upload, replace: ui.replace, remove: ui.remove, uploading: ui.uploading, uploadHint: ui.uploadHint }}
                aspect="aspect-[3/4]"
              />
            </div>
            <div className="space-y-4">
              <Field label={ui.name}>
                <input value={ft.name} onChange={(e) => setFT("name", e.target.value)} className="input" />
              </Field>
              <Field label={ui.credentials}>
                <textarea
                  value={credValue}
                  onChange={(e) => {
                    setCredBuf({ ...credBuf, [lang]: e.target.value });
                    setFT("credentials", linesToArr(e.target.value));
                  }}
                  rows={3}
                  className="input resize-y"
                />
              </Field>
              <Field label={ui.bio}>
                <textarea
                  value={bioValue}
                  onChange={(e) => {
                    setBioBuf({ ...bioBuf, [lang]: e.target.value });
                    setFT("bio", parasToArr(e.target.value));
                  }}
                  rows={12}
                  className="input resize-y"
                />
              </Field>
              <Field label={ui.alt}>
                <input value={ft.photoAlt} onChange={(e) => setFT("photoAlt", e.target.value)} className="input" />
              </Field>
            </div>
          </div>
        </Card>

        <Card title={ui.body} hint={ui.bodyHint}>
          <div className="-mx-6 -mb-6 border-t border-stone-200 bg-stone-100 p-6 dark:border-line-200 dark:bg-paper-300 sm:p-10">
            <div className="mx-auto max-w-[760px] bg-white px-10 py-14 shadow-soft dark:bg-paper-200 sm:px-16">
              <RichTextEditor
                value={t.body ?? ""}
                onChange={(html) => setT("body", html)}
                variant="page"
                onUploadImage={(file) => uploadToCloudinary(file, BODY_FOLDER) as Promise<string>}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">{saveBtn}</div>
      </div>
    </div>
  );
}
