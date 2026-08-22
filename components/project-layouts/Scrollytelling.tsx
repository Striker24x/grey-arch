import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Opens on a full-width hero-style image like a story, then each unit gets its own composition, closing full-width. */
export default function Scrollytelling({ units, projectName }: ProjectLayoutProps) {
  const [first, ...rest] = units;
  const middle = rest.slice(0, -1);
  const last = rest.length > 0 ? rest[rest.length - 1] : undefined;

  return (
    <div>
      {first && (
        <AnimatedReveal variant="card">
          <ProjectVisual unit={first} projectName={projectName} aspect="aspect-[21/9]" priority />
          <ProjectText unit={first} className="mx-auto mt-8 max-w-2xl" />
        </AnimatedReveal>
      )}

      <div className="mt-20 flex flex-col gap-20 lg:gap-28">
        {middle.map((unit, index) => {
          const flipped = index % 2 === 1;
          return (
            <AnimatedReveal key={unit.id} variant="card" delay={index * 70}>
              <div className={`flex flex-col gap-8 lg:items-center lg:gap-12 ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                <ProjectVisual unit={unit} projectName={projectName} aspect="aspect-[4/5]" className="lg:w-2/5" />
                <ProjectText unit={unit} className="lg:w-3/5" />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>

      {last && (
        <AnimatedReveal variant="card" className="mt-20">
          <ProjectVisual unit={last} projectName={projectName} aspect="aspect-[21/9]" />
          <ProjectText unit={last} className="mx-auto mt-8 max-w-2xl" />
        </AnimatedReveal>
      )}
    </div>
  );
}
