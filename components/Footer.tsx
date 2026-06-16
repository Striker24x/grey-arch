import Link from "next/link";
import ArchMark from "./ArchMark";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary-types";

export default function Footer({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const navItems = [
    { href: `/${lang}/studio`, label: dict.nav.studio },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/portfolio`, label: dict.nav.portfolio },
    { href: `/${lang}/team`, label: dict.nav.team },
    { href: `/${lang}/connect`, label: dict.nav.connect },
  ];

  const legalItems = [
    { href: `/${lang}/impressum`, label: dict.footer.impressum },
    { href: `/${lang}/datenschutz`, label: dict.footer.datenschutz },
    { href: `/${lang}/agb`, label: dict.footer.agb },
  ];

  return (
    <footer className="border-t border-line-200 bg-paper-200">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-graphite-900">
              <ArchMark className="h-7 w-7" />
              <span className="font-heading text-xl tracking-wide">{dict.meta.siteName}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              {dict.footer.navTitle}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="cursor-pointer text-sm text-stone-600 transition-colors duration-200 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              {dict.footer.legalTitle}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {legalItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="cursor-pointer text-sm text-stone-600 transition-colors duration-200 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
              {dict.footer.languageLabel}
            </h3>
            <div className="mt-4">
              <LanguageSwitcher lang={lang} variant="stacked" />
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-sm border border-line-300 bg-paper-100 p-4">
          <p className="text-xs leading-relaxed text-stone-500">
            <span className="font-medium text-stone-600">{dict.footer.noteTitle}: </span>
            {dict.footer.note}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line-200 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
