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

/** Canonical production origin (apex domain; www serves the same app). */
export const SITE_URL = "https://grayarc.de";

/**
 * Per-page alternates for generateMetadata: absolute canonical for the
 * current locale plus absolute hreflang links for every locale and an
 * x-default pointing at the default locale.
 */
export const pageAlternates = (lang: string, pathSuffix: string = "") => {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = `${SITE_URL}/${locale}${pathSuffix}`;
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${pathSuffix}`;
  return { canonical: `${SITE_URL}/${lang}${pathSuffix}`, languages };
};
