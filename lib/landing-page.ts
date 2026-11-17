import { readJsonSync, writeJsonSync, type AdminLocale } from "./data-manager";

/**
 * Landing page (homepage) content — fully editable in /admin/landing.
 *
 * Stored under its own key ("landing_page") so the old video-slider landing
 * document ("landing") stays untouched. The old video landing (component +
 * admin page) is deactivated (commented out) but kept for possible reuse.
 *
 * First read seeds the document from the dictionaries and migrates the
 * bundled /public images to Cloudflare R2, so every image the homepage shows
 * is served from R2 and can be replaced in the admin.
 */

export const LANDING_LOCALES: AdminLocale[] = ["en", "de"];

export interface LandingCardTranslation {
  title: string;
  text: string;
  /** Optional small tag next to the number, e.g. "In Vorbereitung". */
  badge: string;
}

export interface LandingCard {
  id: string;
  image: string;
  translations: Record<AdminLocale, LandingCardTranslation>;
}

export interface LandingTexts {
  heroHeadline: string;
  heroText: string;
  heroCta: string;
  bannerAlt: string;

  /** Section titles — empty = use the burger-menu label from /admin/navigation. */
  studioLabel: string;
  servicesTitle: string;
  portfolioTitle: string;
  teamTitle: string;
  careersTitle: string;
  galleryTitle: string;
  connectLabel: string;

  founderName: string;
  founderPhotoAlt: string;
  founderCredentials: string[];
  founderBio: string[];
  studioCta: string;

  servicesDescription: string;
  servicesCta: string;

  portfolioDescription: string;
  portfolioCta: string;

  teamDescription: string;
  teamCta: string;

  careersDescription: string;
  careersCta: string;

  galleryDescription: string;
  galleryCta: string;

  connectHeading: string;
  connectText: string;
  connectCta: string;

  /** Fallback button label for admin-created menu items. */
  learnMore: string;
}

export interface LandingPageData {
  /** Target of the hero button, e.g. "/connect" (language prefix is added automatically). */
  heroCtaHref: string;
  bannerImage: string;
  founderPhoto: string;
  /** How many projects the "Projects" section shows. */
  portfolioCount: number;
  serviceCards: LandingCard[];
  translations: Record<AdminLocale, LandingTexts>;
}

const DOC_KEY = "landing_page";

/** Bundled images that get migrated to R2 on first seed. */
const LOCAL_IMAGES = {
  banner: "/images/landing-hero-banner.jpg",
  founder: "/images/michel-alkhouri.jpg",
  card: (n: number) => `/images/landing/leistung-${n}.jpg`,
};

async function buildDefaults(): Promise<LandingPageData> {
  const [en, de] = await Promise.all([
    import("./dictionaries/en").then((m) => m.default),
    import("./dictionaries/de").then((m) => m.default),
  ]);

  const texts = (d: typeof en): LandingTexts => {
    const L = d.landing;
    const s = L.sections;
    return {
      heroHeadline: L.heroHeadline,
      heroText: L.heroText,
      heroCta: L.heroCta,
      bannerAlt: L.bannerAlt,
      studioLabel: "",
      servicesTitle: "",
      portfolioTitle: "",
      teamTitle: "",
      careersTitle: "",
      galleryTitle: "",
      connectLabel: "",
      founderName: L.founder.name,
      founderPhotoAlt: L.founder.photoAlt,
      founderCredentials: [...L.founder.credentials],
      founderBio: [...L.founder.bio],
      studioCta: s.studio?.cta ?? L.learnMore,
      servicesDescription: s.services?.description ?? "",
      servicesCta: s.services?.cta ?? L.learnMore,
      portfolioDescription: s.portfolio?.description ?? "",
      portfolioCta: s.portfolio?.cta ?? L.learnMore,
      teamDescription: s.team?.description ?? "",
      teamCta: s.team?.cta ?? L.learnMore,
      careersDescription: s.careers?.description ?? "",
      careersCta: s.careers?.cta ?? L.learnMore,
      galleryDescription: s.gallery?.description ?? "",
      galleryCta: s.gallery?.cta ?? L.learnMore,
      connectHeading: L.ctaHeading,
      connectText: L.ctaText,
      connectCta: s.connect?.cta ?? L.heroCta,
      learnMore: L.learnMore,
    };
  };

  const serviceCards: LandingCard[] = en.landing.serviceCards.map((card, i) => {
    const deCard = de.landing.serviceCards[i] ?? card;
    return {
      id: `card-${i + 1}`,
      image: card.image || LOCAL_IMAGES.card(i + 1),
      translations: {
        en: { title: card.title, text: card.text, badge: card.badge ?? "" },
        de: { title: deCard.title, text: deCard.text, badge: deCard.badge ?? "" },
      },
    };
  });

  return {
    heroCtaHref: "/connect",
    bannerImage: LOCAL_IMAGES.banner,
    founderPhoto: LOCAL_IMAGES.founder,
    portfolioCount: 3,
    serviceCards,
    translations: { en: texts(en), de: texts(de) },
  };
}

