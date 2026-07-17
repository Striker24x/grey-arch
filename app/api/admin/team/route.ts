import { revalidatePath } from "next/cache";
import { getTeam, saveTeam } from "@/lib/data-manager";
import type { TeamRecord } from "@/lib/data-manager";

export async function GET() {
  const team = await getTeam();
  return Response.json(team);
}

export async function POST(request: Request) {
  const body = (await request.json()) as TeamRecord;
  const team = await getTeam();

  if (!body.id) body.id = `member-${Date.now()}`;
  team.push(body);
  saveTeam(team);
  revalidatePath("/[lang]/team", "page");

  return Response.json(body, { status: 201 });
}
