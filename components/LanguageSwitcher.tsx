"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeFlagLabel, type Locale } from "@/lib/i18n";

function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = nextLocale;
  return segments.join("/") || `/${nextLocale}`;
}

export default function LanguageSwitcher({
  lang,
  variant = "inline",
}: {
  lang: Locale;
  variant?: "inline" | "stacked";
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSwitch = (next: Locale) => {
    if (next === lang) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.push(swapLocaleInPath(pathname, next));
  };

  return (
    <div
      className={
        variant === "inline"
          ? "flex items-center gap-1"
          : "flex flex-col items-start gap-2"
      }
    >
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          <button
            type="button"
            onClick={() => handleSwitch(locale)}
            aria-current={locale === lang ? "true" : undefined}
            className={`cursor-pointer px-2 py-1 text-sm transition-colors duration-200 ${
              locale === lang
                ? "text-ink font-medium"
                : "text-stone-500 hover:text-ink"
            }`}
          >
            {localeFlagLabel[locale]}
          </button>
          {variant === "inline" && index < locales.length - 1 ? (
            <span className="text-line-400" aria-hidden="true">
              /
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
