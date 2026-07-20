"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AdminLang  = "de" | "en" | "ar";
export type AdminTheme = "light" | "dark";

interface AdminLangCtx {
  lang:     AdminLang;
  setLang:  (l: AdminLang)  => void;
  theme:    AdminTheme;
  setTheme: (t: AdminTheme) => void;
}

const Ctx = createContext<AdminLangCtx>({
  lang: "de", setLang: () => {},
  theme: "light", setTheme: () => {},
});

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang,  setLangState]  = useState<AdminLang>("de");
  const [theme, setThemeState] = useState<AdminTheme>("light");

  useEffect(() => {
    const storedLang = localStorage.getItem("admin-lang") as AdminLang | null;
    if (storedLang === "de" || storedLang === "en" || storedLang === "ar") setLangState(storedLang);

    const storedTheme = localStorage.getItem("admin-theme") as AdminTheme | null;
    if (storedTheme === "dark" || storedTheme === "light") setThemeState(storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function setLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem("admin-lang", l);
  }

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    localStorage.setItem("admin-theme", t);
  }

  return <Ctx.Provider value={{ lang, setLang, theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useAdminLang = () => useContext(Ctx);
