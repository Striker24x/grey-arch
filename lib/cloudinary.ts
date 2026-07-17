import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

/**
 * Upload a Buffer or a local file-path to Cloudinary.
 * Returns the secure_url of the uploaded asset.
 */
export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const opts = {
      folder,
      ...(publicId ? { public_id: publicId } : {}),
      overwrite: true,
      resource_type: "auto" as const,
    };
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err || !result) return reject(err ?? new Error("No result"));
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

/**
 * Upload a local absolute file path directly to Cloudinary.
 * Returns the secure_url.
 */
export async function uploadLocalFile(
  absolutePath: string,
  folder: string,
  publicId: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(absolutePath, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "auto",
  });
  return result.secure_url;
}

/**
 * Derive the Cloudinary folder + publicId from a local web path like
 * /images/grey-arch/portfolio/portfolio-stone-house-restoration.jpg
 */
export function deriveCloudinaryParams(localWebPath: string): {
  folder: string;
  publicId: string;
} {
  // Strip /images/ prefix and the file extension
  const stripped = localWebPath
    .replace(/^\/images\//, "")
    .replace(/\.[^/.]+$/, ""); // remove extension
  const lastSlash = stripped.lastIndexOf("/");
  const folder = stripped.slice(0, lastSlash);
  const publicId = stripped.slice(lastSlash + 1);
  return { folder, publicId };
}
