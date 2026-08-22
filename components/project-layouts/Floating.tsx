import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

// Deterministic float positions on a 12-col invisible grid, cycling every 3 items.
const FLOAT_POSITIONS = [
  { text: "lg:col-span-5 lg:col-start-1", image: "lg:col-span-5 lg:col-start-8 lg:-mt-10" },
  { text: "lg:col-span-5 lg:col-start-8", image: "lg:col-span-4 lg:col-start-2 lg:mt-14" },
  { text: "lg:col-span-4 lg:col-start-4", image: "lg:col-span-5 lg:col-start-1 lg:mt-6" },
];

/** Elements read as if floating freely in space, anchored on an invisible responsive grid. */
export default function Floating({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-24 lg:gap-32">
      {units.map((unit, index) => {
        const pos = FLOAT_POSITIONS[index % FLOAT_POSITIONS.length];
        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <ProjectText unit={unit} className={pos.text} />
              <ProjectVisual
                unit={unit}
                projectName={projectName}
                aspect="aspect-[4/5]"
                priority={index === 0}
                className={`shadow-soft ${pos.image}`}
              />
            </div>
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
