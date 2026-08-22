import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

// Deterministic irregular indents, cycling every 4 items — experimental but reproducible.
const INDENTS = ["lg:pl-0 lg:w-[55%]", "lg:pl-[18%] lg:w-[60%]", "lg:pl-[6%] lg:w-[48%]", "lg:pl-[32%] lg:w-[55%]"];
const IMAGE_WIDTHS = ["lg:w-[70%]", "lg:w-[42%] lg:ml-auto", "lg:w-[55%] lg:ml-[20%]", "lg:w-[38%]"];

/** Experimental, deliberately irregular composition with heavy whitespace — modern design-agency feel. */
export default function Deconstructed({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-20 flex flex-col gap-16 lg:gap-24">
        {group.services.map((service, index) => (
          <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
            <div className="flex flex-col gap-10">
              <ServiceText
                service={service}
                suitableForLabel={suitableForLabel}
                className={INDENTS[index % INDENTS.length]}
              />
              <ServiceVisual
                service={service}
                aspect="aspect-[4/3]"
                className={IMAGE_WIDTHS[index % IMAGE_WIDTHS.length]}
              />
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </div>
  );
}
