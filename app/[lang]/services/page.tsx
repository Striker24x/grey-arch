import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import ServiceGroup from "@/components/ServiceGroup";
import CTASection from "@/components/CTASection";
import AnimatedReveal from "@/components/AnimatedReveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.servicesPage.title,
    description: dict.servicesPage.intro,
    alternates: { languages: alternateLinks("/services") },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { servicesPage } = dict;

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <AnimatedReveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
            {dict.nav.services}
          </p>
          <h1 className="font-heading mt-3 text-4xl leading-tight text-ink sm:text-5xl">
            {servicesPage.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-stone-600">{servicesPage.intro}</p>
        </AnimatedReveal>
      </section>

      {servicesPage.groups.map((group, index) => (
        <section key={group.id} className={index % 2 === 1 ? "bg-paper-200" : undefined}>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ServiceGroup
              group={group}
              lang={lang}
              ctaLabel={dict.common.requestThisService}
              suitableForLabel={dict.common.suitableFor}
            />
          </div>
        </section>
      ))}

      <CTASection
        title={dict.home.contactCta.title}
        body={dict.home.contactCta.body}
        cta={dict.home.contactCta.cta}
        href={`/${lang}/connect`}
      />
    </>
  );
}
