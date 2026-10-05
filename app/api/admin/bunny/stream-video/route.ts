import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { createStreamUpload, streamPlaybackUrl } from "@/lib/bunny";

/**
 * Creates a Bunny Stream video entry and returns a short-lived TUS upload
 * signature so the browser can upload the raw video DIRECTLY to Bunny
 * (resumable, no practical size cap) — the Stream API key never reaches
 * the client. Admin-session-gated, same reasoning as storage-credentials.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = body?.title || `upload-${Date.now()}`;

  try {
    const upload = await createStreamUpload(title);
    return Response.json({
      ...upload,
      playbackUrl: streamPlaybackUrl(upload.videoId),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Bunny Stream create-video failed" },
      { status: 500 }
    );
  }
}
