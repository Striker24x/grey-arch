import SectionHeading from "./SectionHeading";
import ServiceCard from "./ServiceCard";
import AnimatedServiceCard from "./AnimatedServiceCard";
import type { ServiceGroup as ServiceGroupType } from "@/lib/dictionary-types";

export default function ServiceGroup({
  group,
  lang,
  ctaLabel,
  suitableForLabel,
}: {
  group: ServiceGroupType;
  lang: string;
  ctaLabel: string;
  suitableForLabel: string;
}) {
  return (
    <div>
      <SectionHeading title={group.title} intro={group.intro} />
      <div className="mt-8 grid gap-8">
        {group.services.map((service, index) => (
          <AnimatedServiceCard key={service.id} delay={index * 60}>
            <ServiceCard
              service={service}
              lang={lang}
              ctaLabel={ctaLabel}
              suitableForLabel={suitableForLabel}
            />
          </AnimatedServiceCard>
        ))}
      </div>
    </div>
  );
}
