import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import en from "@/lib/dictionaries/en";

// Replace with the real production domain before launch.
const SITE_URL = "https://www.grey-arch.example";

const staticPaths = [
  "",
  "/studio",
  "/services",
  "/portfolio",
  "/gallery",
  "/team",
  "/connect",
  "/impressum",
  "/datenschutz",
  "/agb",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const project of en.portfolio.projects) {
      entries.push({
        url: `${SITE_URL}/${locale}/portfolio/${project.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
