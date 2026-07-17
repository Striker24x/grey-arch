import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    // Keep remotePatterns as a safeguard for any direct Cloudinary URL usage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ptlxw33l/**",
      },
    ],
  },
};

export default nextConfig;
