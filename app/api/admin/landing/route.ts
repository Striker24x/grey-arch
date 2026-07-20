import { revalidatePath } from "next/cache";
import { getLanding, saveLanding } from "@/lib/data-manager";
import type { LandingData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(getLanding());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as LandingData;
    saveLanding(body);
    revalidatePath("/[lang]", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
