import AnimatedReveal from "./AnimatedReveal";

export default function ProcessTimeline({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title}>
          <AnimatedReveal delay={index * 70} className="border-t border-line-300 pt-5">
            <span className="font-heading text-sm text-bronze-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-heading text-lg text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {step.description}
            </p>
          </AnimatedReveal>
        </li>
      ))}
    </ol>
  );
}
