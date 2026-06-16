import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ProjectGrid from "@/components/ProjectGrid";
import AnimatedServiceCard from "@/components/AnimatedServiceCard";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";
import ProcessTimeline from "@/components/ProcessTimeline";
import CTASection from "@/components/CTASection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { home } = dict;
  const featuredProjects = dict.portfolio.projects.slice(0, 4);

  return (
    <>
      <Hero lang={lang} dict={dict} />

      <Section>
        <SectionHeading
          eyebrow={home.selectedProjects.eyebrow}
          title={home.selectedProjects.title}
          intro={home.selectedProjects.intro}
        />
        <div className="mt-12">
          <ProjectGrid
            projects={featuredProjects}
            lang={lang}
            viewLabel={dict.common.viewProject}
          />
        </div>
        <div className="mt-12">
          <Link
            href={`/${lang}/portfolio`}
            className="cursor-pointer border-b border-graphite-800 pb-0.5 text-sm text-graphite-900 transition-colors duration-200 hover:border-bronze-500 hover:text-bronze-600"
          >
            {home.selectedProjects.cta}
          </Link>
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading
          eyebrow={home.services.eyebrow}
          title={home.services.title}
          intro={home.services.intro}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {home.services.items.map((item, index) => (
            <AnimatedServiceCard key={item.title} delay={index * 70}>
              <div className="flex h-full flex-col border border-line-300 bg-paper-50 p-7 transition-shadow duration-300 hover:shadow-card">
                <span className="font-heading text-sm text-bronze-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-heading text-xl text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </div>
            </AnimatedServiceCard>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href={`/${lang}/services`}
            className="cursor-pointer border-b border-graphite-800 pb-0.5 text-sm text-graphite-900 transition-colors duration-200 hover:border-bronze-500 hover:text-bronze-600"
          >
            {home.services.cta}
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={home.philosophy.eyebrow}
          title={home.philosophy.title}
          intro={home.philosophy.body}
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {home.philosophy.points.map((point, index) => (
            <AnimatedReveal key={point.title} delay={index * 70} className="text-center">
              <h3 className="font-heading text-lg text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {point.description}
              </p>
            </AnimatedReveal>
          ))}
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading
          eyebrow={home.process.eyebrow}
          title={home.process.title}
          intro={home.process.intro}
        />
        <div className="mt-12">
          <ProcessTimeline steps={home.process.steps} />
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedReveal>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
              {home.heritage.eyebrow}
            </p>
            <h2 className="font-heading mt-3 text-3xl leading-tight text-ink sm:text-4xl">
              {home.heritage.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">{home.heritage.body}</p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-stone-600">
              {home.heritage.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bronze-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}/connect`}
              className="mt-7 inline-block cursor-pointer border-b border-graphite-800 pb-0.5 text-sm text-graphite-900 transition-colors duration-200 hover:border-bronze-500 hover:text-bronze-600"
            >
              {home.heritage.cta}
            </Link>
          </AnimatedReveal>
          <ImageReveal className="aspect-[4/3] order-first lg:order-last">
            <Image
              src="/images/grey-arch/services/service-heritage.jpg"
              alt={home.heritage.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ImageReveal className="aspect-[4/3]">
            <Image
              src="/images/grey-arch/services/service-digital-arch.jpg"
              alt={home.digitalArch.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
          <AnimatedReveal>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
              {home.digitalArch.eyebrow}
            </p>
            <h2 className="font-heading mt-3 text-3xl leading-tight text-ink sm:text-4xl">
              {home.digitalArch.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              {home.digitalArch.body}
            </p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-stone-600">
              {home.digitalArch.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bronze-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}/services`}
              className="mt-7 inline-block cursor-pointer border-b border-graphite-800 pb-0.5 text-sm text-graphite-900 transition-colors duration-200 hover:border-bronze-500 hover:text-bronze-600"
            >
              {home.digitalArch.cta}
            </Link>
          </AnimatedReveal>
        </div>
      </Section>

      <CTASection
        title={home.contactCta.title}
        body={home.contactCta.body}
        cta={home.contactCta.cta}
        href={`/${lang}/connect`}
      />
    </>
  );
}

function Section({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "alt";
}) {
  return (
    <section className={tone === "alt" ? "bg-paper-200" : undefined}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">{children}</div>
    </section>
  );
}
