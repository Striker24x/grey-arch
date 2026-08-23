import { getApplications, saveApplications } from "@/lib/data-manager";
import type { JobApplication } from "@/lib/data-manager";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<Pick<JobApplication, "status">>;
    const applications = await getApplications();
    const index = applications.findIndex((a) => a.id === id);
    if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

    if (body.status) applications[index] = { ...applications[index], status: body.status };
    await saveApplications(applications);
    return Response.json(applications[index]);
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
    const applications = await getApplications();
    const filtered = applications.filter((a) => a.id !== id);
    if (filtered.length === applications.length) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await saveApplications(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
