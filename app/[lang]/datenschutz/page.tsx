import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import LegalPageLayout from "@/components/LegalPageLayout";

// LEGAL — PLACEHOLDER CONTENT.
// This privacy policy is a non-binding placeholder. Final wording must be
// reviewed by qualified legal counsel against applicable law (e.g. GDPR)
// before publication, including any analytics/cookies actually in use.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.legal.datenschutz.title,
    alternates: { languages: alternateLinks("/datenschutz") },
  };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { datenschutz } = dict.legal;

  return (
    <LegalPageLayout
      title={datenschutz.title}
      updated={datenschutz.updated}
      sections={datenschutz.sections}
    />
  );
}
