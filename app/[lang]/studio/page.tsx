import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, pageAlternates } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { parseContentBlocks, pairContentBlocks, type ContentUnit } from "@/lib/parse-content-blocks";
import AnimatedReveal from "@/components/AnimatedReveal";
import GaImage, { canOptimize } from "@/components/ga/GaImage";
import { getStudio, type StudioFounderTranslation } from "@/lib/data-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.studio.title,
    description: dict.studio.intro,
    alternates: pageAlternates(lang, "/studio"),
  };
}

type StudioSection = {
  key: string;
  /** Anchor id injected by getDictionary() (same ids the Header submenu links to). */
  id?: string;
  headingHtml?: string;
  html: string;
  image?: ContentUnit["image"];
  kind: "steps" | "cards" | "text";
};

const LEADING_H3_RE = /^\s*<h3\b([^>]*)>([\s\S]*?)<\/h3>/i;

/** Turns one admin-edited content unit into a renderable section: pulls its leading H3 out
 * (so it can be laid out separately while keeping its anchor id) and picks a presentation
 * from the content's structure — an ordered list becomes numbered steps on a dark band, an
 * unordered list whose items all start with a bold title becomes bordered cards. */
function toSection(unit: ContentUnit): StudioSection {
  let html = unit.textHtml.replace(/<p>\s*<\/p>/gi, "");
  let id: string | undefined;
  let headingHtml: string | undefined;
  const m = html.match(LEADING_H3_RE);
  if (m) {
    id = m[1].match(/\sid="([^"]+)"/i)?.[1];
    headingHtml = m[2];
    html = html.slice(m[0].length);
  }
  // "<strong>Title</strong> — text" → title on its own line, without the dangling dash.
  const tidy = (s: string) => s.replace(/(<\/strong>)\s*[—–-]\s*/g, "$1 ");

  let kind: StudioSection["kind"] = "text";
  if (/<ol\b/i.test(html)) {
    kind = "steps";
    html = tidy(html);
  } else {
    const ul = html.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/i)?.[1];
    const items = ul ? [...ul.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => x[1]) : [];
    if (items.length >= 2 && items.every((li) => /^\s*(<p>\s*)?<strong>/i.test(li))) {
      kind = "cards";
      html = tidy(html);
    }
  }
  return { key: unit.id, id, headingHtml, html, image: unit.image, kind };
}

