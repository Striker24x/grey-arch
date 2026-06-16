import Image from "next/image";
import ImageReveal from "./ImageReveal";
import type { GalleryItem } from "@/lib/dictionary-types";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
      {items.map((item, index) => (
        <figure key={item.image} className="break-inside-avoid">
          <ImageReveal className={index % 3 === 1 ? "aspect-[4/5]" : "aspect-square"}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
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
