import { revalidatePath } from "next/cache";
import { getStudio, saveStudio } from "@/lib/data-manager";
import type { StudioData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(await getStudio());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as StudioData;
    await saveStudio(body);
    revalidatePath("/[lang]/studio", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
