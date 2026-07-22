export const locales = ["en", "de", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeDir = (locale: Locale): "ltr" | "rtl" =>
  locale === "ar" ? "rtl" : "ltr";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  ar: "العربية",
};

export const localeFlagLabel: Record<Locale, string> = {
  en: "en",
  de: "de",
  ar: "ع",
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
