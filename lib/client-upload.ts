"use client";

/**
 * Uploads a file DIRECTLY from the browser to Vercel Blob, bypassing our
 * Next.js/Vercel server function entirely (Vercel serverless functions cap
 * request bodies at ~4.5 MB, and admins here routinely upload 100-600 MB
 * photography / 1-3 GB walkthrough videos).
 *
 * Replaces the earlier Cloudinary integration (hard-capped uploads at 10 MB
 * images / 100 MB video on the free plan) and the later Bunny.net integration
 * (pull zone started rejecting every request with 403, likely a security
 * setting — rather than keep juggling a third-party CDN, everything now lives
 * on Vercel Blob directly, in the same account as the rest of the deployment).
 *
 * Kept the historical name `uploadToCloudinary` so none of the admin-panel
 * call sites needed to change when the backing storage moved.
 *
 * Note: unlike Bunny Stream, Vercel Blob does not transcode video (no
 * adaptive bitrate). Videos are stored and served as the original file via
 * HTTP range requests, which is fine for the walkthrough clips used here but
 * worth knowing if someone uploads a very high-bitrate 4K source.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const { upload } = await import("@vercel/blob/client");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${safeName}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    onUploadProgress: (event) => {
      if (onProgress) onProgress(Math.round(event.percentage));
    },
  });

  // Register the URL in image-map.json (identity entry) so getDictionary/
  // image resolution keeps working exactly like the old Cloudinary/Bunny path.
  await fetch("/api/admin/upload-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: blob.url }),
  }).catch(() => {
    // Non-fatal — the file is safely on Vercel Blob either way.
  });

  return blob.url;
}
