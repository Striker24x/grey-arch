import type { MetadataRoute } from "next";

// Replace with the real production domain before launch.
const SITE_URL = "https://www.grey-arch.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
