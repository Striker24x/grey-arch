"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Dictionary } from "@/lib/dictionary-types";

export default function ApplicationForm({
  jobId,
  form,
}: {
  jobId: string;
  form: Dictionary["careers"]["form"];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(event.currentTarget);
      fd.set("jobId", jobId);
      const res = await fetch("/api/apply", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError(form.errorBody);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="py-10 text-center"
        >
          <p className="font-heading text-2xl text-ink">{form.successTitle}</p>
          <p className="mt-3 text-sm text-stone-600">{form.successBody}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-6"
        >
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.name} htmlFor="name">
              <input id="name" name="name" type="text" required className={inputClass} />
            </Field>
            <Field label={form.email} htmlFor="email">
              <input id="email" name="email" type="email" required className={inputClass} />
            </Field>
          </div>

          <Field label={form.phone} htmlFor="phone">
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </Field>

          <Field label={form.message} htmlFor="message">
            <textarea id="message" name="message" rows={5} placeholder={form.messagePlaceholder} className={inputClass} />
          </Field>

          <Field label={form.resume} htmlFor="resume">
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full border border-line-300 bg-paper-50 px-4 py-2.5 text-sm text-ink outline-none file:mr-4 file:border-0 file:bg-graphite-900 file:px-3 file:py-1.5 file:text-xs file:text-paper-100"
            />
            <p className="text-xs text-stone-500">{form.resumeHint}</p>
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-fit cursor-pointer items-center gap-2 bg-graphite-900 px-7 py-3 text-sm text-paper-100 transition-[background-color,transform,opacity] duration-200 hover:bg-bronze-600 active:scale-[0.97] disabled:opacity-70"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {loading ? form.submitting : form.submit}
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
