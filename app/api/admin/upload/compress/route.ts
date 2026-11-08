import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { getR2Client, R2_BUCKET, r2PublicUrl, r2KeyFromUrl } from "@/lib/r2";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

// Give this route real headroom: it fetches a potentially 100-600 MB source
// image and decodes/resizes it with sharp, which needs both time and memory.
// (Actual ceiling still depends on the Vercel plan's function memory limit —
// see vercel.json.)
export const maxDuration = 60;

const MAX_DIMENSION = 2560; // long edge, px — plenty for any screen/retina display
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;

/**
 * Compresses an image that was just uploaded directly to Cloudflare R2 (see
 * lib/client-upload.ts) and replaces it with a web-sized version.
 *
 * Why this runs AFTER the raw upload rather than before: Vercel serverless
 * functions cap request bodies at ~4.5 MB, so a 100-600 MB original can only
 * ever reach our server by going straight to R2 first (unlimited size via
 * presigned PUT). This route then does the real backend-side compression
 * work — resize to a sane web dimension, re-encode at a sensible quality,
 * swap the raw original out for the compressed result — before the URL is
 * ever registered or shown on the site. The oversized original is deleted
 * once this succeeds.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const originalKey = r2KeyFromUrl(body.url);
  if (!originalKey) {
    return NextResponse.json({ error: "url is not an R2-hosted object" }, { status: 400 });
  }

  try {
    const sourceRes = await fetch(body.url);
    if (!sourceRes.ok) {
      throw new Error(`Could not fetch source image (${sourceRes.status})`);
    }
    const originalSize = Number(sourceRes.headers.get("content-length") ?? 0);
    const inputBuffer = Buffer.from(await sourceRes.arrayBuffer());

    const meta = await sharp(inputBuffer).metadata();
    const hasAlpha = !!meta.hasAlpha;

    const base = sharp(inputBuffer)
      .rotate() // apply EXIF orientation before resizing, then strip EXIF
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    const { buffer: outputBuffer, ext, contentType } = hasAlpha
      ? {
          buffer: await base.webp({ quality: WEBP_QUALITY }).toBuffer(),
          ext: "webp",
          contentType: "image/webp",
        }
      : {
          buffer: await base.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer(),
          ext: "jpg",
          contentType: "image/jpeg",
        };

    const newKey = `${originalKey.replace(/\.[a-zA-Z0-9]+$/, "")}-c.${ext}`;

    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: newKey,
        Body: outputBuffer,
        ContentType: contentType,
      })
    );

    // Best-effort: remove the now-redundant raw original. Non-fatal if it fails.
    client
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: originalKey }))
      .catch(() => {});

    return NextResponse.json({
      url: r2PublicUrl(newKey),
      originalSize,
      compressedSize: outputBuffer.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Compression failed" },
      { status: 500 }
    );
  }
}
