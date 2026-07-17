"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArchMark from "@/components/ArchMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Falsches Passwort. Bitte erneut versuchen.");
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <ArchMark className="h-8 w-9 text-graphite-900" />
          <div>
            <p className="text-lg font-semibold text-graphite-900">GrayArc</p>
            <p className="text-xs text-stone-500">Admin Panel</p>
          </div>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-8">
          <h1 className="mb-6 text-xl font-semibold text-graphite-900">Anmelden</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-none border border-stone-300 bg-white px-3 py-2 text-sm text-graphite-900 outline-none focus:border-graphite-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full border border-graphite-900 bg-graphite-900 px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Wird angemeldet…" : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
