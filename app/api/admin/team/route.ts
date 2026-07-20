import { revalidatePath } from "next/cache";
import { getTeam, saveTeam } from "@/lib/data-manager";
import type { TeamRecord } from "@/lib/data-manager";

export async function GET() {
  try {
    const team = await getTeam();
    return Response.json(team);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TeamRecord;
    const team = await getTeam();

    if (!body.id) body.id = `member-${Date.now()}`;
    team.push(body);
    saveTeam(team);
    revalidatePath("/[lang]/team", "page");

    return Response.json(body, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
