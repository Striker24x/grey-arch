import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import AnimatedReveal from "@/components/AnimatedReveal";
import GalleryGrid from "@/components/GalleryGrid";
import CTASection from "@/components/CTASection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.galleryPage.title,
    description: dict.galleryPage.intro,
    alternates: { languages: alternateLinks("/gallery") },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { galleryPage } = dict;

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <AnimatedReveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
            {dict.portfolio.filters.gallery}
          </p>
          <h1 className="font-heading mt-3 text-4xl leading-tight text-ink sm:text-5xl">
            {galleryPage.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-stone-600">{galleryPage.intro}</p>
        </AnimatedReveal>

        <div className="mt-14">
          <GalleryGrid items={galleryPage.items} />
        </div>
      </section>

      <CTASection
        title={dict.home.contactCta.title}
        body={dict.home.contactCta.body}
        cta={dict.home.contactCta.cta}
        href={`/${lang}/connect`}
      />
    </>
  );
}
