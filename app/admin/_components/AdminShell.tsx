"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ArchMark from "@/components/ArchMark";
import { AdminLangProvider, useAdminLang, type AdminLang } from "./AdminLangContext";
import { getAdminT } from "./adminI18n";

const NAV_KEYS = [
  { href: "/admin",            icon: "⊞", key: "dashboard"  },
  { href: "/admin/projects",   icon: "◫", key: "projects"   },
  { href: "/admin/categories", icon: "⊟", key: "categories" },
  { href: "/admin/gallery",    icon: "▦", key: "gallery"    },
  { href: "/admin/team",       icon: "◑", key: "team"       },
  { href: "/admin/landing",    icon: "▶", key: "landing"    },
  { href: "/admin/navigation", icon: "☰", key: "navigation" },
  { href: "/admin/appearance", icon: "Aa", key: "typography"},
] as const;

const LANGS: { key: AdminLang; label: string }[] = [
  { key: "de", label: "DE" },
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4"  />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { lang, setLang, theme, setTheme } = useAdminLang();
  const T   = getAdminT(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isDark = theme === "dark";

  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-paper-50" dir={dir}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-30 flex w-56 flex-col border-stone-200 bg-white dark:border-line-200 dark:bg-paper-100 ${
          dir === "rtl" ? "right-0 border-l" : "left-0 border-r"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 items-center gap-2 border-b border-stone-200 px-4 dark:border-line-200">
          <ArchMark className="h-6 w-7 text-graphite-900" />
          <span className="text-sm font-semibold tracking-wide text-graphite-900">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_KEYS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const label = T.nav[item.key as keyof typeof T.nav];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-stone-100 font-medium text-graphite-900 dark:bg-paper-300 dark:text-graphite-900"
                    : "text-stone-500 hover:bg-stone-50 hover:text-graphite-900 dark:text-stone-500 dark:hover:bg-paper-200 dark:hover:text-graphite-900"
                }`}
              >
                <span className="w-4 text-center text-base leading-none">{item.icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="border-t border-stone-200 p-3 space-y-1 dark:border-line-200">
          {/* Theme + language row */}
          <div className="flex items-center justify-between px-3 py-2">
            {/* Dark/Light toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Hellmodus" : "Dunkelmodus"}
              className="flex h-7 w-7 items-center justify-center rounded text-stone-500 transition-colors hover:bg-stone-100 hover:text-graphite-900 dark:text-stone-500 dark:hover:bg-paper-300 dark:hover:text-graphite-900"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Language buttons */}
            <div className="flex items-center gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLang(l.key)}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                    lang === l.key
                      ? "bg-graphite-900 text-white dark:bg-graphite-900 dark:text-paper-100"
                      : "text-stone-500 hover:bg-stone-100 hover:text-graphite-900 dark:text-stone-500 dark:hover:bg-paper-300 dark:hover:text-graphite-900"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-graphite-900 disabled:opacity-50 dark:text-stone-500 dark:hover:bg-paper-200 dark:hover:text-graphite-900"
          >
            <span className="w-4 text-center">→</span>
            {loggingOut ? T.loggingOut : T.logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 min-h-screen bg-stone-50 dark:bg-paper-50 ${dir === "rtl" ? "mr-56" : "ml-56"}`}>
        {children}
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminLangProvider>
      <Shell>{children}</Shell>
    </AdminLangProvider>
  );
}
