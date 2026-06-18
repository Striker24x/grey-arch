import Link from "next/link";
import AnimatedReveal from "./AnimatedReveal";
import HeroParallaxImage from "./HeroParallaxImage";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

export default function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { hero } = dict.home;

  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-graphite-900">
      <HeroParallaxImage src="/images/grey-arch/hero/hero-home.jpg" />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/55 to-graphite-900/15" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-44 lg:px-10">
        <AnimatedReveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-bronze-300">
            {hero.eyebrow}
          </p>
        </AnimatedReveal>
        <AnimatedReveal delay={80}>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.08] text-paper-100 sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
        </AnimatedReveal>
        <AnimatedReveal delay={160}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper-100/80">
            {hero.subheadline}
          </p>
        </AnimatedReveal>

        <AnimatedReveal delay={240}>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href={`/${lang}/services`}
              className="cursor-pointer bg-paper-100 px-6 py-3 text-sm text-graphite-900 transition-[color,background-color,transform] duration-200 hover:bg-bronze-400 active:scale-[0.97]"
            >
              {hero.ctaExplore}
            </Link>
            <Link
              href={`/${lang}/portfolio`}
              className="cursor-pointer border border-paper-100/70 px-6 py-3 text-sm text-paper-100 transition-[color,background-color,border-color,transform] duration-200 hover:border-paper-100 hover:bg-paper-100/10 active:scale-[0.97]"
            >
              {hero.ctaPortfolio}
            </Link>
            <Link
              href={`/${lang}/connect`}
              className="cursor-pointer self-center border-b border-paper-100/70 py-1 text-sm text-paper-100 transition-colors duration-200 hover:border-bronze-300 hover:text-bronze-300"
            >
              {hero.ctaStart}
            </Link>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={320}>
          <div className="mt-12 grid max-w-md grid-cols-1 gap-4 border border-paper-100/20 bg-graphite-900/40 p-6 backdrop-blur-sm sm:grid-cols-3 sm:gap-6">
            <div className="rounded-sm p-2 -m-2 transition-colors duration-200 hover:bg-paper-100/10">
              <p className="text-xs uppercase tracking-wide text-paper-100/55">
                {hero.factServiceLabel}
              </p>
              <p className="mt-1 text-sm text-paper-100">{hero.factServiceValue}</p>
            </div>
            <div className="rounded-sm p-2 -m-2 transition-colors duration-200 hover:bg-paper-100/10">
              <p className="text-xs uppercase tracking-wide text-paper-100/55">
                {hero.factFocusLabel}
              </p>
              <p className="mt-1 text-sm text-paper-100">{hero.factFocusValue}</p>
            </div>
            <div className="rounded-sm p-2 -m-2 transition-colors duration-200 hover:bg-paper-100/10">
              <p className="text-xs uppercase tracking-wide text-paper-100/55">
                {hero.factMethodLabel}
              </p>
              <p className="mt-1 text-sm text-paper-100">{hero.factMethodValue}</p>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
