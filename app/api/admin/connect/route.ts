import { revalidatePath } from "next/cache";
import { getConnect, saveConnect } from "@/lib/data-manager";
import type { ConnectData } from "@/lib/data-manager";

export async function GET() {
  try {
    return Response.json(await getConnect());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ConnectData;
    await saveConnect(body);
    revalidatePath("/[lang]/connect", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
