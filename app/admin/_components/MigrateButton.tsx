"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MigrateResult {
  migrated: number;
  skipped: number;
  errors: string[];
}

export default function MigrateButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MigrateResult | null>(null);
  const [error, setError] = useState("");

  async function handleMigrate() {
    if (
      !confirm(
        "Alle lokalen Bilder auf Cloudinary hochladen und URLs in der Datenbank aktualisieren?"
      )
    )
      return;

    setRunning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as MigrateResult;
      setResult(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration fehlgeschlagen");
    }

    setRunning(false);
  }

  return (
    <div className="mt-6 rounded-sm border border-stone-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-graphite-900">Cloudinary Migration</h2>
          <p className="mt-1 max-w-xl text-xs text-stone-500">
            Lädt alle lokalen Bilder aus{" "}
            <code className="rounded bg-stone-100 px-1">public/images/grey-arch/</code> auf
            Cloudinary hoch und ersetzt alle URL-Referenzen in der Datenbank. Bereits migrierte
            Bilder werden übersprungen.
          </p>
        </div>
        <button
          onClick={handleMigrate}
          disabled={running}
          className="btn-primary shrink-0"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Migriere…
            </span>
          ) : (
            "↑ Zu Cloudinary migrieren"
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-4 text-xs">
            <span className="text-emerald-600">
              ✓ {result.migrated} hochgeladen
            </span>
            <span className="text-stone-500">↷ {result.skipped} übersprungen</span>
            {result.errors.length > 0 && (
              <span className="text-red-500">✗ {result.errors.length} Fehler</span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="rounded-sm bg-red-50 p-3 text-xs text-red-600">
              {result.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
          {result.migrated > 0 && (
            <p className="text-xs text-stone-500">
              Die Website verwendet jetzt Cloudinary-URLs für alle Bilder.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
