import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

// Deterministic float positions on a 12-col invisible grid, cycling every 3 items.
const FLOAT_POSITIONS = [
  { text: "lg:col-span-5 lg:col-start-1", image: "lg:col-span-5 lg:col-start-8 lg:-mt-10" },
  { text: "lg:col-span-5 lg:col-start-8", image: "lg:col-span-4 lg:col-start-2 lg:mt-14" },
  { text: "lg:col-span-4 lg:col-start-4", image: "lg:col-span-5 lg:col-start-1 lg:mt-6" },
];

/** Elements read as if floating freely in space, anchored on an invisible responsive grid. */
export default function Floating({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-20 flex flex-col gap-24 lg:gap-32">
        {group.services.map((service, index) => {
          const pos = FLOAT_POSITIONS[index % FLOAT_POSITIONS.length];
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <ServiceText service={service} suitableForLabel={suitableForLabel} className={pos.text} />
                <ServiceVisual
                  service={service}
                  aspect="aspect-[4/5]"
                  className={`shadow-soft ${pos.image}`}
                />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>
    </div>
  );
}
