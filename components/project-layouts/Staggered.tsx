import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

// Deterministic step offsets — cycles every 3 items so the page reads as a staircase, not a random scatter.
const STEP_OFFSETS = ["lg:ml-0", "lg:ml-[10%]", "lg:ml-[20%]"];

/** Text/image pairs step diagonally down the page like a staircase. */
export default function Staggered({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {units.map((unit, index) => {
        const offset = STEP_OFFSETS[index % STEP_OFFSETS.length];
        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <div className={`flex flex-col gap-6 lg:w-[78%] lg:flex-row lg:items-start lg:gap-10 ${offset}`}>
              <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-square" priority={index === 0} className="lg:w-2/5" />
              <ProjectText unit={unit} className="lg:w-3/5 lg:pt-4" />
            </div>
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
