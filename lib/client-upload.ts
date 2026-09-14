"use client";

/**
 * Uploads a file DIRECTLY from the browser to Cloudinary using a short-lived signed
 * request, bypassing our Next.js/Vercel server entirely. This is required because
 * Vercel serverless functions cap request bodies at ~4.5 MB — any route on our own
 * server (like the old /api/admin/upload) always rejects large images/videos (100-200 MB
 * originals, high-resolution photos, etc.) no matter what limit the code declares.
 *
 * Flow: ask our server for a signature (tiny JSON) -> upload bytes straight to
 * Cloudinary's API -> tell our server the resulting URL so it can be added to the
 * image-map used to resolve assets on the site.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const signRes = await fetch("/api/admin/upload-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Could not get upload signature");
  const { signature, timestamp, folder: signedFolder, apiKey, cloudName } =
    (await signRes.json()) as {
      signature: string;
      timestamp: number;
      folder: string;
      apiKey: string;
      cloudName: string;
    };

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", signedFolder);
  fd.append("overwrite", "true");

  const url = await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
          resolve(json.secure_url as string);
        } else {
          reject(new Error(json.error?.message ?? "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Cloudinary upload failed (bad response)"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });

  // Register the new URL in image-map.json (identity entry) so getDictionary/
  // image resolution keeps working exactly like the old server-side upload path.
  await fetch("/api/admin/upload-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {
    // Non-fatal — the file is safely on Cloudinary either way, the map entry is
    // only needed for legacy local-path lookups, and Cloudinary URLs pass through
    // getImageUrl() unchanged even without a map entry.
  });

  return url;
}
