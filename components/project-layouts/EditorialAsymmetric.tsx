import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Generous whitespace, text kept left, large images offset right/center — quiet editorial rhythm. */
export default function EditorialAsymmetric({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-24 lg:gap-32">
      {units.map((unit, index) => {
        const imageLeft = index % 2 === 1;
        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <div className={`flex flex-col gap-8 ${imageLeft ? "lg:items-start" : "lg:items-end"}`}>
              <ProjectText
                unit={unit}
                className={`w-full max-w-xl ${imageLeft ? "lg:ml-[8%]" : ""}`}
              />
              <ProjectVisual
                unit={unit}
                projectName={projectName}
                aspect="aspect-[4/3]"
                priority={index === 0}
                className={`w-full ${imageLeft ? "lg:w-[85%] lg:mr-[6%]" : "lg:w-[70%] lg:mr-[2%]"}`}
              />
            </div>
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
