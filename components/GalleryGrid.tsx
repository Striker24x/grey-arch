import ImageReveal from "./ImageReveal";
import type { GalleryItem } from "@/lib/dictionary-types";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <figure key={item.image}>
          <ImageReveal fill={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="block w-full h-auto"
            />
          </ImageReveal>
          <figcaption className="mt-3 flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink">{item.title}</span>
            <span className="text-xs uppercase tracking-wide text-stone-500">
              {item.category}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
