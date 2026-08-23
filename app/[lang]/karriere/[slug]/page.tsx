import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getJobs } from "@/lib/data-manager";
import { sanitizeBodyHtml } from "@/lib/parse-content-blocks";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";
import ApplicationForm from "@/components/ApplicationForm";

export async function generateStaticParams() {
  const jobs = await getJobs();
  return locales.flatMap((lang) =>
    jobs.filter((j) => j.visible).map((job) => ({ lang, slug: job.slug }))
  );
}

async function getJob(lang: string, slug: string) {
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const job = dict.careers.jobs.find((j) => j.slug === slug);
  if (!job) return null;
  return { dict, job };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await getJob(lang, slug);
  if (!data) return {};
  return {
    title: data.job.title,
    description: data.job.intro,
    alternates: { languages: alternateLinks(`/karriere/${slug}`) },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const data = await getJob(lang, slug);
  if (!data) notFound();
  const { dict, job } = data;
  const { careers } = dict;

  const sanitizedDescription = sanitizeBodyHtml(job.description);

  return (
    <section className="mx-auto max-w-3xl px-6 py-14 sm:py-20 lg:px-10 lg:py-24">
      <AnimatedReveal>
        <Link
          href={`/${lang}/karriere`}
          className="text-sm text-stone-500 transition-colors duration-200 hover:text-ink"
        >
          ← {careers.backToJobs}
        </Link>

        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-bronze-600">
          {job.location}{job.location && job.employmentType ? " · " : ""}{job.employmentType}
        </p>
        <h1 className="font-heading mt-3 text-4xl leading-tight text-ink sm:text-5xl">
          {job.title}
        </h1>

        {job.image && (
          <ImageReveal className="mt-10 aspect-[16/9]">
            <Image
              src={job.image}
              alt={job.title}
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        )}

        <div
          className="rich-content mt-10 text-base leading-relaxed text-stone-600"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </AnimatedReveal>

      <AnimatedReveal className="mt-16 border-t border-line-200 pt-12">
        <h2 className="font-heading text-2xl text-ink">{careers.detail.applyTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">{careers.detail.applyIntro}</p>
        <div className="mt-8">
          <ApplicationForm jobId={job.id} form={careers.form} />
        </div>
      </AnimatedReveal>
    </section>
  );
}
