import { revalidatePath } from "next/cache";
import { getCategories, saveCategories } from "@/lib/data-manager";
import type { CategoriesData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(await getCategories());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as CategoriesData;
    await saveCategories(body);
    revalidatePath("/[lang]/portfolio", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
