import { revalidatePath } from "next/cache";
import { getNavigation, saveNavigation } from "@/lib/data-manager";
import type { NavigationData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(getNavigation());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as NavigationData;
    saveNavigation(body);
    revalidatePath("/[lang]", "layout");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
