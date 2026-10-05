import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { storageUploadUrl, storagePublicUrl } from "@/lib/bunny";

/**
 * Issues short-lived (admin-session-gated) credentials so the browser can PUT a
 * file DIRECTLY to Bunny Storage, bypassing our Next.js/Vercel server entirely —
 * required because Vercel serverless functions cap request bodies at ~4.5 MB and
 * our admins upload 100-600 MB photography. Only reachable by an authenticated
 * admin session (checked below), scoped to this one storage zone (not the full
 * Bunny account).
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { folder?: string; filename?: string } | null;
  if (!body?.filename) {
    return Response.json({ error: "filename is required" }, { status: 400 });
  }

  const folder = (body.folder ?? "uploads").replace(/^\/+|\/+$/g, "");
  const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;

  let password: string;
  try {
    password = process.env.BUNNY_STORAGE_PASSWORD!;
    if (!password) throw new Error("missing");
  } catch {
    return Response.json({ error: "Bunny storage not configured" }, { status: 500 });
  }

  return Response.json({
    uploadUrl: storageUploadUrl(path),
    publicUrl: storagePublicUrl(path),
    accessKey: password,
  });
}
