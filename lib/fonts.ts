/**
 * Site-wide typography: the font list shown in Admin → Typografie and the helpers
 * that turn a font name into a Google Fonts stylesheet URL.
 *
 * The chosen font is stored in the database (see lib/typography.ts) and rendered
 * server-side by app/[lang]/layout.tsx, so it applies to every visitor and every
 * page (header, footer, landing page, all subpages) — not only to the browser of
 * the admin who picked it.
 */

export type FontEntry = { name: string; category: string };

export const FONTS: FontEntry[] = [
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

export const FONT_CATEGORIES = ["All", "Geometric", "Humanist", "Condensed", "Serif", "Mono"];

export function isKnownFont(name: string): boolean {
  return FONTS.some((f) => f.name === name);
}

const BASE = "https://fonts.googleapis.com/css2";

/**
 * Candidate stylesheet URLs, richest first. Google's CSS2 API answers 400 when a
 * requested weight/style doesn't exist for a family (e.g. Bebas Neue only has 400),
 * so the server tries these in order and stores the first one that works.
 */
export function fontStylesheetCandidates(name: string): string[] {
  const family = encodeURIComponent(name).replace(/%20/g, "+");
  return [
    `${BASE}?family=${family}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`,
    `${BASE}?family=${family}:wght@300;400;500;600;700&display=swap`,
    `${BASE}?family=${family}:wght@400;700&display=swap`,
    `${BASE}?family=${family}&display=swap`,
  ];
}
