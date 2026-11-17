import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getLanding, getNavigation, getProjects, type NavItem, type ProjectRecord } from "@/lib/data-manager";
import type { Dictionary } from "@/lib/dictionary-types";
import AnimatedReveal from "@/components/AnimatedReveal";
import GaImage from "@/components/ga/GaImage";

const FALLBACK_BANNER = "/images/landing-hero-banner.jpg";
const FOUNDER_PHOTO = "/images/michel-alkhouri.jpg";

/** Nav ids that changed over time map onto one dictionary entry. */
const SECTION_KEY_ALIASES: Record<string, string> = { karriere: "careers" };

function sectionHref(lang: Locale, item: NavItem): string {
  if (/^https?:\/\//.test(item.href)) return item.href;
  const path = item.href.startsWith("/") ? item.href : `/${item.href}`;
  return `/${lang}${path === "/" ? "" : path}`;
}

function firstBodyImage(html: string | undefined): string | undefined {
  return html?.match(/<img\b[^>]*\ssrc="([^"]+)"/i)?.[1];
}

type ProjectTeaser = { slug: string; name: string; meta: string; cover?: string };

function pickProjects(projects: ProjectRecord[], lang: Locale, limit = 3): ProjectTeaser[] {
  const teasers = projects
    .map((p) => {
      const t = p.translations?.[lang];
      const en = p.translations?.en;
      const name = (t?.name || en?.name || "").trim();
      const location = (t?.location || en?.location || "").trim();
      const cover = p.image || p.galleryImages?.[0] || firstBodyImage(t?.body) || firstBodyImage(en?.body);
      return { slug: p.slug, name, meta: [location, p.year].filter(Boolean).join(" · "), cover: cover || undefined };
    })
    .filter((p) => p.slug && p.name);
  // Keep the admin-defined order, but surface projects that have a cover image first.
  return [...teasers.filter((p) => p.cover), ...teasers.filter((p) => !p.cover)].slice(0, limit);
}

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

