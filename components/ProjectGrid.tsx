import ProjectCard from "./ProjectCard";
import AnimatedProjectCard from "./AnimatedProjectCard";
import type { Project } from "@/lib/dictionary-types";

export default function ProjectGrid({
  projects,
  lang,
  viewLabel,
}: {
  projects: Project[];
  lang: string;
  viewLabel: string;
}) {
  if (projects.length === 0) return null;

  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <AnimatedProjectCard key={project.slug} delay={(index % 3) * 80}>
          <ProjectCard project={project} lang={lang} viewLabel={viewLabel} priority={index < 3} />
        </AnimatedProjectCard>
      ))}
    </div>
  );
}
