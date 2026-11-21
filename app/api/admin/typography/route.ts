import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getTypography, saveTypography } from "@/lib/typography";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await getTypography());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let font: unknown;
  try {
    font = ((await request.json()) as { font?: unknown })?.font;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (font !== null && typeof font !== "string") {
    return Response.json({ error: "font must be a string or null" }, { status: 400 });
  }
  try {
    const saved = await saveTypography(font);
    revalidatePath("/", "layout");
    return Response.json(saved);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: msg }, { status: msg.startsWith("Unbekannte") ? 400 : 500 });
  }
}
