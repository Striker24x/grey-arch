"use client";

import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/dictionary-types";

export default function ProjectGrid({
  projects,
  lang,
  viewLabel,
}: {
  projects: Project[];
  lang: string;
  viewLabel: string;
  singleColumn?: boolean; // kept for compat, unused
}) {
  if (projects.length === 0) return null;

  return (
    <div className="columns-1 sm:columns-2 lg:columns-4 gap-x-6 lg:gap-x-8">
      {projects.map((project, index) => (
        <div key={project.slug} className="break-inside-avoid mb-6 lg:mb-8">
          <ProjectCard
            project={project}
            lang={lang}
            viewLabel={viewLabel}
            priority={index < 4}
            aspectIndex={index}
          />
        </div>
      ))}
    </div>
  );
}
