import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** Generous whitespace, text kept left, large images offset right/center — quiet editorial rhythm. */
export default function EditorialAsymmetric({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-16 flex flex-col gap-24 lg:gap-32">
        {group.services.map((service, index) => {
          const imageLeft = index % 2 === 1;
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className={`flex flex-col gap-8 ${imageLeft ? "lg:items-start" : "lg:items-end"}`}>
                <ServiceText
                  service={service}
                  suitableForLabel={suitableForLabel}
                  className={`w-full max-w-xl ${imageLeft ? "lg:ml-[8%]" : ""}`}
                />
                <ServiceVisual
                  service={service}
                  aspect="aspect-[4/3]"
                  className={`w-full ${imageLeft ? "lg:w-[85%] lg:mr-[6%]" : "lg:w-[70%] lg:mr-[2%]"}`}
                />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
