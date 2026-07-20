import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import { getLanding } from "@/lib/data-manager";
import VideoLanding from "@/components/VideoLanding";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const landing = getLanding();

  return <VideoLanding landing={landing} lang={lang as Locale} />;
}
