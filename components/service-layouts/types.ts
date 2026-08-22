import type { ServiceGroup as ServiceGroupType } from "@/lib/dictionary-types";

export interface ServiceLayoutProps {
  group: ServiceGroupType;
  lang: string;
  ctaLabel: string;
  suitableForLabel: string;
}
