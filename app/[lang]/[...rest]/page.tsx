import { notFound } from "next/navigation";

// Any /<lang>/<unknown path> lands here so the localized not-found page below
// renders inside the normal site layout (header, footer, theme, lang attr)
// instead of Next's bare default 404.
export default function CatchAll() {
  notFound();
}
