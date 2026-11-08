import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";
import type { ProjectRecord } from "@/lib/data-manager";
import { locales } from "@/lib/i18n";

function tryRevalidate(path: string, type?: "layout" | "page") {
  try { revalidatePath(path, type); } catch { /* non-critical in dev */ }
}

// revalidatePath needs either a fully literal dynamic template (e.g.
// "/[lang]/portfolio/[slug]") or a fully resolved concrete path
// (e.g. "/de/portfolio/01") -- mixing a resolved slug with a literal
// "[lang]" placeholder matches neither and silently revalidates nothing,
// which is why admin edits to a single project never reached the (statically
// generated) detail page until the next full redeploy.
function tryRevalidateForAllLocales(pathSuffix: string) {
  for (const locale of locales) {
    tryRevalidate(`/${locale}${pathSuffix}`);
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const projects = await getProjects();
    const project = projects.find((p) => p.slug === slug);
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(project);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = (await request.json()) as ProjectRecord;
    const projects = await getProjects();
    const index = projects.findIndex((p) => p.slug === slug);
    if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

    projects[index] = { ...body, slug };
    await saveProjects(projects);

    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidateForAllLocales(`/portfolio/${slug}`);
    tryRevalidate("/[lang]", "page");

    return Response.json(projects[index]);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const projects = await getProjects();
    const filtered = projects.filter((p) => p.slug !== slug);
    if (filtered.length === projects.length) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await saveProjects(filtered);
    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidate("/[lang]", "page");
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
