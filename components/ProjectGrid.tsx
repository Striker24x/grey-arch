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
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          lang={lang}
          viewLabel={viewLabel}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
