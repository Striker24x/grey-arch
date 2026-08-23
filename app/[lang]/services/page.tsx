import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getServices } from "@/lib/data-manager";
import { resolveServiceLayout } from "@/lib/service-layouts";
import { parseContentBlocks, pairContentBlocks } from "@/lib/parse-content-blocks";
import { PROJECT_LAYOUT_COMPONENTS } from "@/components/project-layouts/registry";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";

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
  const servicesData = await getServices();
  const units = pairContentBlocks(parseContentBlocks(servicesPage.body));
  const Layout = PROJECT_LAYOUT_COMPONENTS[resolveServiceLayout(servicesData.layout)];

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-14 pb-0 sm:pt-20 sm:pb-1 lg:px-10 lg:pt-28 lg:pb-2">
        {servicesData.heroImage ? (
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <AnimatedReveal>
              <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
                {dict.nav.services}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">{servicesPage.intro}</p>
            </AnimatedReveal>
            <ImageReveal className="aspect-[4/3]">
              <Image
                src={servicesData.heroImage}
                alt={servicesPage.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>
        ) : (
          <AnimatedReveal className="max-w-2xl">
            <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
              {dict.nav.services}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-stone-600">{servicesPage.intro}</p>
          </AnimatedReveal>
        )}
      </section>

      {units.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <Layout units={units} projectName={servicesPage.title} />
          </div>
        </section>
      )}
    </>
  );
}
