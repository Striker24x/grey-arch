import { resolveServiceLayout } from "@/lib/service-layouts";
import { SERVICE_LAYOUT_COMPONENTS } from "./service-layouts/registry";
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
  const Layout = SERVICE_LAYOUT_COMPONENTS[resolveServiceLayout(group.layout)];
  return <Layout group={group} lang={lang} ctaLabel={ctaLabel} suitableForLabel={suitableForLabel} />;
}
