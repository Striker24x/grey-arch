"use client";

/** Renders the site footer on every public page (including the landing page, which
 * used to hide it while it was a full-screen video slider). Kept as a wrapper so the
 * layout API stays unchanged. */
export default function ConditionalFooter({
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
