export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading mt-3 text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-base leading-relaxed text-stone-600">{intro}</p>
      ) : null}
    </div>
  );
}
