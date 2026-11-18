import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import FontProvider from "@/components/FontProvider";
import ThemeSync from "@/components/ThemeSync";
import { locales, hasLocale, pageAlternates, SITE_URL } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";
import { getNavigation } from "@/lib/data-manager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Serif display face for the new landing/studio design (ga-* classes only).
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// All page content is admin-editable and stored in the database (read directly
// via MongoDB, not fetch). Without this, Next.js treats these pages as static
// and caches them at build time, so admin edits (texts and cover images) never
// appear on the deployed site. Forcing dynamic rendering makes every page
// reflect the current DB state on each request.
export const dynamic = "force-dynamic";

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
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s — ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    keywords: [
      "Ingenieurbüro Berlin",
      "engineering office Berlin",
      "Tragwerksplanung",
      "structural design",
      "HOAI",
      "BIM",
      "Bauantrag",
      "building permit",
      "Ausführungsplanung",
      "construction drawings",
      "Denkmalpflege",
      "heritage conservation",
    ],
    alternates: pageAlternates(lang, ""),
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
  const navConfig = (await getNavigation()).items;

  return (
    <html
      lang={lang}
      dir="ltr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerifDisplay.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-paper-100 text-ink">
          <ThemeSync />
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
