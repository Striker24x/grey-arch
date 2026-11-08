import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 (S3-compatible) client + shared config.
 *
 * Replaces Vercel Blob (Hobby plan only includes 1 GB storage / 10 GB data
 * transfer per month — exceeding either blocks the whole store for the rest
 * of the 30-day billing cycle). R2 gives 10 GB storage free and, crucially,
 * charges nothing for egress ever, on any plan, so serving photography/video
 * off the public site can't trip a traffic cap.
 *
 * R2 bucket "grey-arch-media" has its managed r2.dev public domain enabled,
 * so objects are readable directly at R2_PUBLIC_URL/<key> with no signing
 * needed for GET. Writes/deletes go through the S3 API with the scoped
 * Object Read & Write API token below.
 */

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

export const R2_BUCKET = required("R2_BUCKET_NAME");
export const R2_PUBLIC_URL = required("R2_PUBLIC_URL").replace(/\/+$/, "");

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (client) return client;

  client = new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });

  return client;
}

/** Builds the public URL for an object key stored in the bucket. */
export function r2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key.replace(/^\/+/, "")}`;
}

/** Extracts the object key from a URL previously produced by r2PublicUrl(). */
export function r2KeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) return null;
  return url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, "");
}
