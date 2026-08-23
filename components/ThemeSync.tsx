"use client";

import { useLayoutEffect } from "react";

/** Keeps the <html> "dark" class in sync with the stored preference on every
 * render — not just on mount. A raw <script> (even via next/script) gets
 * re-encountered by React whenever this layout re-renders (e.g. switching
 * [lang] triggers a re-render of the root layout), which both logs a console
 * warning and can leave the class stripped until something else happens to
 * re-apply it. Running this on every commit via useLayoutEffect (no
 * dependency array) self-heals immediately, before the browser paints. */
export default function ThemeSync() {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const dark = stored ? stored === "dark" : true;
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // localStorage unavailable — leave the default appearance as-is.
    }
  });

  return null;
}
