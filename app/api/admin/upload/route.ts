import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Issues short-lived, admin-session-gated client tokens so the browser can
 * upload DIRECTLY to Vercel Blob, bypassing our Next.js server entirely —
 * required because Vercel serverless functions cap request bodies at ~4.5 MB
 * and admins routinely upload 100-600 MB photography / 1-3 GB walkthrough
 * videos. Replaces the previous Cloudinary / Bunny.net integrations — Vercel
 * Blob is unlimited in size (multipart upload) and lives in the same account
 * as the rest of the deployment, so there is no third-party CDN/pull-zone to
 * misconfigure.
 *
 * Note: videos uploaded this way are stored as-is (no adaptive-bitrate
 * transcoding like Bunny Stream provided). They play back as plain MP4 via
 * HTTP range requests, which Vercel Blob supports natively.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        if (!token || !(await verifySessionToken(token))) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: ["image/*", "video/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024, // 5 GB safety cap
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do server-side here — the client registers the final
        // URL via /api/admin/upload-register right after this resolves.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload token request failed" },
      { status: 400 }
    );
  }
}
