"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const copy = {
  de: {
    code: "404",
    title: "Seite nicht gefunden",
    body: "Die angeforderte Seite existiert nicht oder wurde verschoben.",
    home: "Zur Startseite",
    contact: "Kontakt aufnehmen",
  },
  en: {
    code: "404",
    title: "Page not found",
    body: "The page you requested does not exist or has been moved.",
    home: "Back to home",
    contact: "Get in touch",
  },
} as const;

export default function NotFound() {
  const pathname = usePathname() ?? "";
  const lang = pathname.split("/")[1] === "de" ? "de" : "en";
  const t = copy[lang];
  return (
    <section className="mx-auto max-w-7xl px-6 pt-36 pb-28 lg:px-10 lg:pt-44 lg:pb-32">
      <p className="text-sm tracking-[0.2em] text-stone-600">{t.code}</p>
      <h1 className="mt-4 font-heading text-4xl leading-tight text-ink sm:text-5xl">{t.title}</h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">{t.body}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/${lang}`}
          className="border border-graphite-800 bg-graphite-800 px-6 py-3 text-sm text-paper-100 transition-colors duration-200 hover:bg-transparent hover:text-ink"
        >
          {t.home}
        </Link>
        <Link
          href={`/${lang}/connect`}
          className="border border-line-300 px-6 py-3 text-sm text-ink transition-colors duration-200 hover:border-graphite-800"
        >
          {t.contact}
        </Link>
      </div>
    </section>
  );
}
