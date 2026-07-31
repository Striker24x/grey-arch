import { getDb } from "./mongodb";

// ---------------------------------------------------------------------------
// Internal storage helpers
// ---------------------------------------------------------------------------

interface SiteDataDoc {
  _id: string;
  value: unknown;
}

function normalizeKey(filename: string) {
  return filename.replace(/\.json$/, "");
}

export async function readJsonSync<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const doc = await db.collection<SiteDataDoc>("site_data").findOne({ _id: normalizeKey(key) });
  return (doc?.value as T) ?? null;
}

export async function writeJsonSync(key: string, data: unknown): Promise<void> {
  const db = await getDb();
  await db
    .collection<SiteDataDoc>("site_data")
    .updateOne({ _id: normalizeKey(key) }, { $set: { value: data } }, { upsert: true });
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type AdminLocale = "en" | "de" | "ar";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

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

export async function getCategories(): Promise<CategoriesData> {
  return (await readJsonSync<CategoriesData>("categories.json")) ?? { groups: [] };
}

export async function saveCategories(data: CategoriesData): Promise<void> {
  await writeJsonSync("categories.json", data);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

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

export async function getProjects(): Promise<ProjectRecord[]> {
  const cached = await readJsonSync<ProjectRecord[]>("projects.json");
  if (cached) return cached;
  const initial = await initProjects();
  await writeJsonSync("projects.json", initial);
  return initial;
}

export async function saveProjects(projects: ProjectRecord[]): Promise<void> {
  await writeJsonSync("projects.json", projects);
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export interface GalleryRecord {
  id: string;
  image: string;
  translations: Record<AdminLocale, { title: string; category: string }>;
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

export async function getGallery(): Promise<GalleryRecord[]> {
  const cached = await readJsonSync<GalleryRecord[]>("gallery.json");
  if (cached) return cached;
  const initial = await initGallery();
  await writeJsonSync("gallery.json", initial);
  return initial;
}

export async function saveGallery(gallery: GalleryRecord[]): Promise<void> {
  await writeJsonSync("gallery.json", gallery);
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface TeamRecord {
  id: string;
  initials: string;
  image?: string;
  translations: Record<AdminLocale, { name: string; role: string; bio: string; tags: string[] }>;
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

export async function getTeam(): Promise<TeamRecord[]> {
  const cached = await readJsonSync<TeamRecord[]>("team.json");
  if (cached) return cached;
  const initial = await initTeam();
  await writeJsonSync("team.json", initial);
  return initial;
}

export async function saveTeam(team: TeamRecord[]): Promise<void> {
  await writeJsonSync("team.json", team);
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

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
    { id: "studio",    href: "/studio",    labels: { en: "Studio",    de: "Studio",      ar: "ستوديو"   }, visible: true, custom: false },
    { id: "services",  href: "/services",  labels: { en: "Services",  de: "Leistungen",  ar: "الخدمات"  }, visible: true, custom: false },
    { id: "portfolio", href: "/portfolio", labels: { en: "Portfolio", de: "Portfolio",   ar: "أعمالنا"  }, visible: true, custom: false },
    { id: "team",      href: "/team",      labels: { en: "Our Team",  de: "Unser Team",  ar: "فريقنا"   }, visible: true, custom: false },
    { id: "connect",   href: "/connect",   labels: { en: "Connect",   de: "Kontakt",     ar: "تواصل"    }, visible: true, custom: false },
  ],
};

function migrateNavItem(raw: Record<string, unknown>): NavItem {
  if (raw.labels && typeof raw.labels === "object") return raw as unknown as NavItem;
  const label = (raw.label as string) ?? "";
  return {
    id: raw.id as string,
    href: raw.href as string,
    labels: { en: label, de: label, ar: label },
    visible: (raw.visible as boolean) ?? true,
    custom: (raw.custom as boolean) ?? true,
  };
}

export async function getNavigation(): Promise<NavigationData> {
  const stored = await readJsonSync<{ items: Record<string, unknown>[] }>("navigation.json");
  if (!stored) return DEFAULT_NAV;
  return { items: stored.items.map(migrateNavItem) };
}

export async function saveNavigation(data: NavigationData): Promise<void> {
  await writeJsonSync("navigation.json", data);
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

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

export async function getLanding(): Promise<LandingData> {
  return (await readJsonSync<LandingData>("landing.json")) ?? DEFAULT_LANDING;
}

export async function saveLanding(data: LandingData): Promise<void> {
  await writeJsonSync("landing.json", data);
}

// ---------------------------------------------------------------------------
// Studio
// ---------------------------------------------------------------------------

export interface StudioStep {
  title: string;
  description: string;
}

export interface StudioValue {
  title: string;
  description: string;
}

export interface StudioTranslation {
  title: string;
  intro: string;
  historyTitle: string;
  historyBody: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  approachTitle: string;
  approachBody: string;
  approachSteps: StudioStep[];
  valuesTitle: string;
  valuesItems: StudioValue[];
}

export interface StudioData {
  workspaceImage?: string;
  translations: Record<AdminLocale, StudioTranslation>;
}

async function initStudio(): Promise<StudioData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): StudioTranslation {
    const s = dict.studio;
    return {
      title: s.title,
      intro: s.intro,
      historyTitle: s.history.title,
      historyBody: s.history.body,
      missionTitle: s.mission.title,
      missionBody: s.mission.body,
      visionTitle: s.vision.title,
      visionBody: s.vision.body,
      approachTitle: s.approach.title,
      approachBody: s.approach.body,
      approachSteps: s.approach.steps.map((st) => ({ title: st.title, description: st.description })),
      valuesTitle: s.values.title,
      valuesItems: s.values.items.map((v) => ({ title: v.title, description: v.description })),
    };
  }
  return {
    translations: {
      en: mapLocale(enMod),
      de: mapLocale(deMod),
      ar: mapLocale(arMod),
    },
  };
}

export async function getStudio(): Promise<StudioData> {
  const cached = await readJsonSync<StudioData>("studio.json");
  if (cached) return cached;
  const initial = await initStudio();
  await writeJsonSync("studio.json", initial);
  return initial;
}

export async function saveStudio(data: StudioData): Promise<void> {
  await writeJsonSync("studio.json", data);
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export interface ServiceItemData {
  id: string;
  title: string;
  description: string;
  includes?: string;
  deliverables: string[];
  suitableFor: string;
}

export interface ServiceGroupData {
  id: string;
  title: string;
  intro: string;
  services: ServiceItemData[];
}

export interface ServicesTranslation {
  title: string;
  intro: string;
  groups: ServiceGroupData[];
}

export interface ServicesData {
  translations: Record<AdminLocale, ServicesTranslation>;
}

async function initServices(): Promise<ServicesData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): ServicesTranslation {
    const sp = dict.servicesPage;
    return {
      title: sp.title,
      intro: sp.intro,
      groups: sp.groups.map((g) => ({
        id: g.id,
        title: g.title,
        intro: g.intro,
        services: g.services.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          includes: s.includes,
          deliverables: [...s.deliverables],
          suitableFor: s.suitableFor,
        })),
      })),
    };
  }
  return {
    translations: {
      en: mapLocale(enMod),
      de: mapLocale(deMod),
      ar: mapLocale(arMod),
    },
  };
}

