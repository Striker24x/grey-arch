import "server-only";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { Locale } from "./i18n";
import type { Dictionary } from "./dictionary-types";
import type { ProjectRecord, GalleryRecord, TeamRecord, CategoriesData } from "./data-manager";

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

  // Apply Cloudinary URL replacements for any remaining local paths
  const imageMap = readData<Record<string, string>>("image-map.json");
  if (imageMap) {
    dict = applyImageMap(dict, imageMap);
  }

  return dict;
};