function SectionHeading({ id, html, className = "" }: { id?: string; html: string; className?: string }) {
  return (
    <h2
      id={id}
      className={`ga-anchor ga-serif text-3xl leading-tight sm:text-4xl ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BodyImage({ image }: { image: NonNullable<ContentUnit["image"]> }) {
  if (canOptimize(image.src) && image.width && image.height) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 640px, 100vw"
        className="h-auto max-h-[640px] w-auto max-w-full"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.src} alt={image.alt} loading="lazy" className="h-auto max-h-[640px] w-auto max-w-full" />;
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { studio } = dict;
  // Founder block — editable in Admin → Studio. Empty fields of a language fall back to English.
  const founderData = (await getStudio()).founder;
  const fEn = founderData?.translations.en;
  const fLoc = founderData?.translations[lang as "en" | "de"] ?? fEn;
  const pick = <K extends keyof StudioFounderTranslation>(k: K): StudioFounderTranslation[K] | undefined => {
    const v = fLoc?.[k];
    const empty = v === undefined || (Array.isArray(v) ? v.length === 0 : !String(v).trim());
    return empty ? fEn?.[k] : v;
  };
  const founder = {
    name: pick("name") ?? "",
    photoAlt: pick("photoAlt") ?? "",
    credentials: pick("credentials") ?? [],
    bio: pick("bio") ?? [],
    photo: founderData?.photo ?? "",
  };
  const showFounder = founderData?.visible !== false && !!(founder.name || founder.bio.length || founder.photo);
  const pageTitle = studio.title?.trim() || dict.nav.studio;
  const sections = pairContentBlocks(parseContentBlocks(studio.body)).map(toSection);

  return (
    <div className="ga">
      {/* Page title with a short thin rule (architektinmb.de "Über mich") */}
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-36 lg:px-10 lg:pb-16 lg:pt-44">
        <AnimatedReveal>
          <h1 className="ga-serif text-5xl sm:text-6xl">{pageTitle}</h1>
          <div className="ga-rule mt-5" />
        </AnimatedReveal>
      </section>

      {/* Founder — compact portrait left, text right (Admin → Studio → Gründer) */}
      {showFounder && (
      <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-10 lg:pb-24">
        <div className={`grid grid-cols-1 gap-10 sm:gap-12 ${founder.photo ? "sm:grid-cols-[260px_1fr]" : ""}`}>
          {founder.photo && (
            <AnimatedReveal variant="card">
              <div className="ga-tile relative aspect-[3/4] w-full max-w-xs overflow-hidden">
                <GaImage
                  src={founder.photo}
                  alt={founder.photoAlt}
                  sizes="(min-width: 640px) 260px, 320px"
                  priority
                  className="object-cover object-top"
                />
              </div>
            </AnimatedReveal>
          )}
          <AnimatedReveal delay={80}>
            {founder.name && <h2 className="ga-serif text-3xl sm:text-4xl">{founder.name}</h2>}
            <p className={`ga-label ${founder.name ? "mt-3" : ""}`}>
              {founder.credentials.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <div className="mt-6 flex flex-col gap-5">
              {founder.bio.map((p, i) => (
                <p key={i} className="ga-muted leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </AnimatedReveal>
        </div>
      </section>
      )}

      {/* Admin-editable intro + body (Admin → Studio) in the new style */}
      {studio.intro && (
        <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-10 lg:pb-24">
          <AnimatedReveal>
            <div className="ga-line border-t pt-12">
              <p className="ga-serif max-w-3xl text-2xl leading-snug sm:text-3xl">{studio.intro}</p>
            </div>
          </AnimatedReveal>
        </section>
      )}

      {sections.map((s) => {
        if (s.kind === "steps") {
          return (
            <section key={s.key} className="ga-invert">
              <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
                <AnimatedReveal>
                  {s.headingHtml && <SectionHeading id={s.id} html={s.headingHtml} className="sm:text-5xl" />}
                  <div className="ga-rich ga-steps mt-6" dangerouslySetInnerHTML={{ __html: s.html }} />
                </AnimatedReveal>
                {s.image && (
                  <div className="mt-12">
                    <BodyImage image={s.image} />
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (s.kind === "cards") {
          return (
            <section key={s.key} className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
              <AnimatedReveal>
                {s.headingHtml && <SectionHeading id={s.id} html={s.headingHtml} className="sm:text-5xl" />}
                <div className="ga-rich ga-cards mt-4" dangerouslySetInnerHTML={{ __html: s.html }} />
              </AnimatedReveal>
              {s.image && (
                <div className="mt-12">
                  <BodyImage image={s.image} />
                </div>
              )}
            </section>
          );
        }

        return (
          <section key={s.key} className="mx-auto max-w-5xl px-6 pb-16 lg:px-10 lg:pb-20">
            <AnimatedReveal>
              <div className="ga-line grid grid-cols-1 gap-6 border-t pt-12 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                  {s.headingHtml && <SectionHeading id={s.id} html={s.headingHtml} />}
                </div>
                <div className="lg:col-span-8">
                  {s.html.trim() && <div className="ga-rich" dangerouslySetInnerHTML={{ __html: s.html }} />}
                  {s.image && (
                    <figure className={s.html.trim() ? "mt-8" : ""}>
                      <BodyImage image={s.image} />
                    </figure>
                  )}
                </div>
              </div>
            </AnimatedReveal>
          </section>
        );
      })}
    </div>
  );
}
