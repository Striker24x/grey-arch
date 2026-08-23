"use client";

import { useState, useEffect } from "react";
import type { JobApplication } from "@/lib/data-manager";
import { useAdminLang } from "../_components/AdminLangContext";
import { getAdminT } from "../_components/adminI18n";

export default function ApplicationsPage() {
  const { lang } = useAdminLang();
  const T = getAdminT(lang).applications;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewingCv, setViewingCv] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then((d) => setApplications(d as JobApplication[]))
      .finally(() => setLoading(false));
  }, []);

  async function markReviewed(id: string) {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    });
    if (res.ok) {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: "reviewed" } : a)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(T.confirmDelete)) return;
    await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (expanded === id) setExpanded(null);
    if (viewingCv === id) setViewingCv(null);
  }

  const newCount = applications.filter((a) => a.status === "new").length;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">{T.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{T.subtitle(applications.length, newCount)}</p>
        </div>
      </div>

      <div className="rounded-sm border border-stone-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">{T.loading}</p>
        ) : applications.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">{T.empty}</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {applications.map((a) => (
              <div key={a.id}>
                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    {a.status === "new" && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-bronze-500" title={T.new} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-graphite-900">{a.name}</p>
                      <p className="text-xs text-stone-500">
                        {a.jobTitle} · {new Date(a.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-stone-400">{expanded === a.id ? "▲" : "▼"}</span>
                </button>

                {expanded === a.id && (
                  <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-stone-500">{T.email}</p>
                        <a href={`mailto:${a.email}`} className="text-graphite-900 hover:underline">{a.email}</a>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500">{T.phone}</p>
                        <p className="text-graphite-900">{a.phone || "—"}</p>
                      </div>
                    </div>
                    {a.message && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-stone-500">{T.message}</p>
                        <p className="mt-1 whitespace-pre-wrap text-graphite-900">{a.message}</p>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {a.resumeUrl ? (
                        <button
                          onClick={() => setViewingCv(viewingCv === a.id ? null : a.id)}
                          className="btn-secondary text-xs"
                        >
                          {viewingCv === a.id ? T.hideCv : T.viewCv}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400">{T.noCv}</span>
                      )}
                      {a.status === "new" && (
                        <button onClick={() => markReviewed(a.id)} className="btn-secondary text-xs">
                          {T.markReviewed}
                        </button>
                      )}
                      <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:underline">
                        {T.delete}
                      </button>
                    </div>

                    {viewingCv === a.id && a.resumeUrl && (
                      <iframe
                        src={`/api/admin/applications/${a.id}/resume`}
                        className="mt-4 h-[70vh] w-full rounded-sm border border-stone-200 bg-white"
                        title={`${a.name} — CV`}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
