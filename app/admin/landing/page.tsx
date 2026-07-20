"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminLang } from "../_components/AdminLangContext";
import { getAdminT } from "../_components/adminI18n";
import type { LandingData } from "@/lib/data-manager";

export default function LandingAdminPage() {
  const { lang } = useAdminLang();
  const T   = getAdminT(lang).landing;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [data, setData] = useState<LandingData>({
    headline: "GrayArc",
    subline: "Architecture. Heritage. Vision.",
    loop: true,
    videos: [
      { id: "1", url: "", title: "Video 1" },
      { id: "2", url: "", title: "Video 2" },
      { id: "3", url: "", title: "Video 3" },
    ],
  });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/landing")
      .then((r) => r.json())
      .then((d) => { setData(d as LandingData); setLoading(false); });
  }, []);

  async function save(updated: LandingData) {
    setSaving(true);
    await fetch("/api/admin/landing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setData(updated);
    setSaving(false);
  }

  async function uploadVideo(videoId: string, file: File) {
    setUploading(videoId);
    const form = new FormData();
    form.append("file", file);
    const res  = await fetch("/api/admin/landing/upload", { method: "POST", body: form });
    const json = await res.json() as { url?: string; error?: string };
    if (json.url) {
      const updated: LandingData = {
        ...data,
        videos: data.videos.map((v) => v.id === videoId ? { ...v, url: json.url! } : v),
      };
      await save(updated);
    } else {
      alert(json.error ?? T.uploadFailed);
    }
    setUploading(null);
  }

  function removeVideo(videoId: string) {
    save({ ...data, videos: data.videos.map((v) => v.id === videoId ? { ...v, url: "" } : v) });
  }

  if (loading) return <div className="p-8 text-sm text-stone-500">Loading…</div>;

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 border-b border-stone-200 pb-6 dark:border-line-200">
        <h1 className="text-2xl font-semibold text-graphite-900">{T.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{T.desc}</p>
      </div>

      {/* Texts */}
      <div className="mb-8 rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">{T.textsSection}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-stone-500">Headline</label>
            <input
              value={data.headline}
              onChange={(e) => setData({ ...data, headline: e.target.value })}
              onBlur={() => save(data)}
              dir="ltr"
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">Subline</label>
            <input
              value={data.subline}
              onChange={(e) => setData({ ...data, subline: e.target.value })}
              onBlur={() => save(data)}
              dir="ltr"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Loop toggle */}
      <div className="mb-8 rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-graphite-900">{T.loopTitle}</h2>
            <p className="mt-0.5 text-xs text-stone-500">{T.loopDesc}</p>
          </div>
          <button
            onClick={() => save({ ...data, loop: !data.loop })}
            disabled={saving}
            className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
              data.loop ? "bg-graphite-900" : "bg-stone-300 dark:bg-stone-500"
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                data.loop ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Videos */}
      <div className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">{T.videosSection}</h2>
        <div className="space-y-4">
          {data.videos.map((video, index) => (
            <div key={video.id} className="rounded-sm border border-stone-100 p-4 dark:border-line-200">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Video {index + 1}</span>
                {video.url && (
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="text-xs text-red-400 hover:text-red-600 hover:underline"
                  >
                    {T.remove}
                  </button>
                )}
              </div>

              {video.url ? (
                <div>
                  <video src={video.url} className="mb-3 h-40 w-full rounded-sm object-cover" controls muted />
                  <p className="truncate text-xs text-stone-400" dir="ltr">{video.url}</p>
                </div>
              ) : (
                <div
                  onClick={() => fileRefs.current[video.id]?.click()}
                  className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-graphite-900 hover:text-graphite-900 dark:border-line-300 dark:text-stone-500 dark:hover:border-graphite-900 dark:hover:text-graphite-900"
                >
                  {uploading === video.id ? (
                    <span className="text-sm">{T.uploading}</span>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      <span className="text-sm">{T.upload}</span>
                      <span className="text-xs">{T.uploadHint}</span>
                    </>
                  )}
                </div>
              )}

              <input
                ref={(el) => { fileRefs.current[video.id] = el; }}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadVideo(video.id, file);
                  e.target.value = "";
                }}
              />

              {video.url && (
                <button
                  onClick={() => fileRefs.current[video.id]?.click()}
                  disabled={uploading === video.id}
                  className="mt-2 text-xs text-stone-500 hover:underline"
                >
                  {uploading === video.id ? T.uploading : T.replace}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
