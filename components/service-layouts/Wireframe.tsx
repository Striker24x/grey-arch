import type { ServiceLayoutId } from "@/lib/service-layouts";

type Block = { x: number; y: number; w: number; h: number; kind: "text" | "image" };

// Small, hand-placed wireframes (120x80 viewBox) — one per layout id, used as admin preview thumbnails.
const WIREFRAMES: Record<ServiceLayoutId, Block[]> = {
  "editorial-asymmetric": [
    { x: 8, y: 8, w: 40, h: 6, kind: "text" },
    { x: 34, y: 20, w: 78, h: 38, kind: "image" },
    { x: 8, y: 64, w: 32, h: 6, kind: "text" },
  ],
  "broken-grid": [
    { x: 8, y: 6, w: 34, h: 22, kind: "text" },
    { x: 54, y: 4, w: 58, h: 26, kind: "image" },
    { x: 24, y: 40, w: 34, h: 8, kind: "text" },
    { x: 8, y: 52, w: 46, h: 22, kind: "image" },
  ],
  staggered: [
    { x: 8, y: 6, w: 26, h: 6, kind: "text" },
    { x: 12, y: 16, w: 30, h: 20, kind: "image" },
    { x: 42, y: 42, w: 26, h: 6, kind: "text" },
    { x: 46, y: 52, w: 30, h: 20, kind: "image" },
  ],
  "alternating-offset": [
    { x: 8, y: 10, w: 34, h: 16, kind: "text" },
    { x: 50, y: 6, w: 40, h: 22, kind: "image" },
    { x: 8, y: 38, w: 36, h: 20, kind: "image" },
    { x: 52, y: 46, w: 34, h: 14, kind: "text" },
  ],
  "swiss-editorial": [
    { x: 8, y: 6, w: 104, h: 2, kind: "text" },
    { x: 8, y: 16, w: 24, h: 30, kind: "text" },
    { x: 40, y: 16, w: 72, h: 30, kind: "image" },
    { x: 8, y: 54, w: 104, h: 2, kind: "text" },
  ],
  gallery: [
    { x: 30, y: 6, w: 60, h: 5, kind: "text" },
    { x: 15, y: 16, w: 90, h: 28, kind: "image" },
    { x: 15, y: 50, w: 18, h: 18, kind: "image" },
    { x: 40, y: 52, w: 62, h: 14, kind: "text" },
  ],
  floating: [
    { x: 10, y: 6, w: 34, h: 10, kind: "text" },
    { x: 56, y: 14, w: 44, h: 24, kind: "image" },
    { x: 14, y: 44, w: 32, h: 22, kind: "image" },
    { x: 56, y: 52, w: 34, h: 10, kind: "text" },
  ],
  masonry: [
    { x: 8, y: 6, w: 28, h: 24, kind: "text" },
    { x: 42, y: 6, w: 70, h: 24, kind: "image" },
    { x: 8, y: 36, w: 44, h: 20, kind: "image" },
    { x: 58, y: 40, w: 54, h: 14, kind: "text" },
  ],
  deconstructed: [
    { x: 22, y: 6, w: 38, h: 8, kind: "text" },
    { x: 6, y: 18, w: 28, h: 20, kind: "image" },
    { x: 38, y: 42, w: 44, h: 8, kind: "text" },
    { x: 50, y: 54, w: 24, h: 16, kind: "image" },
  ],
  scrollytelling: [
    { x: 6, y: 6, w: 108, h: 18, kind: "image" },
    { x: 25, y: 28, w: 70, h: 6, kind: "text" },
    { x: 8, y: 40, w: 38, h: 10, kind: "text" },
    { x: 60, y: 38, w: 28, h: 20, kind: "image" },
    { x: 6, y: 64, w: 108, h: 10, kind: "image" },
  ],
};

export default function LayoutWireframe({ id, className = "" }: { id: ServiceLayoutId; className?: string }) {
  const blocks = WIREFRAMES[id];
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <rect x="0" y="0" width="120" height="80" fill="var(--color-paper-200, #f4f1ea)" />
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={b.kind === "image" ? "var(--color-bronze-300, #d9bd96)" : "var(--color-line-400, #c2b8a6)"}
        />
      ))}
    </svg>
  );
}
