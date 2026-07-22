import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/dictionary-types";

// Repeating aspect ratio pattern creates the staggered masonry look
const ASPECTS = ["aspect-[4/5]", "aspect-[3/4]", "aspect-[5/4]", "aspect-[3/4]"];

export default function ProjectCard({
  project,
  lang,
  viewLabel,
  priority = false,
  aspectIndex = 0,
}: {
  project: Project;
  lang: string;
  viewLabel: string;
  priority?: boolean;
  aspectIndex?: number;
}) {
  const aspect = ASPECTS[aspectIndex % ASPECTS.length];

  return (
    <Link href={`/${lang}/portfolio/${project.slug}`} className="group block cursor-pointer">
      <div className={`relative overflow-hidden ${aspect}`}>
        <Image
          src={project.image}
          alt={project.name}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-heading text-sm text-ink">{project.name}</h3>
        <p className="mt-0.5 text-xs text-stone-400">
          {project.location}{project.location && project.year ? " — " : ""}{project.year}
        </p>
      </div>
    </Link>
  );
}
