import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import AnimatedReveal from "@/components/AnimatedReveal";
import PortfolioExplorer from "@/components/PortfolioExplorer";
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
    title: dict.portfolio.title,
    description: dict.portfolio.intro,
    alternates: { languages: alternateLinks("/portfolio") },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { portfolio } = dict;

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <AnimatedReveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
            {dict.nav.portfolio}
          </p>
          <h1 className="font-heading mt-3 text-4xl leading-tight text-ink sm:text-5xl">
            {portfolio.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-stone-600">{portfolio.intro}</p>
        </AnimatedReveal>

        <div className="mt-14">
          <PortfolioExplorer
            projects={portfolio.projects}
            filters={portfolio.filters}
            lang={lang}
            viewLabel={dict.common.viewProject}
          />
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
