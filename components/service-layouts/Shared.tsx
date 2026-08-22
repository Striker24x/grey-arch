import Image from "next/image";
import ImageReveal from "@/components/ImageReveal";
import type { ServiceItem } from "@/lib/dictionary-types";

/** Full text content for one service — title through suitable-for. Every
 * layout renders every field; only position, width and scale differ. */
export function ServiceText({
  service,
  suitableForLabel,
  scale = "base",
  className = "",
}: {
  service: ServiceItem;
  suitableForLabel: string;
  scale?: "base" | "lg";
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className={scale === "lg" ? "font-heading text-3xl leading-tight text-ink sm:text-4xl" : "font-heading text-2xl text-ink"}>
        {service.title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-stone-600">{service.description}</p>
      {service.includes ? (
        <p className="mt-2 text-sm italic text-stone-500">{service.includes}</p>
      ) : null}
      <p className="mt-5 text-sm leading-relaxed text-stone-500">
        <span className="font-medium text-stone-600">{suitableForLabel}: </span>
        {service.suitableFor}
      </p>
    </div>
  );
}

/** Image slot for a service. Falls back to a quiet editorial placeholder
 * when no image has been uploaded yet, so every layout still looks composed. */
export function ServiceVisual({
  service,
  className = "",
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
}: {
  service: ServiceItem;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (service.image) {
    return (
      <ImageReveal className={`${aspect} ${className}`}>
        <Image
          src={service.image}
          alt={service.title}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </ImageReveal>
    );
  }
  return (
    <div className={`relative ${aspect} ${className} flex items-center justify-center overflow-hidden border border-dashed border-line-300 bg-paper-200`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="h-10 w-10 text-stone-300"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L3 20" />
      </svg>
      <span className="absolute bottom-4 right-4 text-[11px] uppercase tracking-[0.18em] text-stone-400">
        {service.title}
      </span>
    </div>
  );
}
