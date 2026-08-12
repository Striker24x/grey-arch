import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/dictionary-types";

export default function ProjectCard({
  project,
  lang,
  viewLabel,
  priority = false,
}: {
  project: Project;
  lang: string;
  viewLabel: string;
  priority?: boolean;
  aspectIndex?: number;
}) {
  return (
    <Link href={`/${lang}/portfolio/${project.slug}`} className="group flex h-full cursor-pointer flex-col">
      <div className="relative aspect-[4/5] overflow-hidden">
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
