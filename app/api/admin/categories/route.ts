import { revalidatePath } from "next/cache";
import { getCategories, saveCategories } from "@/lib/data-manager";
import type { CategoriesData } from "@/lib/data-manager";

export async function GET() {
  return Response.json(getCategories());
}

export async function PUT(request: Request) {
  const body = (await request.json()) as CategoriesData;
  saveCategories(body);
  revalidatePath("/[lang]/portfolio", "page");
  return Response.json(body);
}
