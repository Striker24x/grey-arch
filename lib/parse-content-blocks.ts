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
 * paired with that image. Trailing text with no following image becomes a text-only unit. */
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
      pendingText.push(block.html);
    }
  }
  flush();

  return units;
}
