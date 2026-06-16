import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import AnimatedReveal from "@/components/AnimatedReveal";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.connect.title,
    description: dict.connect.intro,
    alternates: { languages: alternateLinks("/connect") },
  };
}

export default async function ConnectPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { connect } = dict;

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-24">
      <AnimatedReveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
          {dict.nav.connect}
        </p>
        <h1 className="font-heading mt-3 text-4xl leading-tight text-ink sm:text-5xl">
          {connect.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-stone-600">{connect.intro}</p>
      </AnimatedReveal>

      <AnimatedReveal delay={80} className="mt-8 flex flex-wrap gap-4">
        <a
          href="#contact-form"
          className="cursor-pointer bg-graphite-900 px-6 py-3 text-sm text-paper-100 transition-colors duration-200 hover:bg-bronze-600"
        >
          {connect.ctas.startProject}
        </a>
        <a
          href="#contact-form"
          className="cursor-pointer border border-graphite-800 px-6 py-3 text-sm text-graphite-900 transition-colors duration-200 hover:bg-graphite-900 hover:text-paper-100"
        >
          {connect.ctas.requestConsultation}
        </a>
        <a
          href="#contact-form"
          className="cursor-pointer border-b border-graphite-800 py-3 text-sm text-graphite-900 transition-colors duration-200 hover:border-bronze-500 hover:text-bronze-600"
        >
          {connect.ctas.sendPlans}
        </a>
      </AnimatedReveal>

      <div id="contact-form" className="mt-14 max-w-3xl border border-line-300 bg-paper-50 p-8 lg:p-10">
        <Suspense>
          <ContactForm lang={lang} dict={dict} />
        </Suspense>
      </div>
    </section>
  );
}
