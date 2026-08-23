import "server-only";
import DOMPurify from "isomorphic-dompurify";
import { readJsonSync, getStudio, getServices } from "./data-manager";
import type { Locale } from "./i18n";
import type { Dictionary, SourceDictionary } from "./dictionary-types";
import type { ProjectRecord, GalleryRecord, TeamRecord, CategoriesData, ConnectData, JobRecord } from "./data-manager";
import { resolveServiceLayout } from "./service-layouts";
import { injectHeadingIds, extractHeadingSections } from "./parse-content-blocks";

function sanitizeBody(html: string): string {
  return DOMPurify.sanitize(html, { ADD_TAGS: ["img"], ADD_ATTR: ["src", "alt"] });
}

// Reads admin-edited content from the database (same store the admin panel writes to)
const readData = readJsonSync;

/** Recursively replace every string value that's a known local path with its Cloudinary URL. */
function applyImageMap<T>(obj: T, map: Record<string, string>): T {
  if (typeof obj === "string") {
    return (map[obj] ?? obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => applyImageMap(item, map)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as object)) {
      result[key] = applyImageMap((obj as Record<string, unknown>)[key], map);
    }
    return result as T;
  }
  return obj;
}

const dictionaries: Record<Locale, () => Promise<SourceDictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const [dictResult, projects, gallery, team, categories, studioData, servicesData, connectDb, jobs, imageMap] =
    await Promise.all([
      dictionaries[locale](),
      readData<ProjectRecord[]>("projects.json"),
      readData<GalleryRecord[]>("gallery.json"),
      readData<TeamRecord[]>("team.json"),
      readData<CategoriesData>("categories.json"),
      getStudio(),
      getServices(),
      readData<ConnectData>("connect.json"),
      readData<JobRecord[]>("jobs.json"),
      readData<Record<string, string>>("image-map.json"),
    ]);
  // studio/servicesPage are overwritten unconditionally right below, from getStudio()/
  // getServices() (which always return the current rich-text shape — migrating or seeding
  // on first read) — the cast is safe because nothing reads dict.studio/servicesPage before that.
  let dict = dictResult as unknown as Dictionary;

  {
    const t = studioData.translations[locale] ?? studioData.translations.en;
    const body = injectHeadingIds(sanitizeBody(t.body ?? ""));
    dict.studio = { title: t.title, intro: t.intro, body, sections: extractHeadingSections(body) };
  }

  {
    const t = servicesData.translations[locale] ?? servicesData.translations.en;
    const body = injectHeadingIds(sanitizeBody(t.body ?? ""));
    dict.servicesPage = { title: t.title, intro: t.intro, body, sections: extractHeadingSections(body) };
  }

  if (projects) {
    dict.portfolio.projects = projects.map((p) => ({
      slug: p.slug,
      year: p.year,
      categories: p.categories,
      image: p.image,
      galleryImages: p.galleryImages,
      ...(p.font ? { font: p.font } : {}),
      layout: resolveServiceLayout(p.layout),
      ...(p.translations[locale] ?? p.translations.en),
    }));
  }

  if (gallery) {
    dict.galleryPage.items = gallery.map((g) => ({
      image: g.image,
      ...(g.translations[locale] ?? g.translations.en),
    }));
  }

  if (team) {
    dict.team.members = team.map((t) => ({
      initials: t.initials,
      ...(t.image ? { image: t.image } : {}),
      ...(t.translations[locale] ?? t.translations.en),
    }));
  }

  if (jobs) {
    dict.careers.jobs = jobs
      .filter((j) => j.visible)
      .map((j) => ({
        id: j.id,
        slug: j.slug,
        ...(j.image ? { image: j.image } : {}),
        ...(j.translations[locale] ?? j.translations.en),
      }));
  }

  // Build portfolio filters from categories data (multilingual)
  if (categories) {
    const allLabel = dict.portfolio.filters.all;
    const galleryLabel = dict.portfolio.filters.gallery;
    const filters: Record<string, string> = { all: allLabel };
    for (const group of categories.groups) {
      for (const cat of group.categories) {
        filters[cat.id] = cat.translations[locale] ?? cat.translations.en;
      }
    }
    filters.gallery = galleryLabel;
    dict.portfolio.filters = filters as Dictionary["portfolio"]["filters"];
  }

  // Inject connect data from DB if available
  if (connectDb) {
    const t = connectDb.translations[locale] ?? connectDb.translations.en;
    dict.connect = {
      title: t.title,
      intro: t.intro,
      ctas: {
        startProject: t.ctaStartProject,
        requestConsultation: t.ctaRequestConsultation,
        sendPlans: t.ctaSendPlans,
      },
      form: {
        name: t.formName,
        email: t.formEmail,
        phone: t.formPhone,
        preferredLanguage: t.formPreferredLanguage,
        projectType: t.formProjectType,
        projectTypeOptions: t.formProjectTypeOptions,
        projectLocation: t.formProjectLocation,
        buildingStatus: t.formBuildingStatus,
        buildingStatusOptions: t.formBuildingStatusOptions,
        requiredService: t.formRequiredService,
        projectSize: t.formProjectSize,
        budgetRange: t.formBudgetRange,
        message: t.formMessage,
        attachment: t.formAttachment ?? dict.connect.form.attachment,
        attachmentHint: t.formAttachmentHint ?? dict.connect.form.attachmentHint,
        consent: t.formConsent,
        submit: t.formSubmit,
      },
    };
  }

  // Apply Cloudinary URL replacements for any remaining local paths
  if (imageMap) {
    dict = applyImageMap(dict, imageMap);
  }

  return dict;
};
