import AnimatedReveal from "@/components/AnimatedReveal";
import { ServiceText, ServiceVisual } from "./Shared";
import type { ServiceLayoutProps } from "./types";

/** Opens on a full-width hero image like a story, then each service gets its own composition, closing full-width. */
export default function Scrollytelling({ group, suitableForLabel }: ServiceLayoutProps) {
  const [first, ...rest] = group.services;
  const middle = rest.slice(0, -1);
  const last = rest.length > 0 ? rest[rest.length - 1] : undefined;

  return (
    <div>
      <AnimatedReveal variant="card">
        {first && <ServiceVisual service={first} aspect="aspect-[21/9]" priority />}
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <h2 className="font-heading text-3xl leading-tight text-ink sm:text-4xl">{group.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">{group.intro}</p>
        </div>
        {first && (
          <ServiceText
            service={first}
            suitableForLabel={suitableForLabel}
            className="mx-auto mt-10 max-w-2xl text-left"
          />
        )}
      </AnimatedReveal>

      <div className="mt-20 flex flex-col gap-20 lg:gap-28">
        {middle.map((service, index) => {
          const flipped = index % 2 === 1;
          return (
            <AnimatedReveal key={service.id} variant="card" delay={index * 70}>
              <div className={`flex flex-col gap-8 lg:items-center lg:gap-12 ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                <ServiceVisual service={service} aspect="aspect-[4/5]" className="lg:w-2/5" />
                <ServiceText service={service} suitableForLabel={suitableForLabel} className="lg:w-3/5" />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>

      {last && (
        <AnimatedReveal variant="card" className="mt-20">
          <ServiceVisual service={last} aspect="aspect-[21/9]" />
          <ServiceText service={last} suitableForLabel={suitableForLabel} className="mx-auto mt-8 max-w-2xl" />
        </AnimatedReveal>
      )}
    </div>
  );
}
