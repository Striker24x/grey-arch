import Link from "next/link";
import ProjectGrid from "./ProjectGrid";
import type { Project } from "@/lib/dictionary-types";
import type { Dictionary } from "@/lib/dictionary-types";

export default function PortfolioExplorer({
  projects,
  filters,
  lang,
  viewLabel,
}: {
  projects: Project[];
  filters: Dictionary["portfolio"]["filters"];
  lang: string;
  viewLabel: string;
}) {
  return (
    <div>
      <div className="flex justify-end border-b border-line-200 pb-6">
        <Link
          href={`/${lang}/gallery`}
          className="cursor-pointer whitespace-nowrap border border-line-300 px-4 py-2 text-sm text-stone-600 transition-colors duration-200 hover:border-graphite-800 hover:text-ink"
        >
          {(filters as Record<string, string>).gallery}
        </Link>
      </div>
      <div className="mt-12">
        <ProjectGrid projects={projects} lang={lang} viewLabel={viewLabel} />
      </div>
    </div>
  );
}
