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
 * unlike Services, project documents aren't guaranteed to alternate text/image evenly.
 * When the uploaded image's natural size is known (unit.image.width/height), it renders at
 * its real aspect ratio with object-contain — never cropped — so any image size/orientation
 * can be uploaded as-is. Falls back to the fixed `aspect` + object-cover only for images
 * uploaded before this was tracked (no width/height persisted yet). */
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
  const { width, height } = unit.image;
  const knownSize = width && height;

  if (knownSize) {
    return (
      <div className={className}>
        <Image
          src={unit.image.src}
          alt={unit.image.alt || projectName}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full object-contain"
        />
      </div>
    );
  }

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
