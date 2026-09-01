// Registry of visual layout styles selectable per service category in the
// admin dashboard and rendered on the public /services page. Shared (no React)
// so it can be imported from both server data code and client admin UI.

export const SERVICE_LAYOUT_IDS = [
  "editorial-asymmetric",
  "broken-grid",
  "staggered",
  "alternating-offset",
  "swiss-editorial",
  "gallery",
  "floating",
  "masonry",
  "deconstructed",
  "scrollytelling",
  "centered-stack",
] as const;

export type ServiceLayoutId = (typeof SERVICE_LAYOUT_IDS)[number];

export const DEFAULT_SERVICE_LAYOUT: ServiceLayoutId = "editorial-asymmetric";

export function isServiceLayoutId(value: unknown): value is ServiceLayoutId {
  return typeof value === "string" && (SERVICE_LAYOUT_IDS as readonly string[]).includes(value);
}

/** Always returns a valid, known layout id — used as the single fallback path. */
export function resolveServiceLayout(value: unknown): ServiceLayoutId {
  return isServiceLayoutId(value) ? value : DEFAULT_SERVICE_LAYOUT;
}

export interface ServiceLayoutMeta {
  id: ServiceLayoutId;
  label: string;
  description: string;
}

export const SERVICE_LAYOUT_META: Record<ServiceLayoutId, ServiceLayoutMeta> = {
  "editorial-asymmetric": {
    id: "editorial-asymmetric",
    label: "Editorial Asymmetric",
    description: "Generous whitespace, text left, large offset imagery — architecture-editorial feel.",
  },
  "broken-grid": {
    id: "broken-grid",
    label: "Broken Grid",
    description: "Elements deliberately break the classic grid with uneven widths and offsets.",
  },
  staggered: {
    id: "staggered",
    label: "Staggered",
    description: "Text and image pairs step diagonally down the page.",
  },
  "alternating-offset": {
    id: "alternating-offset",
    label: "Alternating Offset",
    description: "Alternating text/image pairs with varied widths and vertical offsets — not a plain 50/50 split.",
  },
  "swiss-editorial": {
    id: "swiss-editorial",
    label: "Swiss Editorial",
    description: "Strong invisible grid, large type, precise alignment, minimal and confident.",
  },
  gallery: {
    id: "gallery",
    label: "Gallery",
    description: "Museum-like composition — one large image, one small detail image, lots of air.",
  },
  floating: {
    id: "floating",
    label: "Floating",
    description: "Elements feel like they float freely in space on an invisible responsive grid.",
  },
  masonry: {
    id: "masonry",
    label: "Editorial Masonry",
    description: "Mixed block sizes, structured and editorial rather than a Pinterest-style grid.",
  },
  deconstructed: {
    id: "deconstructed",
    label: "Deconstructed",
    description: "Experimental, deliberately irregular, heavy use of whitespace.",
  },
  scrollytelling: {
    id: "scrollytelling",
    label: "Scrollytelling",
    description: "Hero image opens the story, each block gets its own composition as you scroll.",
  },
  "centered-stack": {
    id: "centered-stack",
    label: "Text/Image Split",
    description: "Text left-aligned and stacked in one column, imagery grouped beside it in the other — both columns scroll together.",
  },
};

export const SERVICE_LAYOUT_LIST: ServiceLayoutMeta[] = SERVICE_LAYOUT_IDS.map((id) => SERVICE_LAYOUT_META[id]);
