import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** A 12-column grid that's deliberately broken — uneven widths, offset starts, still a clean hierarchy. */
export default function BrokenGrid({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-16 flex flex-col gap-20 lg:gap-28">
        {group.services.map((service, index) => {
          const flipped = index % 2 === 1;
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className="grid gap-6 lg:grid-cols-12">
                {flipped ? (
                  <>
                    <ServiceVisual
                      service={service}
                      aspect="aspect-[3/4]"
                      className="lg:col-span-5 lg:col-start-1"
                    />
                    <ServiceText
                      service={service}
                      suitableForLabel={suitableForLabel}
                      className="lg:col-span-6 lg:col-start-7 lg:mt-16"
                    />
                  </>
                ) : (
                  <>
                    <ServiceText
                      service={service}
                      suitableForLabel={suitableForLabel}
                      className="lg:col-span-5 lg:col-start-1"
                    />
                    <ServiceVisual
                      service={service}
                      aspect="aspect-[5/4]"
                      className="lg:col-span-6 lg:col-start-7 lg:mt-16"
                    />
                  </>
                )}
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
