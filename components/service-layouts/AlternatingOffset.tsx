import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** Alternating text/image pairs — unequal widths and a vertical offset on every other row, never a plain 50/50 split. */
export default function AlternatingOffset({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-16 flex flex-col gap-20">
        {group.services.map((service, index) => {
          const flipped = index % 2 === 1;
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className={`flex flex-col gap-8 lg:items-center lg:gap-12 ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                <ServiceVisual
                  service={service}
                  aspect="aspect-[4/5]"
                  className={`lg:w-[45%] ${flipped ? "lg:-translate-y-6" : "lg:translate-y-6"}`}
                />
                <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:w-[55%]" />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
