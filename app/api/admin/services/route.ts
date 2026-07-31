import { revalidatePath } from "next/cache";
import { getServices, saveServices } from "@/lib/data-manager";
import type { ServicesData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(await getServices());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ServicesData;
    await saveServices(body);
    revalidatePath("/[lang]/services", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
