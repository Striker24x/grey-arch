"use client";

import { useState, useEffect } from "react";
import type { ContactInquiry } from "@/lib/data-manager";
import { useAdminLang } from "../_components/AdminLangContext";
import { getAdminT } from "../_components/adminI18n";

export default function InquiriesPage() {
  const { lang } = useAdminLang();
  const T = getAdminT(lang).inquiries;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((d) => setInquiries(d as ContactInquiry[]))
      .finally(() => setLoading(false));
  }, []);

  async function markReviewed(id: string) {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    });
    if (res.ok) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: "reviewed" } : i)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(T.confirmDelete)) return;
    await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
    if (viewingAttachment === id) setViewingAttachment(null);
  }

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">{T.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{T.subtitle(inquiries.length, newCount)}</p>
        </div>
      </div>

      <div className="rounded-sm border border-stone-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">{T.loading}</p>
        ) : inquiries.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">{T.empty}</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {inquiries.map((i) => (
              <div key={i.id}>
                <button
                  onClick={() => setExpanded(expanded === i.id ? null : i.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    {i.status === "new" && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-bronze-500" title={T.new} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-graphite-900">{i.name}</p>
                      <p className="text-xs text-stone-500">
                        {i.email} · {new Date(i.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-stone-400">{expanded === i.id ? "▲" : "▼"}</span>
                </button>

                {expanded === i.id && (
                  <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-stone-500">{T.email}</p>
                        <a href={`mailto:${i.email}`} className="text-graphite-900 hover:underline">{i.email}</a>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500">{T.phone}</p>
                        <p className="text-graphite-900">{i.phone || "—"}</p>
                      </div>
                    </div>
                    {i.message && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-stone-500">{T.message}</p>
                        <p className="mt-1 whitespace-pre-wrap text-graphite-900">{i.message}</p>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {i.attachmentUrl ? (
                        <button
                          onClick={() => setViewingAttachment(viewingAttachment === i.id ? null : i.id)}
                          className="btn-secondary text-xs"
                        >
                          {viewingAttachment === i.id ? T.hideAttachment : T.viewAttachment}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400">{T.noAttachment}</span>
                      )}
                      {i.status === "new" && (
                        <button onClick={() => markReviewed(i.id)} className="btn-secondary text-xs">
                          {T.markReviewed}
                        </button>
                      )}
                      <button onClick={() => handleDelete(i.id)} className="text-xs text-red-500 hover:underline">
                        {T.delete}
                      </button>
                    </div>

                    {viewingAttachment === i.id && i.attachmentUrl && (
                      <iframe
                        src={`/api/admin/inquiries/${i.id}/attachment`}
                        className="mt-4 h-[70vh] w-full rounded-sm border border-stone-200 bg-white"
                        title={`${i.name} — attachment`}
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
