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
      <div className="overflow-hidden">
        <ImageReveal className="aspect-[4/3]">
          <Image
            src={project.image}
            alt={project.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </ImageReveal>
      </div>
      <div className="mt-4">
        <h3 className="font-heading text-base text-ink">{project.name}</h3>
        <p className="mt-1 text-sm text-stone-500">
          {project.location}{project.location && project.year ? " — " : ""}{project.year}
        </p>
      </div>
    </Link>
  );
}
