import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.178.101"],
  // sharp has native bindings (libvips) that the bundler must not try to
  // trace/inline — on Vercel + Turbopack that produced
  // "ERR_DLOPEN_FAILED: libvips-cpp.so... cannot open shared object file"
  // at runtime for app/api/admin/upload/compress. Marking it external keeps
  // the whole sharp package folder intact so Node can require() it normally.
  serverExternalPackages: ["sharp"],
  // The Turbopack/serverless file tracer doesn't follow sharp's dlopen-style
  // native binary loading, so the linux binaries never made it into the
  // deployed bundle even with serverExternalPackages. Force-include them.
  outputFileTracingIncludes: {
    "/api/admin/upload/compress": [
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  images: {
    // Default Next.js image optimizer.
    remotePatterns: [
      {
        // Current upload target: Cloudflare R2 (public store "grey-arch-media",
        // served via its managed r2.dev domain).
        protocol: "https",
        hostname: "pub-564792c364284f1480aa91cf5b945431.r2.dev",
      },
      {
        // Previous upload target: Vercel Blob — kept so images uploaded
        // during that period (and not yet re-uploaded) don't break.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Legacy assets uploaded before the Bunny.net migration — still
        // referenced by data/image-map.json, kept so those don't 404/break.
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Legacy assets from the brief Bunny.net period, if any remain.
        protocol: "https",
        hostname: "grey-arch-media.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "vz-bed925c5-d3e.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
