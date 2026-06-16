import Image from "next/image";
import Link from "next/link";
import ImageReveal from "./ImageReveal";
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
}) {
  return (
    <Link href={`/${lang}/portfolio/${project.slug}`} className="group block cursor-pointer">
      <ImageReveal className="aspect-[4/5]">
        <Image
          src={project.image}
          alt={project.name}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </ImageReveal>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg text-ink">{project.name}</h3>
          <p className="mt-1 text-sm text-stone-500">
            {project.location} — {project.year}
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap border border-line-300 px-2.5 py-1 text-xs text-stone-600">
          {project.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{project.description}</p>
      <span className="mt-3 inline-block cursor-pointer border-b border-graphite-800 pb-0.5 text-sm text-graphite-900 transition-colors duration-200 group-hover:border-bronze-500 group-hover:text-bronze-600">
        {viewLabel}
      </span>
    </Link>
  );
}
