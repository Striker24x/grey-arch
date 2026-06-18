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
    <section className="border-y border-line-200 bg-graphite-900">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <h2 className="font-heading text-3xl text-paper-100 sm:text-4xl">{title}</h2>
        {body ? (
          <p className="mt-4 text-base leading-relaxed text-stone-300">{body}</p>
        ) : null}
        <Link
          href={href}
          className="mt-8 inline-block cursor-pointer border border-paper-100 px-7 py-3 text-sm text-paper-100 transition-[color,background-color,transform] duration-200 hover:bg-paper-100 hover:text-graphite-900 active:scale-[0.97]"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
