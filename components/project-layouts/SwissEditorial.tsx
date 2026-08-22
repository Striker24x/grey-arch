import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Strong invisible grid, oversized type, precise alignment — minimal and confident. */
export default function SwissEditorial({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col">
      {units.map((unit, index) => (
        <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
          <div className="grid gap-6 border-b border-line-200 py-12 first:pt-0 lg:grid-cols-12 lg:gap-8">
            <span className="font-heading text-xs text-stone-400 lg:col-span-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            <ProjectText unit={unit} scale="lg" className="lg:col-span-4" />
            <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-[16/10]" priority={index === 0} className="lg:col-span-7" />
          </div>
        </AnimatedReveal>
      ))}
    </div>
  );
}
