import { revalidatePath } from "next/cache";
import { getTeam, saveTeam } from "@/lib/data-manager";
import type { TeamRecord } from "@/lib/data-manager";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as TeamRecord;
  const team = await getTeam();
  const index = team.findIndex((m) => m.id === id);
  if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

  team[index] = { ...body, id };
  saveTeam(team);
  revalidatePath("/[lang]/team", "page");
  return Response.json(team[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const team = await getTeam();
  const filtered = team.filter((m) => m.id !== id);
  if (filtered.length === team.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  saveTeam(filtered);
  revalidatePath("/[lang]/team", "page");
  return Response.json({ ok: true });
}
