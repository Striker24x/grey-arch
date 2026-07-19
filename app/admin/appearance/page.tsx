"use client";

import { useState, useEffect } from "react";
import { applyFont } from "@/components/FontProvider";

type FontEntry = { name: string; category: string };

const FONTS: FontEntry[] = [
  // Geometric Sans-Serif
  { name: "Inter", category: "Geometric" },
  { name: "Outfit", category: "Geometric" },
  { name: "DM Sans", category: "Geometric" },
  { name: "Plus Jakarta Sans", category: "Geometric" },
  { name: "Space Grotesk", category: "Geometric" },
  { name: "Jost", category: "Geometric" },
  { name: "Syne", category: "Geometric" },
  { name: "Urbanist", category: "Geometric" },
  { name: "Figtree", category: "Geometric" },
  { name: "Manrope", category: "Geometric" },
  { name: "Epilogue", category: "Geometric" },
  { name: "Albert Sans", category: "Geometric" },
  { name: "Hanken Grotesk", category: "Geometric" },
  { name: "Instrument Sans", category: "Geometric" },
  { name: "Bricolage Grotesque", category: "Geometric" },
  { name: "Archivo", category: "Geometric" },
  { name: "Poppins", category: "Geometric" },
  { name: "Rubik", category: "Geometric" },
  { name: "Encode Sans", category: "Geometric" },
  { name: "Overpass", category: "Geometric" },

  // Humanist Sans-Serif
  { name: "Raleway", category: "Humanist" },
  { name: "Lato", category: "Humanist" },
  { name: "Montserrat", category: "Humanist" },
  { name: "Josefin Sans", category: "Humanist" },
  { name: "Nunito Sans", category: "Humanist" },
  { name: "Work Sans", category: "Humanist" },
  { name: "Barlow", category: "Humanist" },
  { name: "IBM Plex Sans", category: "Humanist" },
  { name: "Source Sans 3", category: "Humanist" },
  { name: "Cabin", category: "Humanist" },
  { name: "Karla", category: "Humanist" },
  { name: "Mulish", category: "Humanist" },
  { name: "Questrial", category: "Humanist" },
  { name: "Lexend", category: "Humanist" },
  { name: "Nunito", category: "Humanist" },
  { name: "Quicksand", category: "Humanist" },
  { name: "Fira Sans", category: "Humanist" },
  { name: "Titillium Web", category: "Humanist" },
  { name: "Exo 2", category: "Humanist" },

  // Condensed / Display
  { name: "Oswald", category: "Condensed" },
  { name: "Bebas Neue", category: "Condensed" },
  { name: "Big Shoulders Display", category: "Condensed" },
  { name: "Antonio", category: "Condensed" },
  { name: "Barlow Condensed", category: "Condensed" },
  { name: "Barlow Semi Condensed", category: "Condensed" },
  { name: "Pathway Gothic One", category: "Condensed" },
  { name: "Squada One", category: "Condensed" },

  // Serif — Editorial
  { name: "Playfair Display", category: "Serif" },
  { name: "Lora", category: "Serif" },
  { name: "Cormorant Garamond", category: "Serif" },
  { name: "Cormorant", category: "Serif" },
  { name: "EB Garamond", category: "Serif" },
  { name: "Libre Baskerville", category: "Serif" },
  { name: "Merriweather", category: "Serif" },
  { name: "PT Serif", category: "Serif" },
  { name: "Crimson Pro", category: "Serif" },
  { name: "Spectral", category: "Serif" },
  { name: "Gloock", category: "Serif" },
  { name: "Fraunces", category: "Serif" },
  { name: "DM Serif Display", category: "Serif" },
  { name: "Libre Caslon Text", category: "Serif" },
  { name: "Cardo", category: "Serif" },
  { name: "Alegreya", category: "Serif" },
  { name: "Bitter", category: "Serif" },
  { name: "Domine", category: "Serif" },
  { name: "Zilla Slab", category: "Serif" },
  { name: "Neuton", category: "Serif" },

  // Monospace — Blueprint / Tech
  { name: "IBM Plex Mono", category: "Mono" },
  { name: "Space Mono", category: "Mono" },
  { name: "Roboto Mono", category: "Mono" },
  { name: "JetBrains Mono", category: "Mono" },
  { name: "DM Mono", category: "Mono" },
  { name: "Courier Prime", category: "Mono" },
  { name: "Fira Mono", category: "Mono" },
  { name: "Source Code Pro", category: "Mono" },
];

const CATEGORIES = ["All", "Geometric", "Humanist", "Condensed", "Serif", "Mono"];

const CATEGORY_COLORS: Record<string, string> = {
  Geometric: "bg-blue-100 text-blue-700",
  Humanist: "bg-green-100 text-green-700",
  Condensed: "bg-purple-100 text-purple-700",
  Serif: "bg-amber-100 text-amber-700",
  Mono: "bg-stone-100 text-stone-700",
};

export default function AppearancePage() {
  const [selected, setSelected] = useState<string>("Inter");
  const [activeCategory, setActiveCategory] = useState("All");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("site-font");
    if (stored) setSelected(stored);

    // Load all preview fonts in batches to avoid URL length issues
    const batches: FontEntry[][] = [];
    for (let i = 0; i < FONTS.length; i += 20) {
      batches.push(FONTS.slice(i, i + 20));
    }
    batches.forEach((batch) => {
      const families = batch
        .map((f) => `family=${f.name.replace(/ /g, "+")}:wght@400;600`)
        .join("&");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
    });
    setFontsLoaded(true);
  }, []);

  function handleSelect(fontName: string) {
    setSelected(fontName);
    applyFont(fontName);
  }

  const visible = activeCategory === "All"
    ? FONTS
    : FONTS.filter((f) => f.category === activeCategory);

  return (
    <div className="p-8">
      <div className="mb-8 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Typography</h1>
        <p className="mt-1 text-sm text-stone-500">
          Schriftart für die gesamte Website auswählen. Die Änderung wird sofort live.
        </p>
        <p className="mt-2 text-xs text-stone-400">
          Aktiv: <span className="font-semibold text-amber-700">{selected}</span>
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-graphite-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Font grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((font) => {
          const isSelected = selected === font.name;
          return (
            <button
              key={font.name}
              onClick={() => handleSelect(font.name)}
              className={`rounded-sm border p-4 text-left transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400"
                  : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-xl font-semibold leading-tight text-graphite-900"
                  style={{ fontFamily: `"${font.name}", sans-serif` }}
                >
                  Grey Arc
                </span>
                {isSelected && (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                    ✓
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-xs text-stone-500"
                style={{ fontFamily: `"${font.name}", sans-serif` }}
              >
                Architecture & Design Studio
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-700">{font.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[font.category]}`}
                >
                  {font.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-stone-400">
        {FONTS.length} Schriftarten · Alle von Google Fonts · Arabisch bleibt unberührt
      </p>
    </div>
  );
}
