"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary-types";

export default function ContactForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { form } = dict.connect;
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get("service") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // NOTE: no backend is wired up yet — submission is handled client-side
  // only. Connect this to a real endpoint (email service, CRM, etc.)
  // before going live.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="border border-line-300 bg-paper-50 p-10 text-center"
        >
          <p className="font-heading text-2xl text-ink">
            {lang === "de"
              ? "Vielen Dank für Ihre Anfrage."
              : lang === "ar"
                ? "شكراً لك على تواصلك معنا."
                : "Thank you for your inquiry."}
          </p>
          <p className="mt-3 text-sm text-stone-600">
            {lang === "de"
              ? "Wir melden uns in Kürze persönlich bei Ihnen."
              : lang === "ar"
                ? "سنتواصل معك شخصياً في أقرب وقت ممكن."
                : "We will respond to you personally as soon as possible."}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.name} htmlFor="name">
              <input id="name" name="name" type="text" required className={inputClass} />
            </Field>
            <Field label={form.email} htmlFor="email">
              <input id="email" name="email" type="email" required className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.phone} htmlFor="phone">
              <input id="phone" name="phone" type="tel" className={inputClass} />
            </Field>
            <Field label={form.preferredLanguage} htmlFor="preferredLanguage">
              <select id="preferredLanguage" name="preferredLanguage" defaultValue={lang} className={inputClass}>
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {localeNames[locale]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={form.projectType} htmlFor="projectType">
            <select id="projectType" name="projectType" defaultValue="" className={inputClass}>
              <option value="" disabled>
                —
              </option>
              {form.projectTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.projectLocation} htmlFor="projectLocation">
              <input id="projectLocation" name="projectLocation" type="text" className={inputClass} />
            </Field>
            <Field label={form.requiredService} htmlFor="requiredService">
              <input
                id="requiredService"
                name="requiredService"
                type="text"
                defaultValue={prefilledService}
                className={inputClass}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="text-sm text-stone-600">{form.buildingStatus}</legend>
            <div className="mt-3 flex flex-wrap gap-6">
              {form.buildingStatusOptions.map((option, index) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="buildingStatus"
                    value={option}
                    defaultChecked={index === 0}
                    className="h-4 w-4 cursor-pointer accent-graphite-900"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.projectSize} htmlFor="projectSize">
              <input id="projectSize" name="projectSize" type="text" className={inputClass} />
            </Field>
            <Field label={form.budgetRange} htmlFor="budgetRange">
              <input id="budgetRange" name="budgetRange" type="text" className={inputClass} />
            </Field>
          </div>

          <Field label={form.message} htmlFor="message">
            <textarea id="message" name="message" rows={5} className={inputClass} />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-600">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 cursor-pointer accent-graphite-900"
            />
            {form.consent}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-fit cursor-pointer items-center gap-2 bg-graphite-900 px-7 py-3 text-sm text-paper-100 transition-[background-color,transform,opacity] duration-200 hover:bg-bronze-600 active:scale-[0.97] disabled:opacity-70"
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {form.submit}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  "w-full border border-line-300 bg-paper-50 px-4 py-2.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-graphite-800 focus:shadow-[0_0_0_3px_rgba(42,38,32,0.08)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm text-stone-600">
        {label}
      </label>
      {children}
    </div>
  );
}
