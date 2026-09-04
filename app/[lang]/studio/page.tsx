import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { hasLocale, alternateLinks, localeDir } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getImageUrl } from "@/lib/image-url";
import { getStudio } from "@/lib/data-manager";
import { resolveServiceLayout } from "@/lib/service-layouts";
import { parseContentBlocks, pairContentBlocks } from "@/lib/parse-content-blocks";
import { PROJECT_LAYOUT_COMPONENTS } from "@/components/project-layouts/registry";
import AnimatedReveal from "@/components/AnimatedReveal";
import ImageReveal from "@/components/ImageReveal";

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
  const dir = localeDir(lang);
  const { studio } = dict;
  const studioData = await getStudio();
  const workspaceImageSrc = studioData.workspaceImage
    ?? await getImageUrl("/images/grey-arch/services/studio-workspace.jpg");
  const units = pairContentBlocks(parseContentBlocks(studio.body));
  const resolvedLayout = resolveServiceLayout(studioData.layout);
  const Layout = PROJECT_LAYOUT_COMPONENTS[resolvedLayout];
  const wrapperMaxWidth = resolvedLayout === "centered-stack" ? "" : "mx-auto max-w-4xl";

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-36 pb-28 lg:px-10 lg:pt-44 lg:pb-36">
        {/* dir="ltr" pins text always to the physical left / image always to the physical right,
         * regardless of page language — CSS grid otherwise auto-mirrors column order under
         * dir="rtl" (Arabic), which put the image on the left instead. */}
        <div className="grid items-center gap-12 lg:grid-cols-2" dir="ltr">
          <AnimatedReveal>
            <div dir={dir}>
              <h1 className="font-heading text-4xl leading-tight text-ink sm:text-5xl">
                {dict.nav.studio}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">
                {studio.intro}
              </p>
            </div>
          </AnimatedReveal>
          <ImageReveal className="aspect-[4/3]">
            <Image
              src={workspaceImageSrc}
              alt={studio.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>
      </section>

      {units.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className={wrapperMaxWidth}>
            <Layout units={units} projectName={studio.title} />
          </div>
        </section>
      )}
    </>
  );
}
