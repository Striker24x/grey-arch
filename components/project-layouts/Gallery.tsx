import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Museum composition — each image reads like an exhibited piece, quiet caption text below. */
export default function Gallery({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-28 lg:gap-36">
      {units.map((unit, index) => (
        <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
          <div className="mx-auto max-w-5xl">
            <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-[21/9]" priority={index === 0} />
            <ProjectText unit={unit} className="mt-8" />
          </div>
        </AnimatedReveal>
      ))}
    </div>
  );
}
