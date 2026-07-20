"use client";

import { useEffect, type ReactNode } from "react";

export default function ProjectFontProvider({
  font,
  children,
}: {
  font?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!font) return;
    const id = "project-font-link";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const family = font.replace(/ /g, "+");
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`;
    document.head.appendChild(link);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [font]);

  if (!font) return <>{children}</>;

  return (
    <div style={{ fontFamily: `"${font}", var(--font-body, sans-serif)` }}>
      {children}
    </div>
  );
}
