"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line-200 bg-paper-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 cursor-pointer text-graphite-900"
            onClick={() => setOpen(false)}
          >
            <ArchMark className="h-8 w-9" />
            <span className="font-heading text-xl tracking-wide">{dict.meta.siteName}</span>
          </Link>

          <button
            type="button"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ touchAction: "manipulation" }}
            className="relative z-[60] flex cursor-pointer flex-col items-center justify-center gap-1.5 p-3"
          >
            <span
              className={`block h-px w-6 bg-ink transition-all duration-150 ease-in-out ${
                open ? "translate-y-[4px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px bg-ink transition-all duration-150 ease-in-out ${
                open ? "w-6 -translate-y-[4px] -rotate-45" : "w-4"
              }`}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-graphite-900/50"
              style={{ touchAction: "manipulation" }}
              onClick={() => setOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              key="menu-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper-100 shadow-soft"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-line-200 px-8 py-5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                  Navigation
                </span>
                <button
                  onClick={() => setOpen(false)}
                  style={{ touchAction: "manipulation" }}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-stone-500 transition-colors hover:text-ink"
                  aria-label="Menü schließen"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-1 flex-col px-8 py-6" aria-label="Main">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.03 + 0.05,
                      duration: 0.18,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between border-b border-line-200 py-4 font-heading text-2xl transition-colors duration-200 ${
                        isActive(item.href)
                          ? "text-ink"
                          : "text-stone-400 hover:text-ink"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive(item.href) && (
                        <span className="h-2.5 w-2.5 rounded-full bg-bronze-500" />
                      )}
                    </Link>
                  </motion.div>
                ))}

              </nav>

              {/* Language + Dark mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.15 }}
                className="flex items-center justify-between border-t border-line-200 px-8 py-6"
              >
                <LanguageSwitcher lang={lang} />
                <DarkModeToggle />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
