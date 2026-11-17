import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getLandingPage, saveLandingPage, type LandingPageData } from "@/lib/landing-page";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

// Neue Landing-Page-Verwaltung. Die alte Video-Slider-Route liegt auskommentiert
// unter app/admin/landing/_legacy/video-landing-api-route.ts.

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await getLandingPage());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as LandingPageData;
    if (!body?.translations?.en || !body?.translations?.de || !Array.isArray(body.serviceCards)) {
      return Response.json({ error: "Invalid landing data" }, { status: 400 });
    }
    await saveLandingPage(body);
    revalidatePath("/[lang]", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
