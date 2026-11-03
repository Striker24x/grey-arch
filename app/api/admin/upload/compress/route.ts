import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
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
 * Compresses an image that was just uploaded directly to Vercel Blob (see
 * lib/client-upload.ts) and replaces it with a web-sized version.
 *
 * Why this runs AFTER the raw upload rather than before: Vercel serverless
 * functions cap request bodies at ~4.5 MB, so a 100-600 MB original can only
 * ever reach our server by going straight to Blob first (unlimited size).
 * This route then does the real backend-side compression work — resize to a
 * sane web dimension, re-encode at a sensible quality, swap the raw original
 * out for the compressed result — before the URL is ever registered or shown
 * on the site. The oversized original is deleted once this succeeds.
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

    const basePath = new URL(body.url).pathname
      .replace(/^\/+/, "")
      .replace(/\.[a-zA-Z0-9]+$/, "");
    const newPath = `${basePath}-c.${ext}`;

    const blob = await put(newPath, outputBuffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    // Best-effort: remove the now-redundant raw original. Non-fatal if it fails.
    del(body.url).catch(() => {});

    return NextResponse.json({
      url: blob.url,
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
