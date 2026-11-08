"use client";

/**
 * Uploads a file DIRECTLY from the browser to Cloudflare R2 via a presigned
 * PUT URL, bypassing our Next.js/Vercel server function entirely (Vercel
 * serverless functions cap request bodies at ~4.5 MB, and admins here
 * routinely upload 100-600 MB photography / 1-3 GB walkthrough videos).
 *
 * Replaces the earlier Cloudinary integration (hard-capped uploads at 10 MB
 * images / 100 MB video on the free plan), the Bunny.net integration (pull
 * zone started rejecting every request with 403), and then Vercel Blob
 * (Hobby plan's 1 GB storage / 10 GB data-transfer caps — exceeding transfer
 * locks the whole store for 30 days, which normal site traffic could trip).
 * R2 gives 10 GB storage free and never charges for or blocks on egress.
 *
 * Kept the historical name `uploadToCloudinary` so none of the admin-panel
 * call sites needed to change when the backing storage moved (again).
 *
 * Images get a second pass after landing on R2: /api/admin/upload/compress
 * resizes/re-encodes them to a sane web size server-side (regardless of how
 * large the original was — that's only possible AFTER the direct-to-R2
 * upload, since compressing first would mean routing the raw file through
 * our 4.5 MB-capped server). The oversized original is deleted once the
 * compressed version is in place.
 *
 * Note: unlike Bunny Stream, R2 does not transcode video (no adaptive
 * bitrate). Videos are stored and served as the original file via HTTP
 * range requests, which R2's CDN supports natively.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${safeName}`;
  const isImage = file.type.startsWith("image/");

  // 1. Ask our server for a presigned PUT URL (admin-session gated).
  const tokenRes = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname, contentType: file.type, size: file.size }),
  });
  if (!tokenRes.ok) {
    const data = await tokenRes.json().catch(() => null);
    throw new Error(data?.error ?? "Could not start upload");
  }
  const { uploadUrl, publicUrl } = (await tokenRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    key: string;
  };

  // 2. PUT the file straight to R2. Use XHR (not fetch) so we get real
  // upload-progress events for the progress bar.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      // Reserve the last stretch of the bar for server-side compression on images.
      const scale = isImage ? 0.85 : 1;
      onProgress(Math.round((event.loaded / event.total) * 100 * scale));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  let finalUrl = publicUrl;

  if (isImage) {
    try {
      const compressRes = await fetch("/api/admin/upload/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
      });
      if (compressRes.ok) {
        const data = (await compressRes.json()) as { url: string };
        finalUrl = data.url;
      }
      // Non-OK response: fall back to the uncompressed original below.
    } catch {
      // Non-fatal — fall back to the uncompressed original.
    }
  }

  if (onProgress) onProgress(100);

  // Register the URL in image-map.json (identity entry) so getDictionary/
  // image resolution keeps working exactly like the old Cloudinary/Bunny/Blob path.
  await fetch("/api/admin/upload-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: finalUrl }),
  }).catch(() => {
    // Non-fatal — the file is safely on R2 either way.
  });

  return finalUrl;
}
