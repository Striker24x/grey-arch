"use client";

/**
 * Custom Next.js image loader that uses Cloudinary's URL-based transformations.
 * Cloudinary URLs already contain the path; we just insert transformation
 * params (width, format, quality) after /upload/ so images are delivered
 * optimally from Cloudinary's CDN without going through Next.js' proxy.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const q = quality ?? 80;

  // Cloudinary URL → insert transforms after /upload/
  if (src.includes("res.cloudinary.com")) {
    return src.replace("/upload/", `/upload/w_${width},f_auto,q_${q}/`);
  }

  // Fallback: local path (should not occur after migration)
  return src;
}
