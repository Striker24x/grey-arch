import crypto from "crypto";

/**
 * Bunny.net integration — replaces Cloudinary for large media (free Cloudinary
 * plan hard-caps uploads at 10 MB for images / 100 MB for video; our admins
 * routinely upload 100-600 MB photos and 1-3 GB walkthrough videos).
 *
 * Images/raw files -> Bunny Storage (simple PUT, no built-in file-size cap).
 * Video            -> Bunny Stream (purpose-built: resumable TUS upload +
 *                      automatic adaptive-bitrate transcoding, so a 3 GB 4K
 *                      source still plays smoothly for visitors).
 */

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function storageConfig() {
  return {
    zone: env("BUNNY_STORAGE_ZONE_NAME"),
    password: env("BUNNY_STORAGE_PASSWORD"),
    hostname: process.env.BUNNY_STORAGE_HOSTNAME ?? "storage.bunnycdn.com",
    pullHostname: env("BUNNY_STORAGE_PULL_HOSTNAME"),
  };
}

export function streamConfig() {
  return {
    libraryId: env("BUNNY_STREAM_LIBRARY_ID"),
    apiKey: env("BUNNY_STREAM_API_KEY"),
    pullHostname: env("BUNNY_STREAM_PULL_HOSTNAME"),
  };
}

export function storageUploadUrl(path: string): string {
  const { hostname, zone } = storageConfig();
  return `https://${hostname}/${zone}/${path.replace(/^\/+/, "")}`;
}

export function storagePublicUrl(path: string): string {
  const { pullHostname } = storageConfig();
  return `https://${pullHostname}/${path.replace(/^\/+/, "")}`;
}

/** True for the storage.bunnycdn.com direct URL — reading it requires the
 * AccessKey header, so (unlike the public pull-zone domain) it is NOT
 * reachable by the public, making it a reasonable spot for private files
 * (job application resumes, contact-form attachments). */
export function isPrivateStorageUrl(url: string): boolean {
  try {
    return new URL(url).hostname === storageConfig().hostname;
  } catch {
    return false;
  }
}

/** Uploads a buffer and returns the PRIVATE storage.bunnycdn.com URL (requires
 * AccessKey to read — use for resumes/attachments, never hotlinked directly). */
export async function uploadBufferToPrivateStorage(
  path: string,
  buffer: Buffer,
  contentType?: string
): Promise<string> {
  const { password } = storageConfig();
  const res = await fetch(storageUploadUrl(path), {
    method: "PUT",
    headers: {
      AccessKey: password,
      "Content-Type": contentType ?? "application/octet-stream",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    throw new Error(`Bunny storage upload failed (${res.status}): ${await res.text().catch(() => "")}`);
  }
  return storageUploadUrl(path);
}

/** Fetches a private storage.bunnycdn.com file server-side (authenticated with
 * the read-only password) so it can be streamed through our own API route. */
export async function fetchPrivateStorageFile(storageUrl: string): Promise<Response> {
  const password = process.env.BUNNY_STORAGE_READONLY_PASSWORD ?? storageConfig().password;
  return fetch(storageUrl, { headers: { AccessKey: password } });
}

/** Server-side upload to Bunny Storage (used for small/medium files only — large
 * files go directly browser -> Bunny via the signed credentials route). */
export async function uploadBufferToStorage(
  path: string,
  buffer: Buffer,
  contentType?: string
): Promise<string> {
  const { password } = storageConfig();
  const res = await fetch(storageUploadUrl(path), {
    method: "PUT",
    headers: {
      AccessKey: password,
      "Content-Type": contentType ?? "application/octet-stream",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    throw new Error(`Bunny storage upload failed (${res.status}): ${await res.text().catch(() => "")}`);
  }
  return storagePublicUrl(path);
}

/** Creates a Bunny Stream video entry and a short-lived TUS upload signature.
 * The browser then uploads the raw video bytes directly to Bunny (resumable,
 * no size cap on our side) using this signature — the Stream API key itself
 * never reaches the client. */
export async function createStreamUpload(title: string): Promise<{
  videoId: string;
  libraryId: string;
  signature: string;
  expire: number;
}> {
  const { libraryId, apiKey } = streamConfig();

  const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: { AccessKey: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!createRes.ok) {
    throw new Error(`Bunny Stream create-video failed (${createRes.status}): ${await createRes.text().catch(() => "")}`);
  }
  const created = (await createRes.json()) as { guid: string };

  const expire = Math.floor(Date.now() / 1000) + 3600; // signature valid 1h
  const signature = crypto
    .createHash("sha256")
    .update(`${libraryId}${apiKey}${expire}${created.guid}`)
    .digest("hex");

  return { videoId: created.guid, libraryId, signature, expire };
}

export function streamPlaybackUrl(videoId: string): string {
  const { pullHostname } = streamConfig();
  return `https://${pullHostname}/${videoId}/play_720p.mp4`;
}

export function streamHlsUrl(videoId: string): string {
  const { pullHostname } = streamConfig();
  return `https://${pullHostname}/${videoId}/playlist.m3u8`;
}

export function streamThumbnailUrl(videoId: string): string {
  const { pullHostname } = streamConfig();
  return `https://${pullHostname}/${videoId}/thumbnail.jpg`;
}

export async function deleteStreamVideo(videoId: string): Promise<void> {
  const { libraryId, apiKey } = streamConfig();
  await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    method: "DELETE",
    headers: { AccessKey: apiKey },
  }).catch(() => {});
}
