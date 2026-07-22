import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import FontProvider from "@/components/FontProvider";
import { locales, hasLocale, localeDir, alternateLinks } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getNavigation } from "@/lib/data-manager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-ar",
  subsets: ["arabic"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s — ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    keywords: [
      "architect",
      "architecture office",
      "architectural planning",
      "building permit",
      "implementation planning",
      "construction drawings",
      "heritage conservation",
      "monument conservation",
      "existing building planning",
      "new construction planning",
      "interior design",
      "landscape design",
      "3D architectural modeling",
      "digital architecture",
    ],
    alternates: { languages: alternateLinks("") },
    openGraph: {
      siteName: dict.meta.siteName,
      title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      description: dict.meta.description,
      locale: lang,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const dir = localeDir(lang);
  const navConfig = getNavigation().items;

  return (
    <html
      lang={lang}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${notoNaskh.variable} ${notoSansArabic.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-paper-100 text-ink">
          <FontProvider />
          <Header lang={lang} dict={dict} navConfig={navConfig} />
          <main className="flex-1">{children}</main>
          <ConditionalFooter lang={lang}>
            <Footer lang={lang} dict={dict} />
          </ConditionalFooter>
      </body>
    </html>
  );
}
