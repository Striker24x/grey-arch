import AnimatedReveal from "@/components/AnimatedReveal";
import { ProjectText, ProjectVisual } from "./Shared";
import type { ProjectLayoutProps } from "./types";

/** Left Stack — all text blocks left-aligned and stacked in one column, imagery grouped in the other column beside them,
 * both columns scrolling together in sync (no sticky pinning, so the image column never drifts out of step with the text).
 * Falls back to a single full-width column when a locale's content has no images at all, so pages/languages without
 * imagery never end up with a wasted, permanently empty 50% column squeezing the text narrower than it needs. */
export default function CenteredStack({ units, projectName }: ProjectLayoutProps) {
  const withImage = units.filter((unit) => unit.image);
  const hasImages = withImage.length > 0;

  return (
    <div className={`flex flex-col gap-12 ${hasImages ? "lg:flex-row lg:items-start lg:gap-16" : ""}`}>
      <div className={`flex flex-col gap-12 ${hasImages ? "lg:w-1/2" : "w-full"}`}>
        {units.map((unit, index) => (
          <AnimatedReveal key={unit.id} variant="card" delay={index * 70} className="w-full">
            <ProjectText unit={unit} className="w-full max-w-2xl" />
          </AnimatedReveal>
        ))}
      </div>
      {hasImages && (
        <div className="flex flex-col gap-12 lg:w-1/2">
          {withImage.map((unit, index) => (
            <ProjectVisual
              key={unit.id}
              unit={unit}
              projectName={projectName}
              aspect="aspect-[4/5]"
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
