export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export const localeFlagLabel: Record<Locale, string> = {
  en: "en",
  de: "de",
};

/** Builds hreflang alternates for a path suffix, e.g. "/studio" or "". */
export const alternateLinks = (pathSuffix: string = ""): Record<Locale, string> =>
  locales.reduce(
    (acc, locale) => {
      acc[locale] = `/${locale}${pathSuffix}`;
      return acc;
    },
    {} as Record<Locale, string>
  );
