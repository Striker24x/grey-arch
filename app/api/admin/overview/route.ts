import { revalidatePath } from "next/cache";
import { getOverview, saveOverview } from "@/lib/data-manager";
import type { OverviewData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(await getOverview());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as OverviewData;
    await saveOverview(body);
    revalidatePath("/[lang]", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