/**
 * Copies a bundled /public image to R2 and returns its public R2 URL.
 * Runs server-side with the deployment's own R2 credentials.
 */
async function copyPublicImageToR2(localPath: string, key: string): Promise<string> {
  const { getR2Client, R2_BUCKET, r2PublicUrl } = await import("./r2");
  const { PutObjectCommand, HeadObjectCommand } = await import("@aws-sdk/client-s3");

  const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://grayarc.de";
  const res = await fetch(`${origin}${localPath}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch ${localPath} failed (${res.status})`);
  const body = Buffer.from(await res.arrayBuffer());

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: res.headers.get("content-type") ?? "image/jpeg",
      CacheControl: "public, max-age=31536000",
    })
  );
  const head = await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  if (head.ContentLength !== body.length) throw new Error(`R2 size mismatch for ${key}`);
  return r2PublicUrl(key);
}

const isLocal = (url: string) => url.startsWith("/");

/** Moves every still-local image of the document to R2. Throws if any copy fails. */
async function migrateImagesToR2(data: LandingPageData): Promise<LandingPageData> {
  const keyFor = (path: string) => `images/grey-arch/landing/${path.split("/").pop()}`;
  const move = async (url: string) => (isLocal(url) ? copyPublicImageToR2(url, keyFor(url)) : url);

  return {
    ...data,
    bannerImage: await move(data.bannerImage),
    founderPhoto: await move(data.founderPhoto),
    serviceCards: await Promise.all(data.serviceCards.map(async (c) => ({ ...c, image: await move(c.image) }))),
  };
}

function hasLocalImages(data: LandingPageData): boolean {
  return [data.bannerImage, data.founderPhoto, ...data.serviceCards.map((c) => c.image)].some(
    (u) => !!u && isLocal(u)
  );
}

/** Fills fields added later so older documents never miss a value. */
function withDefaults(stored: Partial<LandingPageData>, defaults: LandingPageData): LandingPageData {
  const translations = {} as Record<AdminLocale, LandingTexts>;
  for (const l of LANDING_LOCALES) {
    translations[l] = { ...defaults.translations[l], ...(stored.translations?.[l] ?? {}) };
  }
  return {
    ...defaults,
    ...stored,
    serviceCards: stored.serviceCards ?? defaults.serviceCards,
    translations,
  };
}

let lastMigrationAttempt = 0;

export async function getLandingPage(): Promise<LandingPageData> {
  const defaults = await buildDefaults();
  const stored = await readJsonSync<Partial<LandingPageData>>(DOC_KEY);
  const data = stored ? withDefaults(stored, defaults) : defaults;

  // Retry the R2 migration at most every 10 minutes per server instance, so a
  // broken R2 key never slows down every homepage request.
  const now = Date.now();
  if ((!stored || hasLocalImages(data)) && now - lastMigrationAttempt > 10 * 60 * 1000) {
    lastMigrationAttempt = now;
    try {
      const migrated = await migrateImagesToR2(data);
      await writeJsonSync(DOC_KEY, migrated);
      return migrated;
    } catch (err) {
      // Keep serving the bundled images; the migration is retried on the next read.
      console.error("[landing] R2 image migration failed:", err);
      return data;
    }
  }
  return data;
}

export async function saveLandingPage(data: LandingPageData): Promise<void> {
  await writeJsonSync(DOC_KEY, data);
}
