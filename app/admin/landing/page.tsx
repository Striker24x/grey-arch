"use client";

// Neue Landing-Page-Verwaltung: alle Texte, Buttons und Bilder der Startseite.
// Die alte Video-Slider-Verwaltung liegt auskommentiert unter ./_legacy/.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAdminLang } from "../_components/AdminLangContext";
import { uploadToCloudinary } from "@/lib/client-upload";
import type { AdminLocale } from "@/lib/data-manager";
import type { LandingCard, LandingPageData, LandingTexts } from "@/lib/landing-page";

const LOCALES: { key: AdminLocale; label: string }[] = [
  { key: "de", label: "Deutsch" },
  { key: "en", label: "English" },
];

const UPLOAD_FOLDER = "images/grey-arch/landing";

type Ui = Record<string, string>;
const UI: Record<"de" | "en", Ui> = {
  de: {
    title: "Landing Page",
    desc: "Alle Texte, Buttons und Bilder der Startseite. Texte pro Sprache, Bilder gelten für beide Sprachen.",
    save: "Speichern", saving: "Speichert…", saved: "Gespeichert!", unsaved: "Ungespeicherte Änderungen",
    loading: "Lädt…", view: "Startseite ansehen ↗",
    hero: "1 · Hero (ganz oben)", headline: "Überschrift", text: "Text", button: "Button-Text", buttonLink: "Button-Link (für beide Sprachen)",
    buttonLinkHint: "z. B. /connect – die Sprache (/de, /en) wird automatisch ergänzt. Externe Links mit https://",
    banner: "2 · Großes Bild", image: "Bild", alt: "Bildbeschreibung (Alt-Text)",
    studio: "3 · Über uns / Gründer", sectionTitle: "Abschnittstitel", sectionTitleHint: "Leer = Name aus der Navigation",
    photo: "Foto", name: "Name", credentials: "Titel / Zusatzzeilen (eine pro Zeile)", bio: "Biografie (Absätze mit Leerzeile trennen)",
    services: "4 · Leistungen", description: "Beschreibung", cards: "Karten", card: "Karte",
    cardTitle: "Titel", cardText: "Beschreibung", badge: "Kennzeichnung (optional, z. B. „In Vorbereitung“)",
    addCard: "+ Karte hinzufügen", removeCard: "Karte löschen", up: "↑", down: "↓",
    portfolio: "5 · Projekte", portfolioCount: "Anzahl angezeigter Projekte", portfolioHint: "Die Projekte selbst werden unter „Projekte“ gepflegt.",
    team: "6 · Team", careers: "7 · Karriere", gallery: "Galerie (falls in der Navigation aktiv)",
    connect: "8 · Kontakt-Abschnitt", label: "Kleine Überschrift", heading: "Überschrift",
    upload: "Bild hochladen", replace: "Bild ersetzen", remove: "Entfernen", uploading: "Lädt hoch…",
    uploadHint: "JPG, PNG, WebP – wird automatisch optimiert und in Cloudflare R2 gespeichert",
    orderHint: "Reihenfolge und Sichtbarkeit der Abschnitte steuerst du unter „Navigation“.",
    confirmRemove: "Diese Karte wirklich löschen?",
  },
  en: {
    title: "Landing Page",
    desc: "All texts, buttons and images of the homepage. Texts per language, images are shared by both languages.",
    save: "Save", saving: "Saving…", saved: "Saved!", unsaved: "Unsaved changes",
    loading: "Loading…", view: "View homepage ↗",
    hero: "1 · Hero (top)", headline: "Headline", text: "Text", button: "Button label", buttonLink: "Button link (both languages)",
    buttonLinkHint: "e.g. /connect – the language (/de, /en) is added automatically. External links with https://",
    banner: "2 · Large image", image: "Image", alt: "Image description (alt text)",
    studio: "3 · About / founder", sectionTitle: "Section title", sectionTitleHint: "Empty = name from navigation",
    photo: "Photo", name: "Name", credentials: "Title / extra lines (one per line)", bio: "Biography (separate paragraphs with a blank line)",
    services: "4 · Services", description: "Description", cards: "Cards", card: "Card",
    cardTitle: "Title", cardText: "Description", badge: "Tag (optional, e.g. \"In preparation\")",
    addCard: "+ Add card", removeCard: "Delete card", up: "↑", down: "↓",
    portfolio: "5 · Projects", portfolioCount: "Number of projects shown", portfolioHint: "The projects themselves are managed under \"Projects\".",
    team: "6 · Team", careers: "7 · Careers", gallery: "Gallery (if active in navigation)",
    connect: "8 · Contact section", label: "Small label", heading: "Heading",
    upload: "Upload image", replace: "Replace image", remove: "Remove", uploading: "Uploading…",
    uploadHint: "JPG, PNG, WebP – optimised automatically and stored in Cloudflare R2",
    orderHint: "Section order and visibility are controlled under \"Navigation\".",
    confirmRemove: "Really delete this card?",
  },
};

