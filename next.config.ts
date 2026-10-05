import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.178.101"],
  images: {
    // Default Next.js image optimizer (Bunny's Optimizer add-on isn't enabled
    // on the pull zones, so there's no custom loader needed).
    remotePatterns: [
      {
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
