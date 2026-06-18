"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArchMark from "./ArchMark";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary-types";

export default function Header({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: `/${lang}/studio`, label: dict.nav.studio },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/portfolio`, label: dict.nav.portfolio },
    { href: `/${lang}/team`, label: dict.nav.team },
    { href: `/${lang}/connect`, label: dict.nav.connect },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line-200 bg-paper-100/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 text-graphite-900 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <ArchMark className="h-7 w-7" />
          <span className="font-heading text-xl tracking-wide">{dict.meta.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative cursor-pointer text-sm transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-[width] after:duration-200 ${
                isActive(item.href)
                  ? "text-ink font-medium after:w-full"
                  : "text-stone-500 hover:text-ink after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <DarkModeToggle />
          <LanguageSwitcher lang={lang} />
          <Link
            href={`/${lang}/connect`}
            className="cursor-pointer border border-graphite-800 px-4 py-2 text-sm text-graphite-900 transition-colors duration-200 hover:bg-graphite-900 hover:text-paper-100"
          >
            {dict.common.startProject}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex cursor-pointer flex-col gap-1.5 p-2 lg:hidden"
        >
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid overflow-hidden border-t border-line-200 transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${index * 40 + 80}ms` : "0ms" }}
                className={`cursor-pointer py-2.5 text-base transition-[color,opacity,transform] duration-200 ${
                  isActive(item.href) ? "text-ink font-medium" : "text-stone-500"
                } ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/connect`}
              onClick={() => setOpen(false)}
              className="cursor-pointer mt-3 border border-graphite-800 px-4 py-2.5 text-center text-sm text-graphite-900"
            >
              {dict.common.startProject}
            </Link>
            <div className="mt-4 flex items-center justify-between border-t border-line-200 pt-4">
              <LanguageSwitcher lang={lang} />
              <DarkModeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
