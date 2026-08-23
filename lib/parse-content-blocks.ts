// Splits sanitized Tiptap HTML (paragraphs, headings, lists, blockquotes, images) into
// an ordered sequence of typed blocks, then pairs each run of text with the image that
// follows it. This is what lets a single free-form document ("Word page") be arranged
// by a layout — the layout never sees raw HTML, only "text" and "image" blocks.

export type ContentBlock =
  | { type: "text"; html: string }
  | { type: "image"; src: string; alt: string };

export type ContentUnit = {
  id: string;
  textHtml: string;
  image?: { src: string; alt: string };
};

const TOP_LEVEL_RE = /<img\b[^>]*\/?>|<(p|h3|ul|ol|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi;

export function parseContentBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const matches = html.match(TOP_LEVEL_RE) ?? [];
  for (const raw of matches) {
    if (/^<img\b/i.test(raw)) {
      const srcMatch = raw.match(/\ssrc="([^"]*)"/i);
      const altMatch = raw.match(/\salt="([^"]*)"/i);
      if (srcMatch?.[1]) {
        blocks.push({ type: "image", src: srcMatch[1], alt: altMatch?.[1] ?? "" });
      }
    } else if (raw.trim()) {
      blocks.push({ type: "text", html: raw });
    }
  }
  return blocks;
}

/** Groups blocks into layout-ready units: each unit is the text that precedes an image,
 * paired with that image. Trailing text with no following image becomes a text-only unit.
 * A new H3 heading also starts a new unit — without this, a document with few or no images
 * (e.g. a migrated Studio/Services page, several H3 sections back to back) would collapse
 * into one giant unit, and layout choice would have no visible effect since most layouts
 * only differentiate how *multiple* units are arranged. */
export function pairContentBlocks(blocks: ContentBlock[]): ContentUnit[] {
  const units: ContentUnit[] = [];
  let pendingText: string[] = [];
  let index = 0;

  const flush = (image?: { src: string; alt: string }) => {
    if (pendingText.length === 0 && !image) return;
    units.push({ id: `block-${index++}`, textHtml: pendingText.join(""), image });
    pendingText = [];
  };

  for (const block of blocks) {
    if (block.type === "image") {
      flush({ src: block.src, alt: block.alt });
    } else {
      if (/^<h3\b/i.test(block.html) && pendingText.length > 0) {
        flush();
      }
      pendingText.push(block.html);
    }
  }
  flush();

  return units;
}

// H3 headings double as in-page navigation anchors: each one becomes an entry in the
// burger-menu submenu for the page it belongs to. extractHeadingSections and
// injectHeadingIds share the same id-computation so nav links and rendered anchors
// never drift apart.

export type HeadingSection = { id: string; label: string };

const H3_RE = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;

/** Decodes the small set of entities data-manager.ts's escapeHtml() can produce, so heading
 * labels display as plain text (e.g. "Sub-Contracting & Outsourcing", not "...&amp;..."). */
function decodeEntities(text: string): string {
  return text.replace(/&amp;|&lt;|&gt;/g, (m) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">" }[m]!));
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "section"
  );
}

function computeIds(html: string): HeadingSection[] {
  const seen = new Map<string, number>();
  const out: HeadingSection[] = [];
  for (const match of html.matchAll(H3_RE)) {
    const label = decodeEntities(match[1].replace(/<[^>]+>/g, "").trim());
    if (!label) continue;
    const base = slugify(label);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.push({ label, id: count === 0 ? base : `${base}-${count + 1}` });
  }
  return out;
}

/** Extracts {id,label} for every <h3> in document order, deduping id collisions. */
export function extractHeadingSections(html: string): HeadingSection[] {
  return computeIds(html);
}

/** Injects id="<slug>" into each <h3> tag using the identical id computation as
 * extractHeadingSections, so anchors always match the nav links pointing at them. */
export function injectHeadingIds(html: string): string {
  const ids = computeIds(html);
  let i = 0;
  return html.replace(H3_RE, (full) => {
    const next = ids[i++];
    return next ? full.replace(/^<h3\b/i, `<h3 id="${next.id}"`) : full;
  });
}
