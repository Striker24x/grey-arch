import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import LegalPageLayout from "@/components/LegalPageLayout";

// LEGAL — PLACEHOLDER CONTENT.
// These terms and conditions are a non-binding placeholder. Final terms
// (fee structure, liability, scope of services) must be drafted by
// qualified legal counsel before publication.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.legal.agb.title,
    alternates: { languages: alternateLinks("/agb") },
  };
}

export default async function AgbPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { agb } = dict.legal;

  return (
    <LegalPageLayout title={agb.title} updated={agb.updated} sections={agb.sections} />
  );
}