/** Heading + description on the left, CTA button on the right (architektinmb.de pattern). */
function SectionHeader({
  label,
  description,
  cta,
  href,
}: {
  label: string;
  description?: string;
  cta: string;
  href: string;
}) {
  return (
    <AnimatedReveal className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <h2 className="ga-serif text-4xl leading-tight sm:text-5xl">{label}</h2>
        {description && <p className="ga-muted mt-5 text-base leading-relaxed">{description}</p>}
      </div>
      <Link href={href} className="ga-btn shrink-0">
        {cta}
      </Link>
    </AnimatedReveal>
  );
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, navigation, landing, projects] = await Promise.all([
    getDictionary(lang),
    getNavigation(),
    getLanding(),
    getProjects(),
  ]);
  const L = dict.landing;
  const bannerSrc = landing.images?.find((img) => img.url?.trim())?.url ?? FALLBACK_BANNER;
  const connectHref = `/${lang}/connect`;
  const navItems = navigation.items.filter((item) => item.visible);

  // Alternate plain / subtle backgrounds for light sections; the studio teaser is always dark.
  let lightIndex = 0;

  return (
    <div className="ga">
      {/* 1 — Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-36 lg:px-10 lg:pb-20 lg:pt-44">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimatedReveal>
            <h1 className="ga-serif text-[2.6rem] uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-[64px]">
              {L.heroHeadline}
            </h1>
          </AnimatedReveal>
          <AnimatedReveal delay={80} className="flex flex-col justify-center gap-6">
            <p className="ga-muted text-base leading-relaxed sm:text-lg">{dict.studio.intro}</p>
            <div>
              <Link href={connectHref} className="ga-btn">
                {L.heroCta}
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 2 — Banner image */}
      <section className="ga-tile relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <GaImage src={bannerSrc} alt={L.bannerAlt} sizes="100vw" priority className="object-cover" />
      </section>

      {/* 3 — One section per visible burger-menu item, in the configured order */}
      {navItems.map((item) => {
        const key = SECTION_KEY_ALIASES[item.id] ?? item.id;
        const label = item.labels[lang] || item.labels.en || item.id;
        const href = sectionHref(lang, item);
        const copy = L.sections[key];
        const cta = copy?.cta ?? L.learnMore;

        if (key === "studio") {
          return <StudioTeaser key={item.id} id={item.id} label={label} href={href} cta={cta} dict={dict} />;
        }

        const bg = lightIndex++ % 2 === 1 ? "ga-subtle" : "";

        if (key === "services") {
          return (
            <section key={item.id} id={`section-${item.id}`} className={bg}>
              <Container className="py-20 lg:py-28">
                <SectionHeader label={label} description={copy?.description} cta={cta} href={href} />
                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                  {L.serviceCards.map((card, i) => {
                    const re = new RegExp(card.anchorMatch, "i");
                    const anchor = dict.servicesPage.sections.find((s) => re.test(s.id));
                    const cardHref = anchor ? `${href}#${anchor.id}` : href;
                    return (
                      <AnimatedReveal key={card.title} variant="card" delay={i * 80}>
                        <Link href={cardHref} className="group block">
                          <div className="ga-tile relative mb-6 aspect-[4/3] w-full overflow-hidden">
                            <GaImage
                              src={card.image}
                              alt={card.title}
                              sizes="(min-width: 768px) 33vw, 100vw"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />
                          </div>
                          <span className="ga-serif ga-faint text-3xl">{String(i + 1).padStart(2, "0")}</span>
                          <h3 className="ga-serif mt-2 text-2xl leading-snug">{card.title}</h3>
                          <p className="ga-muted mt-2 text-sm leading-relaxed">{card.text}</p>
                        </Link>
                      </AnimatedReveal>
                    );
                  })}
                </div>
              </Container>
            </section>
          );
        }

        if (key === "portfolio") {
          const teasers = pickProjects(projects, lang);
          return (
            <section key={item.id} id={`section-${item.id}`} className={bg}>
              <Container className="py-20 lg:py-28">
                <SectionHeader label={label} description={copy?.description} cta={cta} href={href} />
                {teasers.length > 0 && (
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {teasers.map((p, i) => (
                      <AnimatedReveal key={p.slug} variant="card" delay={i * 80}>
                        <Link href={`/${lang}/portfolio/${p.slug}`} className="group block">
                          <div className="ga-tile relative mb-5 aspect-[4/3] w-full overflow-hidden">
                            {p.cover ? (
                              <GaImage
                                src={p.cover}
                                alt={p.name}
                                sizes="(min-width: 768px) 33vw, 100vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-end p-6">
                                <span className="ga-serif ga-faint text-5xl">{String(i + 1).padStart(2, "0")}</span>
                              </div>
                            )}
                          </div>
                          <h3 className="ga-serif text-2xl leading-snug">{p.name}</h3>
                          {p.meta && <p className="ga-label mt-2">{p.meta}</p>}
                        </Link>
                      </AnimatedReveal>
                    ))}
                  </div>
                )}
              </Container>
            </section>
          );
        }

        if (key === "connect") {
          return (
            <section key={item.id} id={`section-${item.id}`} className={bg}>
              <AnimatedReveal className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
                <p className="ga-label">{label}</p>
                <h2 className="ga-serif mt-4 text-4xl leading-tight sm:text-5xl">{L.ctaHeading}</h2>
                <p className="ga-muted mx-auto mt-6 max-w-xl text-base leading-relaxed">{L.ctaText}</p>
                <div className="mt-8">
                  <Link href={href} className="ga-btn">
                    {cta}
                  </Link>
                </div>
              </AnimatedReveal>
            </section>
          );
        }

        // team, careers and any other / admin-created item → compact two-column section
        return (
          <section key={item.id} id={`section-${item.id}`} className={bg}>
            <Container className="py-20 lg:py-28">
              <AnimatedReveal className="grid grid-cols-1 gap-8 border-t border-current/15 pt-12 lg:grid-cols-2 lg:items-end lg:gap-16">
                <h2 className="ga-serif text-4xl leading-tight sm:text-5xl">{label}</h2>
                <div className="flex flex-col items-start gap-6">
                  {copy?.description && (
                    <p className="ga-muted text-base leading-relaxed sm:text-lg">{copy.description}</p>
                  )}
                  <Link href={href} className="ga-btn-outline">
                    {cta}
                  </Link>
                </div>
              </AnimatedReveal>
            </Container>
          </section>
        );
      })}
    </div>
  );
}

/** Dark inverted founder teaser — photo left, text right (architektinmb.de "Über mich" teaser). */
function StudioTeaser({
  id,
  label,
  href,
  cta,
  dict,
}: {
  id: string;
  label: string;
  href: string;
  cta: string;
  dict: Dictionary;
}) {
  const f = dict.landing.founder;
  return (
    <section id={`section-${id}`} className="ga-invert">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20 lg:px-10 lg:py-28">
        <AnimatedReveal variant="card">
          <div className="ga-tile relative aspect-[4/5] w-full max-w-[460px] overflow-hidden">
            <GaImage
              src={FOUNDER_PHOTO}
              alt={f.photoAlt}
              sizes="(min-width: 1024px) 460px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </AnimatedReveal>
        <AnimatedReveal delay={80}>
          <p className="ga-label">{label}</p>
          <h2 className="ga-serif mt-4 text-4xl sm:text-5xl">{f.name}</h2>
          <p className="ga-label mt-3">
            {f.credentials.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {f.bio.map((p) => (
              <p key={p.slice(0, 24)} className="ga-muted text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10">
            <Link href={href} className="ga-btn-outline">
              {cta}
            </Link>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
