import { revalidatePath } from "next/cache";
import { getJobs, saveJobs } from "@/lib/data-manager";
import type { JobRecord } from "@/lib/data-manager";

export async function GET() {
  try {
    const jobs = await getJobs();
    return Response.json(jobs);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JobRecord;
    const jobs = await getJobs();

    if (!body.id) body.id = `job-${Date.now()}`;
    jobs.push(body);
    await saveJobs(jobs);
    revalidatePath("/[lang]/karriere", "page");

    return Response.json(body, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