export async function getServices(): Promise<ServicesData> {
  const cached = await readJsonSync<ServicesData>("services.json");
  if (cached) return cached;
  const initial = await initServices();
  await writeJsonSync("services.json", initial);
  return initial;
}

export async function saveServices(data: ServicesData): Promise<void> {
  await writeJsonSync("services.json", data);
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export interface ConnectTranslation {
  title: string;
  intro: string;
  ctaStartProject: string;
  ctaRequestConsultation: string;
  ctaSendPlans: string;
  formName: string;
  formEmail: string;
  formPhone: string;
  formPreferredLanguage: string;
  formProjectType: string;
  formProjectTypeOptions: string[];
  formProjectLocation: string;
  formBuildingStatus: string;
  formBuildingStatusOptions: string[];
  formRequiredService: string;
  formProjectSize: string;
  formBudgetRange: string;
  formMessage: string;
  formConsent: string;
  formSubmit: string;
}

export interface ConnectData {
  translations: Record<AdminLocale, ConnectTranslation>;
}

async function initConnect(): Promise<ConnectData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): ConnectTranslation {
    const c = dict.connect;
    return {
      title: c.title,
      intro: c.intro,
      ctaStartProject: c.ctas.startProject,
      ctaRequestConsultation: c.ctas.requestConsultation,
      ctaSendPlans: c.ctas.sendPlans,
      formName: c.form.name,
      formEmail: c.form.email,
      formPhone: c.form.phone,
      formPreferredLanguage: c.form.preferredLanguage,
      formProjectType: c.form.projectType,
      formProjectTypeOptions: [...c.form.projectTypeOptions],
      formProjectLocation: c.form.projectLocation,
      formBuildingStatus: c.form.buildingStatus,
      formBuildingStatusOptions: [...c.form.buildingStatusOptions],
      formRequiredService: c.form.requiredService,
      formProjectSize: c.form.projectSize,
      formBudgetRange: c.form.budgetRange,
      formMessage: c.form.message,
      formConsent: c.form.consent,
      formSubmit: c.form.submit,
    };
  }
  return {
    translations: {
      en: mapLocale(enMod),
      de: mapLocale(deMod),
      ar: mapLocale(arMod),
    },
  };
}

