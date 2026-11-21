"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/client-upload";

export type ImageFieldLabels = {
  upload: string;
  replace: string;
  remove: string;
  uploading: string;
  uploadHint: string;
};

/** Click-to-upload image with preview, replace and remove (uploads go to R2 via the
 * shared client-upload helper). Same look as the fields in Admin → Landing Page. */
export default function AdminImageField({
  url,
  onChange,
  folder,
  labels,
  aspect = "aspect-[16/9]",
}: {
  url: string;
  onChange: (url: string) => void;
  folder: string;
  labels: ImageFieldLabels;
  aspect?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function handle(file: File) {
    setErr("");
    setProgress(0);
    try {
      onChange(await uploadToCloudinary(file, folder, setProgress));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    }
    setProgress(null);
  }

  return (
    <div>
      <div
        onClick={() => progress === null && ref.current?.click()}
        className={`relative ${aspect} w-full max-w-md cursor-pointer overflow-hidden rounded-sm border-2 border-dashed border-stone-200 dark:border-line-300`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-stone-400">
            <span className="text-sm">{labels.upload}</span>
            <span className="px-4 text-center text-xs">{labels.uploadHint}</span>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
            {labels.uploading} {progress}%
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <button type="button" onClick={() => ref.current?.click()} disabled={progress !== null} className="text-stone-600 hover:underline">
          {url ? labels.replace : labels.upload}
        </button>
        {url && (
          <button type="button" onClick={() => onChange("")} className="text-red-500 hover:underline">
            {labels.remove}
          </button>
        )}
      </div>
      {url && <p className="mt-1 truncate text-[11px] text-stone-400" dir="ltr">{url}</p>}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
