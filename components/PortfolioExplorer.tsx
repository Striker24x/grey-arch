import ProjectGrid from "./ProjectGrid";
import type { Project } from "@/lib/dictionary-types";
import type { Dictionary } from "@/lib/dictionary-types";

export default function PortfolioExplorer({
  projects,
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
      <div className="mt-12">
        <ProjectGrid projects={projects} lang={lang} viewLabel={viewLabel} />
      </div>
    </div>
  );
}
