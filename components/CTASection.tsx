import Link from "next/link";

export default function CTASection({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body?: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="border-y border-line-200 bg-paper-100">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <h2 className="font-heading text-3xl text-ink sm:text-4xl">{title}</h2>
        {body ? (
          <p className="mt-4 text-base leading-relaxed text-stone-600">{body}</p>
        ) : null}
        <Link
          href={href}
          className="mt-8 inline-block cursor-pointer border border-ink px-7 py-3 text-sm text-ink transition-[color,background-color,transform] duration-200 hover:bg-ink hover:text-paper-100 active:scale-[0.97]"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
