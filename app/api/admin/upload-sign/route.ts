import { signUploadParams } from "@/lib/cloudinary";

/**
 * Issues a short-lived signature so the browser can upload a file DIRECTLY to
 * Cloudinary, bypassing our Next.js/Vercel server entirely. This is required because
 * Vercel serverless functions reject request bodies over ~4.5 MB — routing large
 * images (100-200 MB, high-resolution originals, etc.) through /api/admin/upload
 * would always fail regardless of any in-code size limit. The actual bytes never
 * touch our server; only this signed permission slip does.
 */

/** Map a folder hint like "images/grey-arch/portfolio" → "grey-arch/portfolio" */
function toCloudinaryFolder(folder: string) {
  return folder.replace(/^images\//, "").replace(/^\/+/, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { folder?: string } | null;
  const folder = toCloudinaryFolder(body?.folder || "grey-arch/uploads");

  const { signature, timestamp } = signUploadParams({ folder, overwrite: true });

  return Response.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
