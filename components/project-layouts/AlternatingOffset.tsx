import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Alternating text/image pairs — unequal widths and a vertical offset on every other row, never a plain 50/50 split. */
export default function AlternatingOffset({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-20">
      {units.map((unit, index) => {
        const flipped = index % 2 === 1;
        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <div className={`flex flex-col gap-8 lg:items-center lg:gap-12 ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
              <ProjectVisual
                unit={unit}
                projectName={projectName}
                aspect="aspect-[4/5]"
                priority={index === 0}
                className={`lg:w-[45%] ${flipped ? "lg:-translate-y-6" : "lg:translate-y-6"}`}
              />
              <ProjectText unit={unit} className="lg:w-[55%]" />
            </div>
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
