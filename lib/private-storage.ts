import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET } from "./r2";

/**
 * Private files (contact-form attachments, job-application resumes) on
 * Cloudflare R2. Replaces the former Bunny.net storage, whose credentials
 * stopped working.
 *
 * Files are NOT referenced by a public URL: the database only stores an
 * opaque "r2-private:<key>" reference, and admins read them through the
 * session-protected /api/admin/... routes, which stream the object via the
 * S3 API. Keys contain a random UUID, so they cannot be guessed.
 */

const PREFIX = "r2-private:";

export function isPrivateRef(ref: string | undefined | null): ref is string {
  return !!ref && ref.startsWith(PREFIX);
}

function keyFromRef(ref: string): string {
  return ref.slice(PREFIX.length);
}

/** Original file extension (lower-case, without dot) of a stored reference. */
export function privateRefExt(ref: string): string {
  const m = ref.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

export async function uploadPrivateFile(
  folder: "inquiries" | "applications",
  fileName: string,
  buffer: Buffer,
  contentType?: string
): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const key = `private/grey-arch/${folder}/${Date.now()}-${randomUUID()}-${safeName}`;
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "private, no-store",
    })
  );
  return `${PREFIX}${key}`;
}

/** Streams a private file; returns null if it doesn't exist. */
export async function readPrivateFile(
  ref: string
): Promise<{ body: ReadableStream; contentType?: string; length?: number } | null> {
  try {
    const res = await getR2Client().send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: keyFromRef(ref) }));
    if (!res.Body) return null;
    return {
      body: res.Body.transformToWebStream(),
      contentType: res.ContentType,
      length: res.ContentLength,
    };
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw err;
  }
}
