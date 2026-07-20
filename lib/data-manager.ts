import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface CategoryItem {
  id: string;
  translations: Record<AdminLocale, string>;
}

export interface CategoryGroup {
  id: string;
  translations: Record<AdminLocale, string>;
  categories: CategoryItem[];
}

export interface CategoriesData {
  groups: CategoryGroup[];
}

export type AdminLocale = "en" | "de" | "ar";

export interface ProjectTranslation {
  name: string;
  location: string;
  status: string;
  servicesProvided: string[];
  description: string;
  client: string;
  buildingType: string;
  area: string;
  scope: string;
  summary: string;
  challenge: string;
  approach: string;
  process: string;
  drawings: string;
  materials: string;
  visualization: string;
}

export interface ProjectRecord {
  slug: string;
  year: string;
  categories: string[];
  image: string;
  galleryImages: string[];
  font?: string;
  translations: Record<AdminLocale, ProjectTranslation>;
}

export interface GalleryRecord {
  id: string;
  image: string;
  translations: Record<AdminLocale, { title: string; category: string }>;
}

export interface TeamRecord {
  id: string;
  initials: string;
  image?: string;
  translations: Record<AdminLocale, { name: string; role: string; bio: string; tags: string[] }>;
}

const DATA_DIR = join(process.cwd(), "data");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function readJsonSync<T>(filename: string): T | null {
  const fp = join(DATA_DIR, filename);
  if (!existsSync(fp)) return null;
  try {
    return JSON.parse(readFileSync(fp, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function writeJsonSync(filename: string, data: unknown): void {
  ensureDir();
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

async function initProjects(): Promise<ProjectRecord[]> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  return enMod.portfolio.projects.map((p) => {
    const de = deMod.portfolio.projects.find((d) => d.slug === p.slug) ?? p;
    const ar = arMod.portfolio.projects.find((a) => a.slug === p.slug) ?? p;
    const { slug, year, categories, image, galleryImages, ...enT } = p;
    const { slug: _d1, year: _d2, categories: _d3, image: _d4, galleryImages: _d5, ...deT } = de;
    const { slug: _a1, year: _a2, categories: _a3, image: _a4, galleryImages: _a5, ...arT } = ar;
    return {
      slug,
      year,
      categories,
      image,
      galleryImages,
      translations: {
        en: enT as ProjectTranslation,
        de: deT as ProjectTranslation,
        ar: arT as ProjectTranslation,
      },
    };
  });
}

async function initGallery(): Promise<GalleryRecord[]> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  return enMod.galleryPage.items.map((item, i) => {
    const de = deMod.galleryPage.items[i] ?? item;
    const ar = arMod.galleryPage.items[i] ?? item;
    return {
      id: item.image.split("/").pop()?.replace(".jpg", "") ?? String(i),
      image: item.image,
      translations: {
        en: { title: item.title, category: item.category },
        de: { title: de.title, category: de.category },
        ar: { title: ar.title, category: ar.category },
      },
    };
  });
}

async function initTeam(): Promise<TeamRecord[]> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  return enMod.team.members.map((member, i) => {
    const de = deMod.team.members[i] ?? member;
    const ar = arMod.team.members[i] ?? member;
    return {
      id: `${member.initials.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      initials: member.initials,
      translations: {
        en: { name: member.name, role: member.role, bio: member.bio, tags: member.tags },
        de: { name: de.name, role: de.role, bio: de.bio, tags: de.tags },
        ar: { name: ar.name, role: ar.role, bio: ar.bio, tags: ar.tags },
      },
    };
  });
}

export async function getProjects(): Promise<ProjectRecord[]> {
  const cached = readJsonSync<ProjectRecord[]>("projects.json");
  if (cached) return cached;
  const initial = await initProjects();
  writeJsonSync("projects.json", initial);
  return initial;
}

export async function getGallery(): Promise<GalleryRecord[]> {
  const cached = readJsonSync<GalleryRecord[]>("gallery.json");
  if (cached) return cached;
  const initial = await initGallery();
  writeJsonSync("gallery.json", initial);
  return initial;
}

export async function getTeam(): Promise<TeamRecord[]> {
  const cached = readJsonSync<TeamRecord[]>("team.json");
  if (cached) return cached;
  const initial = await initTeam();
  writeJsonSync("team.json", initial);
  return initial;
}

export function saveProjects(projects: ProjectRecord[]): void {
  writeJsonSync("projects.json", projects);
}

export function saveGallery(gallery: GalleryRecord[]): void {
  writeJsonSync("gallery.json", gallery);
}

export function saveTeam(team: TeamRecord[]): void {
  writeJsonSync("team.json", team);
}

export function getCategories(): CategoriesData {
  return readJsonSync<CategoriesData>("categories.json") ?? { groups: [] };
}

export function saveCategories(data: CategoriesData): void {
  writeJsonSync("categories.json", data);
}

export interface NavLabels {
  en: string;
  de: string;
  ar: string;
}

export interface NavItem {
  id: string;
  href: string;
  labels: NavLabels;
  visible: boolean;
  custom: boolean;
}

export interface NavigationData {
  items: NavItem[];
}

const DEFAULT_NAV: NavigationData = {
  items: [
    { id: "studio", href: "/studio", labels: { en: "Studio", de: "Studio", ar: "ستوديو" }, visible: true, custom: false },
    { id: "services", href: "/services", labels: { en: "Services", de: "Leistungen", ar: "الخدمات" }, visible: true, custom: false },
    { id: "portfolio", href: "/portfolio", labels: { en: "Portfolio", de: "Portfolio", ar: "أعمالنا" }, visible: true, custom: false },
    { id: "team", href: "/team", labels: { en: "Our Team", de: "Unser Team", ar: "فريقنا" }, visible: true, custom: false },
    { id: "connect", href: "/connect", labels: { en: "Connect", de: "Kontakt", ar: "تواصل" }, visible: true, custom: false },
  ],
};

function migrateNavItem(raw: Record<string, unknown>): NavItem {
  if (raw.labels && typeof raw.labels === "object") return raw as unknown as NavItem;
  const label = (raw.label as string) ?? "";
  return {
    id: raw.id as string,
    href: raw.href as string,
    labels: { en: label, de: label, ar: label },
    visible: raw.visible as boolean ?? true,
    custom: raw.custom as boolean ?? true,
  };
}

export function getNavigation(): NavigationData {
  const stored = readJsonSync<{ items: Record<string, unknown>[] }>("navigation.json");
  if (!stored) return DEFAULT_NAV;
  return { items: stored.items.map(migrateNavItem) };
}

export function saveNavigation(data: NavigationData): void {
  writeJsonSync("navigation.json", data);
}

export interface LandingVideo {
  id: string;
  url: string;
  title: string;
}

export interface LandingData {
  headline: string;
  subline: string;
  loop: boolean;
  videos: LandingVideo[];
}

const DEFAULT_LANDING: LandingData = {
  headline: "GrayArc",
  subline: "Architecture. Heritage. Vision.",
  loop: true,
  videos: [
    { id: "1", url: "", title: "Video 1" },
    { id: "2", url: "", title: "Video 2" },
    { id: "3", url: "", title: "Video 3" },
  ],
};

export function getLanding(): LandingData {
  return readJsonSync<LandingData>("landing.json") ?? DEFAULT_LANDING;
}

export function saveLanding(data: LandingData): void {
  writeJsonSync("landing.json", data);
}
