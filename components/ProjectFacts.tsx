export default function ProjectFacts({
  title,
  facts,
}: {
  title?: string;
  facts: { label: string; value: string }[];
}) {
  return (
    <div className="border border-line-300 bg-paper-50 p-6">
      {title ? (
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
          {title}
        </h3>
      ) : null}
      <dl className={title ? "mt-4 flex flex-col gap-3" : "flex flex-col gap-3"}>
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={`flex items-baseline justify-between gap-4 ${
              index === 0 ? "" : "border-t border-line-200 pt-3"
            }`}
          >
            <dt className="text-xs uppercase tracking-wide text-stone-500">{fact.label}</dt>
            <dd className="text-end text-sm text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
