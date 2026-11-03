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
  images: {
    // Default Next.js image optimizer.
    remotePatterns: [
      {
        // Current upload target: Vercel Blob (public store "grey-arch-media").
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
