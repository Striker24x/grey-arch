import { revalidatePath } from "next/cache";
import { getJobs, saveJobs } from "@/lib/data-manager";
import type { JobRecord } from "@/lib/data-manager";

function tryRevalidate(path: string, type?: "layout" | "page") {
  try { revalidatePath(path, type); } catch { /* non-critical in dev */ }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as JobRecord;
    const jobs = await getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

    jobs[index] = { ...body, id };
    await saveJobs(jobs);
    tryRevalidate("/[lang]/karriere", "page");
    tryRevalidate("/[lang]/karriere/[slug]", "page");
    return Response.json(jobs[index]);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobs = await getJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    if (filtered.length === jobs.length) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await saveJobs(filtered);
    tryRevalidate("/[lang]/karriere", "page");
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
