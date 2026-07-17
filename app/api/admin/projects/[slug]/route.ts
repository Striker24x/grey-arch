import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";
import type { ProjectRecord } from "@/lib/data-manager";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = (await request.json()) as ProjectRecord;
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

  projects[index] = { ...body, slug };
  saveProjects(projects);
  revalidatePath("/[lang]/portfolio", "page");
  revalidatePath(`/[lang]/portfolio/${slug}`, "page");
  revalidatePath("/[lang]", "page");

  return Response.json(projects[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.slug !== slug);
  if (filtered.length === projects.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  saveProjects(filtered);
  revalidatePath("/[lang]/portfolio", "page");
  revalidatePath("/[lang]", "page");
  return Response.json({ ok: true });
}
