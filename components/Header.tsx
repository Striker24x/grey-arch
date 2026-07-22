"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import ArchMark from "./ArchMark";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import PizzaWheel, { type PizzaSection } from "./PizzaWheel";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary-types";
import type { NavItem } from "@/lib/data-manager";

// Returns pizza slices for a given nav item id — empty = no wheel
function getNavSections(navId: string, lang: string, dict: Dictionary): PizzaSection[] {
  const base = `/${lang}`;
  switch (navId) {
    case "studio":
      return [
        { label: dict.studio.history.title, href: `${base}/studio#about` },
        { label: dict.studio.approach.title, href: `${base}/studio#approach` },
        { label: dict.studio.values.title, href: `${base}/studio#values` },
      ];
    case "services":
      return dict.servicesPage.groups.map((g) => ({
        label: g.title,
        href: `${base}/services#${g.id}`,
      }));
    case "overview":
      return [
        { label: dict.home.selectedProjects.eyebrow, href: `${base}/overview#projects` },
        { label: dict.home.services.eyebrow, href: `${base}/overview#services` },
        { label: dict.home.philosophy.eyebrow, href: `${base}/overview#philosophy` },
        { label: dict.home.process.title, href: `${base}/overview#process` },
      ];
    default:
      return [];
  }
}

export default function Header({
  lang,
  dict,
  navConfig,
}: {
  lang: Locale;
  dict: Dictionary;
  navConfig: NavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [wheelY, setWheelY] = useState(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navItemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const navItems = navConfig
    .filter((item) => item.visible)
    .map((item) => ({
      id: item.id,
      href: `/${lang}${item.href}`,
      label: item.labels[lang as keyof typeof item.labels] ?? item.labels.en,
    }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const showWheel = useCallback((id: string, label: string, el: HTMLElement | null) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (el) {
      const rect = el.getBoundingClientRect();
      setWheelY(rect.top + rect.height / 2);
    }
    setHoveredNavId(id);
    setHoveredLabel(label);
  }, []);

  const scheduleHideWheel = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setHoveredNavId(null), 280);
  }, []);

  const cancelHideWheel = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setHoveredNavId(null);
  }, [pathname]);

  const pizzaSections = hoveredNavId ? getNavSections(hoveredNavId, lang, dict) : [];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
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
            className="relative z-[60] flex cursor-pointer flex-col items-center justify-center gap-[5px] p-3"
          >
            <span className={`block h-0.5 w-7 bg-ink transition-all duration-200 ease-in-out ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-7 bg-ink transition-all duration-200 ease-in-out ${open ? "scale-x-0 opacity-0" : ""}`} />
            <span className={`block h-0.5 w-7 bg-ink transition-all duration-200 ease-in-out ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
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

            {/* Pizza Wheel — desktop only, Y-aligned with the hovered nav item */}
            <AnimatePresence mode="wait">
              {hoveredNavId && pizzaSections.length > 0 && (
                <motion.div
                  key={hoveredNavId}
                  className="fixed z-[48] hidden lg:flex items-center justify-center pointer-events-none"
                  style={{
                    // Right edge of wheel sits 16px left of the panel's left edge (panel = max-w-sm = 24rem)
                    right: "calc(min(100vw, 24rem) + 16px)",
                    top: `${wheelY}px`,
                    transform: "translateY(-50%)",
                    width: "260px",
                    height: "260px",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <div
                    className="pointer-events-auto"
                    onMouseEnter={cancelHideWheel}
                    onMouseLeave={scheduleHideWheel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PizzaWheel
                      sections={pizzaSections}
                      onNavigate={() => { setOpen(false); setHoveredNavId(null); }}
                      centerLabel={hoveredLabel}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                {navItems.map((item, index) => {
                  const hasSections = getNavSections(item.id, lang, dict).length > 0;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 + 0.05, duration: 0.18, ease: "easeOut" }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        ref={(el) => {
                          if (el) navItemRefs.current.set(item.id, el);
                          else navItemRefs.current.delete(item.id);
                        }}
                        onMouseEnter={() => {
                          const el = navItemRefs.current.get(item.id) ?? null;
                          hasSections
                            ? showWheel(item.id, item.label, el)
                            : scheduleHideWheel();
                        }}
                        onMouseLeave={scheduleHideWheel}
                        className={`group flex items-center justify-between border-b border-line-200 py-4 font-heading text-2xl transition-colors duration-200 ${
                          isActive(item.href) ? "text-ink" : "text-stone-400 hover:text-ink"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="flex items-center gap-2">
                          {hasSections && (
                            <span
                              className={`hidden lg:block h-1 w-1 rounded-full transition-all duration-200 ${
                                hoveredNavId === item.id ? "bg-bronze-500 scale-150" : "bg-stone-300"
                              }`}
                            />
                          )}
                          {isActive(item.href) && (
                            <span className="h-2.5 w-2.5 rounded-full bg-bronze-500" />
                          )}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
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