export async function getConnect(): Promise<ConnectData> {
  const cached = await readJsonSync<ConnectData>("connect.json");
  if (cached) return cached;
  const initial = await initConnect();
  await writeJsonSync("connect.json", initial);
  return initial;
}

export async function saveConnect(data: ConnectData): Promise<void> {
  await writeJsonSync("connect.json", data);
}

// ---------------------------------------------------------------------------
// Overview (home page)
// ---------------------------------------------------------------------------

export interface OverviewPoint {
  title: string;
  description: string;
}

export interface OverviewTranslation {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaExplore: string;
  heroCtaPortfolio: string;
  heroCtaStart: string;
  philosophyEyebrow: string;
  philosophyTitle: string;
  philosophyBody: string;
  philosophyPoints: OverviewPoint[];
  processEyebrow: string;
  processTitle: string;
  processIntro: string;
  processSteps: OverviewPoint[];
  heritageEyebrow: string;
  heritageTitle: string;
  heritageBody: string;
  heritagePoints: string[];
  heritageCta: string;
  digitalArchEyebrow: string;
  digitalArchTitle: string;
  digitalArchBody: string;
  digitalArchPoints: string[];
  digitalArchCta: string;
  contactCtaTitle: string;
  contactCtaBody: string;
  contactCtaCta: string;
}

export interface OverviewData {
  translations: Record<AdminLocale, OverviewTranslation>;
}

async function initOverview(): Promise<OverviewData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): OverviewTranslation {
    const h = dict.home;
    return {
      heroEyebrow: h.hero.eyebrow,
      heroHeadline: h.hero.headline,
      heroSubheadline: h.hero.subheadline,
      heroCtaExplore: h.hero.ctaExplore,
      heroCtaPortfolio: h.hero.ctaPortfolio,
      heroCtaStart: h.hero.ctaStart,
      philosophyEyebrow: h.philosophy.eyebrow,
      philosophyTitle: h.philosophy.title,
      philosophyBody: h.philosophy.body,
      philosophyPoints: h.philosophy.points.map((p) => ({ title: p.title, description: p.description })),
      processEyebrow: h.process.eyebrow,
      processTitle: h.process.title,
      processIntro: h.process.intro,
      processSteps: h.process.steps.map((s) => ({ title: s.title, description: s.description })),
      heritageEyebrow: h.heritage.eyebrow,
      heritageTitle: h.heritage.title,
      heritageBody: h.heritage.body,
      heritagePoints: [...h.heritage.points],
      heritageCta: h.heritage.cta,
      digitalArchEyebrow: h.digitalArch.eyebrow,
      digitalArchTitle: h.digitalArch.title,
      digitalArchBody: h.digitalArch.body,
      digitalArchPoints: [...h.digitalArch.points],
      digitalArchCta: h.digitalArch.cta,
      contactCtaTitle: h.contactCta.title,
      contactCtaBody: h.contactCta.body,
      contactCtaCta: h.contactCta.cta,
    };
  }
  return {
    translations: {
      en: mapLocale(enMod),
      de: mapLocale(deMod),
      ar: mapLocale(arMod),
    },
  };
}

export async function getOverview(): Promise<OverviewData> {
  const cached = await readJsonSync<OverviewData>("overview.json");
  if (cached) return cached;
  const initial = await initOverview();
  await writeJsonSync("overview.json", initial);
  return initial;
}

export async function saveOverview(data: OverviewData): Promise<void> {
  await writeJsonSync("overview.json", data);
}
