import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";
import type { ProjectRecord } from "@/lib/data-manager";

export async function GET() {
  const projects = await getProjects();
  return Response.json(projects);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProjectRecord;
  const projects = await getProjects();

  if (projects.find((p) => p.slug === body.slug)) {
    return Response.json({ error: "Slug already exists" }, { status: 409 });
  }

  projects.push(body);
  saveProjects(projects);
  revalidatePath("/[lang]/portfolio", "page");
  revalidatePath("/[lang]", "page");

  return Response.json(body, { status: 201 });
}
