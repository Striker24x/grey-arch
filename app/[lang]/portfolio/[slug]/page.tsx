import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, locales, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getProjects } from "@/lib/data-manager";
import { resolveServiceLayout } from "@/lib/service-layouts";
import { parseContentBlocks, pairContentBlocks, sanitizeBodyHtml } from "@/lib/parse-content-blocks";
import { PROJECT_LAYOUT_COMPONENTS } from "@/components/project-layouts/registry";
import ProjectGrid from "@/components/ProjectGrid";
import CTASection from "@/components/CTASection";
import ProjectFontProvider from "@/components/ProjectFontProvider";

export async function generateStaticParams() {
  const projects = await getProjects();
  return locales.flatMap((lang) =>
    projects.map((project) => ({ lang, slug: project.slug }))
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

  // Projects written before the free-form editor only have the old, separately
  // labeled fields — fall back to those (as plain paragraphs) until body is filled in.
  const legacyFields = [
    project.summary, project.challenge, project.approach,
    project.process, project.drawings, project.materials, project.visualization,
  ].filter(Boolean);
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rawBody = project.body?.trim()
    ? project.body
    : legacyFields.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const sanitizedBody = sanitizeBodyHtml(rawBody);
  const units = pairContentBlocks(parseContentBlocks(sanitizedBody));
  const Layout = PROJECT_LAYOUT_COMPONENTS[resolveServiceLayout(project.layout)];

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
              {project.location}{project.location && project.year ? " — " : ""}{project.year}
            </p>
            <h1 className="font-heading mt-3 text-4xl text-paper-100 sm:text-5xl">
              {project.name}
            </h1>
          </div>
        </div>
      </section>

      <ProjectFontProvider font={project.font}>
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          {units.length > 0 && (
            <div className="mx-auto max-w-4xl">
              <Layout units={units} projectName={project.name} />
            </div>
          )}

          {related.length > 0 ? (
            <div className="mt-24">
              <h2 className="font-heading text-2xl text-ink">{projectDetail.sections.related}</h2>
              <div className="mt-10">
                <ProjectGrid projects={related} lang={lang} viewLabel={dict.common.viewProject} />
              </div>
            </div>
          ) : null}
        </section>
      </ProjectFontProvider>

    </>
  );
}
