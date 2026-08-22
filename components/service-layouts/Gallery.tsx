import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** Museum composition — one large image per service like an exhibited piece, a small detail crop, quiet caption text. */
export default function Gallery({ group, suitableForLabel }: ServiceLayoutProps) {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl leading-tight text-ink sm:text-4xl">{group.title}</h2>
        <p className="mt-4 text-base leading-relaxed text-stone-600">{group.intro}</p>
      </div>

      <div className="mt-20 flex flex-col gap-28 lg:gap-36">
        {group.services.map((service, index) => (
          <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
            <div className="mx-auto max-w-5xl">
              <ServiceVisual service={service} aspect="aspect-[21/9]" />
              <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <ServiceVisual
                  service={service}
                  aspect="aspect-square"
                  className="lg:w-40 lg:shrink-0"
                  sizes="160px"
                />
                <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:flex-1" />
              </div>
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </div>
  );
}
