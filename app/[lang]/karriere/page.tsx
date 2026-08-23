import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import AnimatedReveal from "@/components/AnimatedReveal";
import JobCard from "@/components/JobCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.careers.title,
    description: dict.careers.intro,
    alternates: { languages: alternateLinks("/karriere") },
  };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { careers } = dict;

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:px-10 lg:py-24">
      <AnimatedReveal className="max-w-2xl">
        <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
          {dict.nav.careers}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-stone-600">{careers.intro}</p>
      </AnimatedReveal>

      {careers.jobs.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {careers.jobs.map((job) => (
            <AnimatedReveal key={job.slug} variant="card">
              <JobCard job={job} lang={lang} readMoreLabel={dict.common.readMore} />
            </AnimatedReveal>
          ))}
        </div>
      ) : (
        <p className="mt-14 text-sm text-stone-500">{careers.emptyState}</p>
      )}
    </section>
  );
}
