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
      <section className="px-6 py-20 lg:px-10 lg:py-24">
        <AnimatedReveal className="max-w-2xl">
          <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
            {dict.nav.portfolio}
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

    </>
  );
}
