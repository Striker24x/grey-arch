import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import LegalPageLayout from "@/components/LegalPageLayout";

// LEGAL — PLACEHOLDER CONTENT.
// All copy on this page (provider details, contact data, responsible party)
// must be replaced with verified, final information before this site goes
// live. In particular: using the protected German professional title
// "Architekt/in" requires registration with the competent Architektenkammer
// (chamber of architects) — confirm eligibility before this title is used
// anywhere on the site, not only on this page.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.legal.impressum.title,
    alternates: { languages: alternateLinks("/impressum") },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { impressum } = dict.legal;

  return (
    <LegalPageLayout
      title={impressum.title}
      updated={impressum.updated}
      sections={impressum.sections}
    />
  );
}
