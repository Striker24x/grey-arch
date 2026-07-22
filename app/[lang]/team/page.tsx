import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import AnimatedReveal from "@/components/AnimatedReveal";
import TeamCard from "@/components/TeamCard";
import CTASection from "@/components/CTASection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.team.title,
    description: dict.team.intro,
    alternates: { languages: alternateLinks("/team") },
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { team } = dict;

  return (
    <>
      <section className="px-6 py-14 sm:py-20 lg:px-10 lg:py-24">
        <AnimatedReveal className="max-w-2xl">
          <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
            {dict.nav.team}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-stone-600">{team.intro}</p>
        </AnimatedReveal>

        <div className="mt-14 columns-1 sm:columns-2 lg:columns-4 gap-x-6 lg:gap-x-8">
          {team.members.map((member, index) => (
            <div key={member.role} className="break-inside-avoid mb-6 lg:mb-8">
              <TeamCard member={member} aspectIndex={index} />
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
