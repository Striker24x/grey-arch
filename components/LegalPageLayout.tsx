export default function LegalPageLayout({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <h1 className="font-heading text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-sm text-stone-500">{updated}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.heading} className="border-t border-line-200 pt-6">
            <h2 className="font-heading text-lg text-ink">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
