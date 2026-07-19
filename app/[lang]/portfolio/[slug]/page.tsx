import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, locales, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import en from "@/lib/dictionaries/en";
import ProjectFacts from "@/components/ProjectFacts";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";
import ProjectGrid from "@/components/ProjectGrid";
import CTASection from "@/components/CTASection";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    en.portfolio.projects.map((project) => ({ lang, slug: project.slug }))
  );
}

async function getProject(lang: string, slug: string) {
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const project = dict.portfolio.projects.find((p) => p.slug === slug);
  if (!project) return null;
  return { dict, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await getProject(lang, slug);
  if (!data) return {};
  return {
    title: data.project.name,
    description: data.project.description,
    alternates: { languages: alternateLinks(`/portfolio/${slug}`) },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const data = await getProject(lang, slug);
  if (!data) notFound();
  const { dict, project } = data;
  const { projectDetail } = dict;

  const related = dict.portfolio.projects
    .filter((p) => p.slug !== project.slug)
    .sort((a, b) => {
      const aShared = a.categories.filter((c) => project.categories.includes(c)).length;
      const bShared = b.categories.filter((c) => project.categories.includes(c)).length;
      return bShared - aShared;
    })
    .slice(0, 3);

  const facts = [
    { label: projectDetail.factsLabels.client, value: project.client },
    { label: projectDetail.factsLabels.location, value: project.location },
    { label: projectDetail.factsLabels.year, value: project.year },
    { label: projectDetail.factsLabels.status, value: project.status },
    { label: projectDetail.factsLabels.services, value: project.servicesProvided.join(", ") },
    { label: projectDetail.factsLabels.buildingType, value: project.buildingType },
    { label: projectDetail.factsLabels.area, value: project.area },
    { label: projectDetail.factsLabels.scope, value: project.scope },
  ];

  const narrative = [
    { heading: projectDetail.sections.summary, body: project.summary },
    { heading: projectDetail.sections.challenge, body: project.challenge },
    { heading: projectDetail.sections.approach, body: project.approach },
    { heading: projectDetail.sections.process, body: project.process },
    { heading: projectDetail.sections.drawings, body: project.drawings },
    { heading: projectDetail.sections.materials, body: project.materials },
    { heading: projectDetail.sections.visualization, body: project.visualization },
  ];

  return (
    <>
      <section className="relative h-[64vh] min-h-[440px] w-full overflow-hidden bg-graphite-900">
        <Image
          src={project.image}
          alt={project.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/85 via-graphite-900/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
            <p className="text-xs uppercase tracking-[0.16em] text-bronze-300">
              {project.location} — {project.year}
            </p>
            <h1 className="font-heading mt-3 text-4xl text-paper-100 sm:text-5xl">
              {project.name}
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProjectFacts facts={facts} />
          </div>

          <div className="flex flex-col gap-12">
            {narrative.map((section) => (
              <AnimatedReveal key={section.heading} className="border-t border-line-200 pt-8 first:border-t-0 first:pt-0">
                <h2 className="font-heading text-2xl text-ink">{section.heading}</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                  {section.body}
                </p>
              </AnimatedReveal>
            ))}

            {project.galleryImages.length > 0 ? (
              <div className="border-t border-line-200 pt-8">
                <h2 className="font-heading text-2xl text-ink">{projectDetail.sections.gallery}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {project.galleryImages.map((image) => (
                    <ImageReveal key={image} className="aspect-[4/3]">
                      <Image
                        src={image}
                        alt={project.name}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </ImageReveal>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-24 border-t border-line-200 pt-16">
            <h2 className="font-heading text-2xl text-ink">{projectDetail.sections.related}</h2>
            <div className="mt-10">
              <ProjectGrid projects={related} lang={lang} viewLabel={dict.common.viewProject} />
            </div>
          </div>
        ) : null}
      </section>

    </>
  );
}