function Card({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
      <h2 className="text-sm font-semibold text-graphite-900">{title}</h2>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
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

function ImageField({
  url,
  onChange,
  ui,
  aspect = "aspect-[16/9]",
}: {
  url: string;
  onChange: (url: string) => void;
  ui: Ui;
  aspect?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function handle(file: File) {
    setErr("");
    setProgress(0);
    try {
      const uploaded = await uploadToCloudinary(file, UPLOAD_FOLDER, setProgress);
      onChange(uploaded);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    }
    setProgress(null);
  }

  return (
    <div>
      <div
        onClick={() => progress === null && ref.current?.click()}
        className={`relative ${aspect} w-full max-w-md cursor-pointer overflow-hidden rounded-sm border-2 border-dashed border-stone-200 dark:border-line-300`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-stone-400">
            <span className="text-sm">{ui.upload}</span>
            <span className="px-4 text-center text-xs">{ui.uploadHint}</span>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
            {ui.uploading} {progress}%
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <button type="button" onClick={() => ref.current?.click()} disabled={progress !== null} className="text-stone-600 hover:underline">
          {url ? ui.replace : ui.upload}
        </button>
        {url && (
          <button type="button" onClick={() => onChange("")} className="text-red-500 hover:underline">
            {ui.remove}
          </button>
        )}
      </div>
      {url && <p className="mt-1 truncate text-[11px] text-stone-400" dir="ltr">{url}</p>}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const linesToArr = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const parasToArr = (v: string) => v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

export default function LandingAdminPage() {
  const { lang: uiLang } = useAdminLang();
  const ui = UI[uiLang] ?? UI.de;

  const [data, setData] = useState<LandingPageData | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [lang, setLang] = useState<AdminLocale>("de");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  // Free-text buffers for multi-line fields so typing blank lines isn't swallowed.
  const [credBuf, setCredBuf] = useState<Record<string, string>>({});
  const [bioBuf, setBioBuf] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/landing")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: LandingPageData) => {
        setData(d);
        setSavedJson(JSON.stringify(d));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  if (error && !data) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-sm text-stone-500">{ui.loading}</div>;

  const t = data.translations[lang];
  const dirty = JSON.stringify(data) !== savedJson;

  const setT = <K extends keyof LandingTexts>(field: K, value: LandingTexts[K]) =>
    setData({ ...data, translations: { ...data.translations, [lang]: { ...t, [field]: value } } });

  const setCards = (cards: LandingCard[]) => setData({ ...data, serviceCards: cards });
  const setCard = (i: number, patch: Partial<LandingCard>) =>
    setCards(data.serviceCards.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const setCardT = (i: number, field: "title" | "text" | "badge", value: string) => {
    const c = data.serviceCards[i];
    setCard(i, { translations: { ...c.translations, [lang]: { ...c.translations[lang], [field]: value } } });
  };
  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.serviceCards.length) return;
    const next = [...data.serviceCards];
    [next[i], next[j]] = [next[j], next[i]];
    setCards(next);
  };
  const addCard = () =>
    setCards([
      ...data.serviceCards,
      {
        id: `card-${Date.now()}`,
        image: "",
        translations: { de: { title: "", text: "", badge: "" }, en: { title: "", text: "", badge: "" } },
      },
    ]);

  async function save() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/landing", {
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

  const input = (field: keyof LandingTexts) => (
    <input value={t[field] as string} onChange={(e) => setT(field, e.target.value as never)} className="input" />
  );
  const area = (field: keyof LandingTexts, rows = 3) => (
    <textarea value={t[field] as string} onChange={(e) => setT(field, e.target.value as never)} rows={rows} className="input resize-y" />
  );
  const sectionBlock = (
    title: string,
    titleField: keyof LandingTexts,
    descField: keyof LandingTexts | null,
    ctaField: keyof LandingTexts,
    extra?: ReactNode
  ) => (
    <Card title={title}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label={ui.sectionTitle} hint={ui.sectionTitleHint}>{input(titleField)}</Field>
        <Field label={ui.button}>{input(ctaField)}</Field>
      </div>
      {descField && <Field label={ui.description}>{area(descField)}</Field>}
      {extra}
    </Card>
  );

  const credValue = credBuf[lang] ?? t.founderCredentials.join("\n");
  const bioValue = bioBuf[lang] ?? t.founderBio.join("\n\n");

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
          <a href={`/${lang}`} target="_blank" rel="noreferrer" className="text-xs text-stone-500 hover:underline">
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

      <p className="mb-6 text-xs text-stone-500">{ui.orderHint}</p>

      <div className="space-y-6">
        <Card title={ui.hero}>
          <Field label={ui.headline}>{input("heroHeadline")}</Field>
          <Field label={ui.text}>{area("heroText", 4)}</Field>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label={ui.button}>{input("heroCta")}</Field>
            <Field label={ui.buttonLink} hint={ui.buttonLinkHint}>
              <input value={data.heroCtaHref} onChange={(e) => setData({ ...data, heroCtaHref: e.target.value })} className="input" dir="ltr" />
            </Field>
          </div>
        </Card>

        <Card title={ui.banner}>
          <ImageField url={data.bannerImage} onChange={(u) => setData({ ...data, bannerImage: u })} ui={ui} aspect="aspect-[21/9]" />
          <Field label={ui.alt}>{input("bannerAlt")}</Field>
        </Card>

        <Card title={ui.studio}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
            <div>
              <label className="label">{ui.photo}</label>
              <ImageField url={data.founderPhoto} onChange={(u) => setData({ ...data, founderPhoto: u })} ui={ui} aspect="aspect-[4/5]" />
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label={ui.sectionTitle} hint={ui.sectionTitleHint}>{input("studioLabel")}</Field>
                <Field label={ui.name}>{input("founderName")}</Field>
              </div>
              <Field label={ui.credentials}>
                <textarea
                  value={credValue}
                  onChange={(e) => {
                    setCredBuf({ ...credBuf, [lang]: e.target.value });
                    setT("founderCredentials", linesToArr(e.target.value));
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
                    setT("founderBio", parasToArr(e.target.value));
                  }}
                  rows={9}
                  className="input resize-y"
                />
              </Field>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label={ui.button}>{input("studioCta")}</Field>
                <Field label={ui.alt}>{input("founderPhotoAlt")}</Field>
              </div>
            </div>
          </div>
        </Card>

        {sectionBlock(ui.services, "servicesTitle", "servicesDescription", "servicesCta",
          <div>
            <h3 className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{ui.cards}</h3>
            <div className="space-y-4">
              {data.serviceCards.map((c, i) => (
                <div key={c.id} className="rounded-sm border border-stone-200 p-4 dark:border-line-200">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-graphite-900">
                      {ui.card} {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <button type="button" onClick={() => moveCard(i, -1)} disabled={i === 0} className="px-1 text-stone-500 hover:text-graphite-900 disabled:opacity-30">{ui.up}</button>
                      <button type="button" onClick={() => moveCard(i, 1)} disabled={i === data.serviceCards.length - 1} className="px-1 text-stone-500 hover:text-graphite-900 disabled:opacity-30">{ui.down}</button>
                      <button
                        type="button"
                        onClick={() => confirm(ui.confirmRemove) && setCards(data.serviceCards.filter((_, j) => j !== i))}
                        className="text-red-500 hover:underline"
                      >
                        {ui.removeCard}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
                    <ImageField url={c.image} onChange={(u) => setCard(i, { image: u })} ui={ui} aspect="aspect-[4/3]" />
                    <div className="space-y-3">
                      <Field label={ui.cardTitle}>
                        <input value={c.translations[lang]?.title ?? ""} onChange={(e) => setCardT(i, "title", e.target.value)} className="input" />
                      </Field>
                      <Field label={ui.cardText}>
                        <textarea value={c.translations[lang]?.text ?? ""} onChange={(e) => setCardT(i, "text", e.target.value)} rows={3} className="input resize-y" />
                      </Field>
                      <Field label={ui.badge}>
                        <input value={c.translations[lang]?.badge ?? ""} onChange={(e) => setCardT(i, "badge", e.target.value)} className="input" />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCard} className="btn-secondary mt-4">{ui.addCard}</button>
          </div>
        )}

        {sectionBlock(ui.portfolio, "portfolioTitle", "portfolioDescription", "portfolioCta",
          <Field label={ui.portfolioCount} hint={ui.portfolioHint}>
            <input
              type="number"
              min={1}
              max={12}
              value={data.portfolioCount}
              onChange={(e) => setData({ ...data, portfolioCount: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
              className="input max-w-[120px]"
            />
          </Field>
        )}

        {sectionBlock(ui.team, "teamTitle", "teamDescription", "teamCta")}
        {sectionBlock(ui.careers, "careersTitle", "careersDescription", "careersCta")}

        <Card title={ui.connect}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label={ui.label} hint={ui.sectionTitleHint}>{input("connectLabel")}</Field>
            <Field label={ui.button}>{input("connectCta")}</Field>
          </div>
          <Field label={ui.heading}>{input("connectHeading")}</Field>
          <Field label={ui.text}>{area("connectText")}</Field>
        </Card>

        {sectionBlock(ui.gallery, "galleryTitle", "galleryDescription", "galleryCta")}

        <div className="flex justify-end">{saveBtn}</div>
      </div>
    </div>
  );
}
