"use client";

import { usePathname } from "next/navigation";

export default function ConditionalFooter({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === `/${lang}` || pathname === `/${lang}/`;
  if (isLanding) return null;
  return <>{children}</>;
}
