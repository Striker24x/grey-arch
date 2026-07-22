import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";
import type { ProjectRecord } from "@/lib/data-manager";

function tryRevalidate(path: string, type?: "layout" | "page") {
  try { revalidatePath(path, type); } catch { /* non-critical in dev */ }
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
    saveProjects(projects);

    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidate(`/[lang]/portfolio/${slug}`, "page");
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
    saveProjects(filtered);
    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidate("/[lang]", "page");
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
