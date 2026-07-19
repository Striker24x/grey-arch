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
    <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20 lg:px-10 lg:py-24">
      <AnimatedReveal className="max-w-2xl">
        <h1 className="font-heading text-4xl leading-tight text-bronze-600 sm:text-5xl">
          {dict.nav.connect}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-stone-600">{connect.intro}</p>
      </AnimatedReveal>

      <div id="contact-form" className="mt-10 max-w-3xl border border-line-300 bg-paper-50 p-5 sm:mt-14 sm:p-8 lg:p-10">
        <Suspense>
          <ContactForm lang={lang} dict={dict} />
        </Suspense>
      </div>
    </section>
  );
}
