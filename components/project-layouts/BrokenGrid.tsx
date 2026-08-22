import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** A 12-column grid that's deliberately broken — uneven widths, offset starts, still a clean hierarchy. */
export default function BrokenGrid({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-20 lg:gap-28">
      {units.map((unit, index) => {
        const flipped = index % 2 === 1;
        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <div className="grid gap-6 lg:grid-cols-12">
              {flipped ? (
                <>
                  <ProjectVisual
                    unit={unit}
                    projectName={projectName}
                    aspect="aspect-[3/4]"
                    priority={index === 0}
                    className="lg:col-span-5 lg:col-start-1"
                  />
                  <ProjectText unit={unit} className="lg:col-span-6 lg:col-start-7 lg:mt-16" />
                </>
              ) : (
                <>
                  <ProjectText unit={unit} className="lg:col-span-5 lg:col-start-1" />
                  <ProjectVisual
                    unit={unit}
                    projectName={projectName}
                    aspect="aspect-[5/4]"
                    priority={index === 0}
                    className="lg:col-span-6 lg:col-start-7 lg:mt-16"
                  />
                </>
              )}
            </div>
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
