import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";
import type { ProjectRecord } from "@/lib/data-manager";

function tryRevalidate(path: string, type?: "layout" | "page") {
  try { revalidatePath(path, type); } catch { /* non-critical in dev */ }
}

export async function GET() {
  try {
    const projects = await getProjects();
    return Response.json(projects);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectRecord;
    const projects = await getProjects();

    if (projects.find((p) => p.slug === body.slug)) {
      return Response.json({ error: "Slug already exists" }, { status: 409 });
    }

    projects.push(body);
    saveProjects(projects);
    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidate("/[lang]", "page");

    return Response.json(body, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
