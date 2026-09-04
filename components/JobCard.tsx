import Image from "next/image";
import Link from "next/link";
import ImageReveal from "@/components/ImageReveal";
import type { JobPosting } from "@/lib/dictionary-types";

export default function JobCard({
  job,
  lang,
  readMoreLabel,
}: {
  job: JobPosting;
  lang: string;
  readMoreLabel: string;
}) {
  return (
    <Link
      href={`/${lang}/karriere/${job.slug}`}
      className="group flex h-full flex-col border border-line-200 transition-colors duration-200 hover:border-graphite-800"
    >
      {job.image && (
        <ImageReveal className="aspect-[4/3]">
          <Image
            src={job.image}
            alt={job.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </ImageReveal>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-ink">
          {job.location}{job.location && job.employmentType ? " · " : ""}{job.employmentType}
        </p>
        <h3 className="font-heading mt-3 text-xl text-ink">{job.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{job.intro}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-graphite-900 transition-transform duration-200 group-hover:translate-x-1">
          {readMoreLabel} →
        </span>
      </div>
    </Link>
  );
}
