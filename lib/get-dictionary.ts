import "server-only";
import type { Locale } from "./i18n";
import type { Dictionary } from "./dictionary-types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
