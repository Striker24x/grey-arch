"use client";

/**
 * Uploads a file DIRECTLY from the browser to Bunny.net, bypassing our Next.js/
 * Vercel server entirely (Vercel serverless functions cap request bodies at
 * ~4.5 MB, and admins here routinely upload 100-600 MB photography / 1-3 GB
 * walkthrough videos — Cloudinary's free plan also hard-rejects anything over
 * 10 MB / 100 MB, which is what originally broke large uploads).
 *
 * Videos -> Bunny Stream (resumable TUS upload, automatic adaptive transcoding
 *           so a 3 GB 4K source still plays smoothly for visitors).
 * Everything else (images etc.) -> Bunny Storage (signed PUT, no size cap).
 *
 * Kept the historical name `uploadToCloudinary` so none of the admin-panel call
 * sites needed to change when we moved off Cloudinary.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const url = file.type.startsWith("video/")
    ? await uploadVideoToStream(file, onProgress)
    : await uploadFileToStorage(file, folder, onProgress);

  // Register the URL in image-map.json (identity entry) so getDictionary/
  // image resolution keeps working exactly like the old Cloudinary path.
  await fetch("/api/admin/upload-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {
    // Non-fatal — the file is safely on Bunny either way.
  });

  return url;
}

async function uploadFileToStorage(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const credRes = await fetch("/api/admin/bunny/storage-credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, filename: file.name }),
  });
  if (!credRes.ok) throw new Error("Could not get upload credentials");
  const { uploadUrl, publicUrl, accessKey } = (await credRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    accessKey: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("AccessKey", accessKey);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  return publicUrl;
}

async function uploadVideoToStream(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const createRes = await fetch("/api/admin/bunny/stream-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: file.name }),
  });
  if (!createRes.ok) throw new Error("Could not create Bunny Stream video");
  const { videoId, libraryId, signature, expire, playbackUrl } = (await createRes.json()) as {
    videoId: string;
    libraryId: string;
    signature: string;
    expire: number;
    playbackUrl: string;
  };

  const { Upload } = await import("tus-js-client");

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expire),
        VideoId: videoId,
        LibraryId: libraryId,
      },
      metadata: {
        filetype: file.type,
        title: file.name,
      },
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        if (onProgress) onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => resolve(),
    });
    upload.start();
  });

  return playbackUrl;
}
