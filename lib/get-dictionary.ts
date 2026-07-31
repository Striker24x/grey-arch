import "server-only";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { Locale } from "./i18n";
import type { Dictionary } from "./dictionary-types";
import type { ProjectRecord, GalleryRecord, TeamRecord, CategoriesData, StudioData, ServicesData, ConnectData, OverviewData } from "./data-manager";

const DATA_DIR = join(process.cwd(), "data");

function readData<T>(filename: string): T | null {
  const fp = join(DATA_DIR, filename);
  if (!existsSync(fp)) return null;
  try {
    return JSON.parse(readFileSync(fp, "utf-8")) as T;
  } catch {
    return null;
  }
}

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

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  let dict = await dictionaries[locale]();

  const projects = readData<ProjectRecord[]>("projects.json");
  if (projects) {
    dict.portfolio.projects = projects.map((p) => ({
      slug: p.slug,
      year: p.year,
      categories: p.categories,
      image: p.image,
      galleryImages: p.galleryImages,
      ...(p.font ? { font: p.font } : {}),
      ...(p.translations[locale] ?? p.translations.en),
    }));
  }

  const gallery = readData<GalleryRecord[]>("gallery.json");
  if (gallery) {
    dict.galleryPage.items = gallery.map((g) => ({
      image: g.image,
      ...(g.translations[locale] ?? g.translations.en),
    }));
  }

  const team = readData<TeamRecord[]>("team.json");
  if (team) {
    dict.team.members = team.map((t) => ({
      initials: t.initials,
      ...(t.image ? { image: t.image } : {}),
      ...(t.translations[locale] ?? t.translations.en),
    }));
  }

  // Build portfolio filters from categories data (multilingual)
  const categories = readData<CategoriesData>("categories.json");
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

  // Inject studio data from DB if available
  const studioDb = readData<StudioData>("studio.json");
  if (studioDb) {
    const t = studioDb.translations[locale] ?? studioDb.translations.en;
    dict.studio = {
      title: t.title,
      intro: t.intro,
      history: { title: t.historyTitle, body: t.historyBody },
      mission: { title: t.missionTitle, body: t.missionBody },
      vision: { title: t.visionTitle, body: t.visionBody },
      approach: {
        title: t.approachTitle,
        body: t.approachBody,
        steps: t.approachSteps,
      },
      values: { title: t.valuesTitle, items: t.valuesItems },
    };
  }

  // Inject services data from DB if available
  const servicesDb = readData<ServicesData>("services.json");
  if (servicesDb) {
    const t = servicesDb.translations[locale] ?? servicesDb.translations.en;
    dict.servicesPage = {
      title: t.title,
      intro: t.intro,
      groups: t.groups,
    };
  }

  // Inject connect data from DB if available
  const connectDb = readData<ConnectData>("connect.json");
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
        consent: t.formConsent,
        submit: t.formSubmit,
      },
    };
  }

  // Inject overview (home) data from DB if available
  const overviewDb = readData<OverviewData>("overview.json");
  if (overviewDb) {
    const t = overviewDb.translations[locale] ?? overviewDb.translations.en;
    dict.home.hero = {
      ...dict.home.hero,
      eyebrow: t.heroEyebrow,
      headline: t.heroHeadline,
      subheadline: t.heroSubheadline,
      ctaExplore: t.heroCtaExplore,
      ctaPortfolio: t.heroCtaPortfolio,
      ctaStart: t.heroCtaStart,
    };
    dict.home.philosophy = {
      ...dict.home.philosophy,
      eyebrow: t.philosophyEyebrow,
      title: t.philosophyTitle,
      body: t.philosophyBody,
      points: t.philosophyPoints,
    };
    dict.home.process = {
      ...dict.home.process,
      eyebrow: t.processEyebrow,
      title: t.processTitle,
      intro: t.processIntro,
      steps: t.processSteps,
    };
    dict.home.heritage = {
      ...dict.home.heritage,
      eyebrow: t.heritageEyebrow,
      title: t.heritageTitle,
      body: t.heritageBody,
      points: t.heritagePoints,
      cta: t.heritageCta,
    };
    dict.home.digitalArch = {
      ...dict.home.digitalArch,
      eyebrow: t.digitalArchEyebrow,
      title: t.digitalArchTitle,
      body: t.digitalArchBody,
      points: t.digitalArchPoints,
      cta: t.digitalArchCta,
    };
    dict.home.contactCta = {
      title: t.contactCtaTitle,
      body: t.contactCtaBody,
      cta: t.contactCtaCta,
    };
  }

  // Apply Cloudinary URL replacements for any remaining local paths
  const imageMap = readData<Record<string, string>>("image-map.json");
  if (imageMap) {
    dict = applyImageMap(dict, imageMap);
  }

  return dict;
};
