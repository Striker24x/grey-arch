import type { ServiceItem } from "@/lib/dictionary-types";

export default function ServiceCard({
  service,
  suitableForLabel,
}: {
  service: ServiceItem;
  lang: string;
  ctaLabel: string;
  suitableForLabel: string;
}) {
  return (
    <div className="flex h-full flex-col border border-line-300 bg-paper-50 p-7 transition-shadow duration-300 hover:shadow-card">
      <h3 className="font-heading text-xl text-ink">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{service.description}</p>
      {service.includes ? (
        <p className="mt-2 text-xs italic text-stone-500">{service.includes}</p>
      ) : null}
      <ul className="mt-5 flex flex-col gap-1.5 text-sm text-stone-600">
        {service.deliverables.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bronze-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-stone-500">
        <span className="font-medium text-stone-600">{suitableForLabel}: </span>
        {service.suitableFor}
      </p>
    </div>
  );
}
