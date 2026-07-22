import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getImageUrl } from "@/lib/image-url";
import SectionHeading from "@/components/SectionHeading";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";
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
    title: dict.studio.title,
    description: dict.studio.intro,
    alternates: { languages: alternateLinks("/studio") },
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { studio } = dict;

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedReveal>
            <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
              {dict.nav.studio}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">
              {studio.intro}
            </p>
          </AnimatedReveal>
          <ImageReveal className="aspect-[4/3]">
            <Image
              src={getImageUrl("/images/grey-arch/services/studio-workspace.jpg")}
              alt={studio.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>
      </section>

      <Section tone="alt" id="about">
        <div className="grid gap-12 lg:grid-cols-3">
          <TextBlock title={studio.history.title} body={studio.history.body} />
          <TextBlock title={studio.mission.title} body={studio.mission.body} />
          <TextBlock title={studio.vision.title} body={studio.vision.body} />
        </div>
      </Section>

      <Section id="approach">
        <SectionHeading title={studio.approach.title} intro={studio.approach.body} />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {studio.approach.steps.map((step, index) => (
            <AnimatedReveal key={step.title} delay={index * 70} className="border-t border-line-300 pt-5">
              <span className="font-heading text-sm text-bronze-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-heading text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.description}</p>
            </AnimatedReveal>
          ))}
        </div>
      </Section>

      <Section tone="alt" id="values">
        <SectionHeading title={studio.values.title} />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {studio.values.items.map((value, index) => (
            <AnimatedReveal key={value.title} delay={index * 60}>
              <h3 className="font-heading text-lg text-ink">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{value.description}</p>
            </AnimatedReveal>
          ))}
        </div>
      </Section>

    </>
  );
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <AnimatedReveal>
      <h2 className="font-heading text-xl text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{body}</p>
    </AnimatedReveal>
  );
}

function Section({
  children,
  tone = "default",
  id,
}: {
  children: React.ReactNode;
  tone?: "default" | "alt";
  id?: string;
}) {
  return (
    <section id={id} className={tone === "alt" ? "bg-paper-200" : undefined}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">{children}</div>
    </section>
  );
}
