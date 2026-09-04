import type { Metadata } from "next";
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
  const resolvedLayout = resolveServiceLayout(project.layout);
  const Layout = PROJECT_LAYOUT_COMPONENTS[resolvedLayout];
  const wrapperMaxWidth = resolvedLayout === "centered-stack" ? "" : "mx-auto max-w-4xl";

  return (
    <>
      {/* Cover image intentionally not shown here — it only appears in the portfolio grid.
       * The detail page keeps a plain text header (title only) without the image. */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-0 sm:pt-40 lg:px-10 lg:pt-44">
        <h1 className="font-heading text-4xl leading-tight text-ink sm:text-5xl">
          {project.name}
        </h1>
      </section>

      <ProjectFontProvider font={project.font}>
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          {units.length > 0 && (
            <div className={wrapperMaxWidth}>
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
