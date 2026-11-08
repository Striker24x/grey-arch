import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET, r2PublicUrl } from "@/lib/r2";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Issues a short-lived presigned PUT URL so the browser can upload DIRECTLY
 * to Cloudflare R2, bypassing our Next.js/Vercel server function entirely —
 * required because Vercel serverless functions cap request bodies at ~4.5 MB
 * and admins routinely upload 100-600 MB photography / 1-3 GB walkthrough
 * videos.
 *
 * Replaces the previous Vercel Blob integration: R2 gives 10 GB storage free
 * (vs. Blob's 1 GB on Hobby) and, more importantly, never charges for or
 * blocks on egress/data-transfer — Blob's 10 GB/month Hobby transfer cap
 * would lock the whole store for 30 days once exceeded by normal site
 * traffic. R2 is S3-compatible, so this uses the standard AWS SDK signed-URL
 * flow instead of the Vercel-specific `handleUpload` token dance.
 */
const ALLOWED_PREFIXES = ["image/", "video/"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB safety cap

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    pathname?: string;
    contentType?: string;
    size?: number;
  } | null;

  if (!body?.pathname || !body?.contentType) {
    return NextResponse.json({ error: "pathname and contentType are required" }, { status: 400 });
  }

  if (!ALLOWED_PREFIXES.some((p) => body.contentType!.startsWith(p))) {
    return NextResponse.json({ error: "Only image/* and video/* uploads are allowed" }, { status: 400 });
  }

  if (typeof body.size === "number" && body.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 5 GB upload limit" }, { status: 400 });
  }

  const key = body.pathname.replace(/^\/+/, "");

  try {
    const uploadUrl = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: body.contentType,
      }),
      { expiresIn: 60 * 60 } // 1 hour — plenty for even a multi-GB upload on a slow link
    );

    return NextResponse.json({ uploadUrl, publicUrl: r2PublicUrl(key), key });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create upload URL" },
      { status: 500 }
    );
  }
}
