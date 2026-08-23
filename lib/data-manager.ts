import { getDb } from "./mongodb";
import { resolveServiceLayout, type ServiceLayoutId } from "./service-layouts";

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
  /** Free-form rich text document — the main narrative shown on the project page. */
  body?: string;
}

export interface ProjectRecord {
  slug: string;
  year: string;
  categories: string[];
  image: string;
  galleryImages: string[];
  font?: string;
  /** Layout style for the project narrative — shared across languages, same registry as service layouts. */
  layout?: ServiceLayoutId;
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
// Careers — job postings + applications
// ---------------------------------------------------------------------------

export interface JobTranslation {
  title: string;
  location: string;
  employmentType: string;
  /** Short teaser shown on the jobs grid card. */
  intro: string;
  /** Full description shown on the job detail page — rich text (HTML). */
  description: string;
}

export interface JobRecord {
  id: string;
  slug: string;
  visible: boolean;
  image?: string;
  translations: Record<AdminLocale, JobTranslation>;
}

export async function getJobs(): Promise<JobRecord[]> {
  return (await readJsonSync<JobRecord[]>("jobs.json")) ?? [];
}

export async function saveJobs(jobs: JobRecord[]): Promise<void> {
  await writeJsonSync("jobs.json", jobs);
}

export interface JobApplication {
  id: string;
  jobId: string;
  /** English job title, kept as a snapshot in case the posting changes or is deleted later. */
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  resumeUrl?: string;
  submittedAt: string;
  status: "new" | "reviewed";
}

export async function getApplications(): Promise<JobApplication[]> {
  return (await readJsonSync<JobApplication[]>("applications.json")) ?? [];
}

export async function saveApplications(applications: JobApplication[]): Promise<void> {
  await writeJsonSync("applications.json", applications);
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
    { id: "portfolio", href: "/portfolio", labels: { en: "Projects",  de: "Projekte",   ar: "المشاريع" }, visible: true, custom: false },
    { id: "team",      href: "/team",      labels: { en: "Our Team",  de: "Unser Team",  ar: "فريقنا"   }, visible: true, custom: false },
    { id: "careers",   href: "/karriere",  labels: { en: "Careers",   de: "Karriere",    ar: "وظائف"    }, visible: true, custom: false },
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

export interface StudioTranslation {
  title: string;
  intro: string;
  /** Free-form rich text (HTML), same pipeline as ProjectTranslation.body. H3 headings in
   * here become anchor-linked entries in the burger-menu submenu for /studio. */
  body?: string;
}

export interface StudioData {
  workspaceImage?: string;
  layout?: ServiceLayoutId;
  translations: Record<AdminLocale, StudioTranslation>;
}

// Pre-rich-text shape, still present in Mongo documents saved before this migration.
interface LegacyStudioTranslation {
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
  approachSteps: { title: string; description: string }[];
  valuesTitle: string;
  valuesItems: { title: string; description: string }[];
}

interface LegacyStudioData {
  workspaceImage?: string;
  translations: Record<AdminLocale, LegacyStudioTranslation>;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraphsHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function buildStudioBodyHtml(t: LegacyStudioTranslation): string {
  return [
    `<h3>${escapeHtml(t.historyTitle)}</h3>`,
    paragraphsHtml(t.historyBody),
    `<h3>${escapeHtml(t.missionTitle)}</h3>`,
    paragraphsHtml(t.missionBody),
    `<h3>${escapeHtml(t.visionTitle)}</h3>`,
    paragraphsHtml(t.visionBody),
    `<h3>${escapeHtml(t.approachTitle)}</h3>`,
    paragraphsHtml(t.approachBody),
    `<ol>${t.approachSteps
      .map((s) => `<li><strong>${escapeHtml(s.title)}</strong> — ${escapeHtml(s.description)}</li>`)
      .join("")}</ol>`,
    `<h3>${escapeHtml(t.valuesTitle)}</h3>`,
    `<ul>${t.valuesItems
      .map((v) => `<li><strong>${escapeHtml(v.title)}</strong> — ${escapeHtml(v.description)}</li>`)
      .join("")}</ul>`,
  ].join("");
}

function isLegacyStudio(doc: unknown): doc is LegacyStudioData {
  const t = (doc as LegacyStudioData)?.translations?.en as LegacyStudioTranslation | undefined;
  return typeof t?.historyTitle === "string";
}

/** Converts a pre-rich-text Studio document into the current shape, folding each old
 * section into an H3-headed part of one free-form body per locale. Non-destructive: no
 * text or images are dropped, just re-authored as one flowing document. */
function migrateLegacyStudio(old: LegacyStudioData): StudioData {
  const translations = {} as Record<AdminLocale, StudioTranslation>;
  (Object.keys(old.translations) as AdminLocale[]).forEach((locale) => {
    const t = old.translations[locale];
    translations[locale] = { title: t.title, intro: t.intro, body: buildStudioBodyHtml(t) };
  });
  return {
    workspaceImage: old.workspaceImage,
    layout: resolveServiceLayout(undefined),
    translations,
  };
}

async function initStudio(): Promise<StudioData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): LegacyStudioTranslation {
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
  return migrateLegacyStudio({
    translations: { en: mapLocale(enMod), de: mapLocale(deMod), ar: mapLocale(arMod) },
  });
}

export async function getStudio(): Promise<StudioData> {
  const cached = await readJsonSync<StudioData | LegacyStudioData>("studio.json");
  if (cached) {
    if (isLegacyStudio(cached)) {
      const migrated = migrateLegacyStudio(cached);
      await writeJsonSync("studio.json", migrated); // persist once so migration doesn't re-run
      return migrated;
    }
    return cached as StudioData;
  }
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

export interface ServicesTranslation {
  title: string;
  intro: string;
  /** Free-form rich text (HTML). H3 headings become anchor-linked burger-menu entries. */
  body?: string;
}

export interface ServicesData {
  heroImage?: string;
  layout?: ServiceLayoutId;
  translations: Record<AdminLocale, ServicesTranslation>;
}

// Pre-rich-text shape: one layout per group, structured service items per group.
interface LegacyServiceItem {
  id: string;
  title: string;
  description: string;
  includes?: string;
  deliverables: string[];
  suitableFor: string;
  image?: string;
}

interface LegacyServiceGroup {
  id: string;
  title: string;
  intro: string;
  services: LegacyServiceItem[];
}

interface LegacyServicesTranslation {
  title: string;
  intro: string;
  groups: LegacyServiceGroup[];
}

interface LegacyServicesData {
  translations: Record<AdminLocale, LegacyServicesTranslation>;
  layouts?: Partial<Record<string, ServiceLayoutId>>;
}

/** Only group titles become <h3> (matches today's one-submenu-entry-per-group nav);
 * service titles inside a group become a bold lead-in instead of a heading, so migrating
 * doesn't balloon the burger menu from ~5 entries to 15+. */
function buildServicesBodyHtml(groups: LegacyServiceGroup[]): string {
  return groups
    .map((g) => {
      const services = g.services
        .map((s) => {
          const parts = [`<p><strong>${escapeHtml(s.title)}.</strong> ${escapeHtml(s.description)}</p>`];
          if (s.image) parts.push(`<img src="${s.image}" alt="${escapeHtml(s.title)}" />`);
          if (s.includes) parts.push(`<p>${escapeHtml(s.includes)}</p>`);
          if (s.deliverables.length) {
            parts.push(`<ul>${s.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`);
          }
          parts.push(`<p><em>${escapeHtml(s.suitableFor)}</em></p>`);
          return parts.join("");
        })
        .join("");
      return `<h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.intro)}</p>${services}`;
    })
    .join("");
}

function isLegacyServices(doc: unknown): doc is LegacyServicesData {
  return Array.isArray((doc as LegacyServicesData)?.translations?.en?.groups);
}

/** Converts a pre-rich-text Services document into the current shape. Layout is carried
 * over best-effort from the first group (old data had one layout per group, new data has
 * one for the whole page). */
function migrateLegacyServices(old: LegacyServicesData): ServicesData {
  const translations = {} as Record<AdminLocale, ServicesTranslation>;
  (Object.keys(old.translations) as AdminLocale[]).forEach((locale) => {
    const t = old.translations[locale];
    translations[locale] = { title: t.title, intro: t.intro, body: buildServicesBodyHtml(t.groups) };
  });
  const firstGroupId = old.translations.en.groups[0]?.id;
  return {
    layout: resolveServiceLayout(firstGroupId ? old.layouts?.[firstGroupId] : undefined),
    translations,
  };
}

async function initServices(): Promise<ServicesData> {
  const [enMod, deMod, arMod] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
    import("./dictionaries/ar").then((m) => m.default),
  ]);
  function mapLocale(dict: typeof enMod): LegacyServicesTranslation {
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
          image: s.image,
        })),
      })),
    };
  }
  return migrateLegacyServices({
    translations: { en: mapLocale(enMod), de: mapLocale(deMod), ar: mapLocale(arMod) },
  });
}

export async function getServices(): Promise<ServicesData> {
  const cached = await readJsonSync<ServicesData | LegacyServicesData>("services.json");
  if (cached) {
    if (isLegacyServices(cached)) {
      const migrated = migrateLegacyServices(cached);
      await writeJsonSync("services.json", migrated); // persist once so migration doesn't re-run
      return migrated;
    }
    return cached as ServicesData;
  }
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
  formAttachment: string;
  formAttachmentHint: string;
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
      formAttachment: c.form.attachment,
      formAttachmentHint: c.form.attachmentHint,
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
// Contact inquiries — submissions from the public Kontakt form
// ---------------------------------------------------------------------------

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: "new" | "reviewed";
}

export async function getInquiries(): Promise<ContactInquiry[]> {
  return (await readJsonSync<ContactInquiry[]>("inquiries.json")) ?? [];
}

export async function saveInquiries(inquiries: ContactInquiry[]): Promise<void> {
  await writeJsonSync("inquiries.json", inquiries);
}

