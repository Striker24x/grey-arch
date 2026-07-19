"use client";

import { useEffect } from "react";

export function applyFont(fontName: string, save = true) {
  const family = fontName.replace(/ /g, "+");

  const existing = document.getElementById("site-font-link");
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.id = "site-font-link";
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`;
  document.head.appendChild(link);

  document.documentElement.style.setProperty("--font-body", `"${fontName}"`);

  if (save) localStorage.setItem("site-font", fontName);
}

export default function FontProvider() {
  useEffect(() => {
    const stored = localStorage.getItem("site-font");
    if (stored) applyFont(stored, false);
  }, []);

  return null;
}
