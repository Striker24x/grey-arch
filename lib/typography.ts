import "server-only";
import { readJsonSync, writeJsonSync } from "./data-manager";
import { fontStylesheetCandidates, isKnownFont } from "./fonts";

/**
 * Global site font (Admin → Typografie). `font: null` = original design
 * (Inter for text + DM Serif Display for headings).
 */
export interface TypographySettings {
  font: string | null;
  /** Verified Google Fonts stylesheet URL for `font`. */
  cssUrl: string | null;
}

const KEY = "typography";
const DEFAULT: TypographySettings = { font: null, cssUrl: null };

export async function getTypography(): Promise<TypographySettings> {
  try {
    const stored = await readJsonSync<TypographySettings>(KEY);
    if (!stored?.font || !stored.cssUrl || !isKnownFont(stored.font)) return DEFAULT;
    return stored;
  } catch (err) {
    // Never break page rendering because of the font setting.
    console.error("[typography] read failed:", err);
    return DEFAULT;
  }
}

/** Finds a stylesheet URL Google Fonts actually serves for this family. */
async function resolveStylesheet(font: string): Promise<string> {
  for (const url of fontStylesheetCandidates(font)) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          // Modern UA so Google returns the woff2 variant (same as real visitors).
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
        },
      });
      if (res.ok && (await res.text()).includes("@font-face")) return url;
    } catch {
      // try the next candidate
    }
  }
  throw new Error(`Google Fonts liefert keine Datei für „${font}“`);
}

export async function saveTypography(font: string | null): Promise<TypographySettings> {
  if (font === null) {
    await writeJsonSync(KEY, DEFAULT);
    return DEFAULT;
  }
  if (!isKnownFont(font)) throw new Error(`Unbekannte Schriftart: ${font}`);
  const settings: TypographySettings = { font, cssUrl: await resolveStylesheet(font) };
  await writeJsonSync(KEY, settings);
  return settings;
}

/** CSS custom properties for <html>: body text + display headings use the chosen font. */
export function typographyStyle(t: TypographySettings): Record<string, string> | undefined {
  if (!t.font) return undefined;
  const family = `"${t.font.replace(/"/g, "")}"`;
  return { "--font-body": family, "--font-display": family };
}
