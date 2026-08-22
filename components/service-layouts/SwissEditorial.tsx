import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** Strong invisible grid, oversized type, precise alignment — minimal and confident. */
export default function SwissEditorial({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <div className="grid gap-6 border-b border-line-300 pb-8 lg:grid-cols-12">
        <p className="lg:col-span-2 font-heading text-sm text-bronze-600">
          {String(group.services.length).padStart(2, "0")} Services
        </p>
        <h2 className="font-heading text-4xl leading-[1.05] text-ink sm:text-5xl lg:col-span-7">
          {group.title}
        </h2>
        <p className="text-base leading-relaxed text-stone-600 lg:col-span-3">{group.intro}</p>
      </div>

      <div className="flex flex-col">
        {group.services.map((service, index) => (
          <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
            <div className="grid gap-6 border-b border-line-200 py-12 lg:grid-cols-12 lg:gap-8">
              <span className="font-heading text-xs text-stone-400 lg:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <ServiceText
                service={service}
                suitableForLabel={suitableForLabel}
                scale="lg"
                className="lg:col-span-4"
              />
              <ServiceVisual service={service} aspect="aspect-[16/10]" className="lg:col-span-7" />
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </div>
  );
}
