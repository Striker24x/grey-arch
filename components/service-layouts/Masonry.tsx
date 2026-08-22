import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

// Three structured templates, cycled deterministically — mixed block sizes without Pinterest-style randomness.
type Template = "text-wide-image" | "image-wide-text" | "full-image-text-below";
const TEMPLATES: Template[] = ["text-wide-image", "image-wide-text", "full-image-text-below"];

/** Mixed block sizes on a structured 12-col grid — editorial, not a Pinterest scatter. */
export default function Masonry({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-16 flex flex-col gap-8">
        {group.services.map((service, index) => {
          const template = TEMPLATES[index % TEMPLATES.length];

          if (template === "text-wide-image") {
            return (
              <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                  <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:col-span-4" />
                  <ServiceVisual service={service} aspect="aspect-[4/3] lg:aspect-auto lg:h-full" className="lg:col-span-8" />
                </div>
              </AnimatedReveal>
            );
          }

          if (template === "image-wide-text") {
            return (
              <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                  <ServiceVisual service={service} aspect="aspect-[5/4]" className="lg:col-span-7" />
                  <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:col-span-5" />
                </div>
              </AnimatedReveal>
            );
          }

          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <ServiceVisual service={service} aspect="aspect-[21/9]" />
              <ServiceText service={service} suitableForLabel={suitableForLabel} className="mt-8 max-w-2xl" />
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
