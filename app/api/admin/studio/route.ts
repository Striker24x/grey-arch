import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getStudio, saveStudio } from "@/lib/data-manager";
import type { StudioData } from "@/lib/data-manager";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

const isStr = (v: unknown) => typeof v === "string";
const isStrArr = (v: unknown) => Array.isArray(v) && v.every(isStr);

function validate(body: StudioData): string | null {
  for (const l of ["en", "de"] as const) {
    const t = body?.translations?.[l];
    if (!t || !isStr(t.title) || !isStr(t.intro) || (t.body !== undefined && !isStr(t.body))) {
      return `Invalid studio translation (${l})`;
    }
  }
  const f = body.founder;
  if (f !== undefined) {
    if (typeof f !== "object" || f === null || typeof f.visible !== "boolean" || !isStr(f.photo)) return "Invalid founder";
    for (const l of ["en", "de"] as const) {
      const ft = f.translations?.[l];
      if (!ft || !isStr(ft.name) || !isStr(ft.photoAlt) || !isStrArr(ft.credentials) || !isStrArr(ft.bio)) {
        return `Invalid founder translation (${l})`;
      }
    }
  }
  return null;
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await getStudio());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: StudioData;
  try {
    body = (await request.json()) as StudioData;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const invalid = validate(body);
  if (invalid) return Response.json({ error: invalid }, { status: 400 });
  try {
    await saveStudio(body);
    revalidatePath("/[lang]/studio", "page");
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
