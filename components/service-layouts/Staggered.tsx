import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

// Deterministic step offsets — cycles every 3 items so the page reads as a staircase, not a random scatter.
const STEP_OFFSETS = ["lg:ml-0", "lg:ml-[10%]", "lg:ml-[20%]"];

/** Text/image pairs step diagonally down the page like a staircase. */
export default function Staggered({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-16 flex flex-col gap-16 lg:gap-20">
        {group.services.map((service, index) => {
          const offset = STEP_OFFSETS[index % STEP_OFFSETS.length];
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className={`flex flex-col gap-6 lg:w-[78%] lg:flex-row lg:items-start lg:gap-10 ${offset}`}>
                <ServiceVisual service={service} aspect="aspect-square" className="lg:w-2/5" />
                <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:w-3/5 lg:pt-4" />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
