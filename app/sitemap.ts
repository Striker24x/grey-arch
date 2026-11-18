import type { MetadataRoute } from "next";
import { locales, SITE_URL } from "@/lib/i18n";
import { getProjects, getJobs } from "@/lib/data-manager";

// Regenerate at most once an hour so new projects/jobs from the admin show up.
export const revalidate = 3600;

const staticPaths = [
  "",
  "/studio",
  "/services",
  "/portfolio",
  "/team",
  "/karriere",
  "/connect",
  "/impressum",
  "/datenschutz",
  "/agb",
];

function alternatesFor(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, jobs] = await Promise.all([
    getProjects().catch(() => []),
    getJobs().catch(() => []),
  ]);
  const paths: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    ...staticPaths.map((p) => ({ path: p, priority: p === "" ? 1 : 0.7, changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly" })),
    ...projects.map((p) => ({ path: `/portfolio/${p.slug}`, priority: 0.6, changeFrequency: "monthly" as const })),
    ...jobs.filter((j) => j.visible).map((j) => ({ path: `/karriere/${j.slug}`, priority: 0.5, changeFrequency: "weekly" as const })),
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const { path, priority, changeFrequency } of paths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency,
        priority,
        alternates: alternatesFor(path),
      });
    }
  }
  return entries;
}
