import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

// Three structured templates, cycled deterministically — mixed block sizes without Pinterest-style randomness.
type Template = "text-wide-image" | "image-wide-text" | "full-image-text-below";
const TEMPLATES: Template[] = ["text-wide-image", "image-wide-text", "full-image-text-below"];

/** Mixed block sizes on a structured 12-col grid — editorial, not a Pinterest scatter. */
export default function Masonry({ units, projectName }: ProjectLayoutProps) {
  return (
    <div className="flex flex-col gap-8">
      {units.map((unit, index) => {
        const template = TEMPLATES[index % TEMPLATES.length];

        if (template === "text-wide-image") {
          return (
            <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
              <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                <ProjectText unit={unit} className="lg:col-span-4" />
                <ProjectVisual
                  unit={unit}
                  projectName={projectName}
                  aspect="aspect-[4/3] lg:aspect-auto lg:h-full"
                  priority={index === 0}
                  className="lg:col-span-8"
                />
              </div>
            </AnimatedReveal>
          );
        }

        if (template === "image-wide-text") {
          return (
            <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-[5/4]" priority={index === 0} className="lg:col-span-7" />
                <ProjectText unit={unit} className="lg:col-span-5" />
              </div>
            </AnimatedReveal>
          );
        }

        return (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
            <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-[21/9]" priority={index === 0} />
            <ProjectText unit={unit} className="mt-8 max-w-2xl" />
          </AnimatedReveal>
        );
      })}
    </div>
  );
}
