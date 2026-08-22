import Image from "next/image";
import ImageReveal from "@/components/ImageReveal";
import type { ContentUnit } from "@/lib/parse-content-blocks";

/** One text block from the free-form document, already sanitized HTML. */
export function ProjectText({
  unit,
  scale = "base",
  className = "",
}: {
  unit: ContentUnit;
  scale?: "base" | "lg";
  className?: string;
}) {
  if (!unit.textHtml.trim()) return null;
  return (
    <div
      className={`rich-content text-base leading-relaxed text-stone-600 ${scale === "lg" ? "sm:text-lg" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: unit.textHtml }}
    />
  );
}

/** The image paired with a text unit. Renders nothing if the unit has no image —
 * unlike Services, project documents aren't guaranteed to alternate text/image evenly. */
export function ProjectVisual({
  unit,
  projectName,
  className = "",
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
}: {
  unit: ContentUnit;
  projectName: string;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!unit.image) return null;
  return (
    <ImageReveal className={`${aspect} ${className}`}>
      <Image
        src={unit.image.src}
        alt={unit.image.alt || projectName}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </ImageReveal>
  );
}
