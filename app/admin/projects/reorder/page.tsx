"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminLang } from "../../_components/AdminLangContext";
import { getAdminT } from "../../_components/adminI18n";
import ProjectReorderGrid from "../../_components/ProjectReorderGrid";
import type { ProjectRecord } from "@/lib/data-manager";

export default function ReorderProjectsPage() {
  const { lang } = useAdminLang();
  const T = getAdminT(lang).projectsReorder;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [projects, setProjects] = useState<ProjectRecord[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d as ProjectRecord[]));
  }, []);

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6 dark:border-line-200">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">{T.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-500">{T.desc}</p>
        </div>
        <Link
          href="/admin/projects"
          className="border border-stone-200 px-4 py-2 text-sm text-graphite-900 transition-colors hover:border-graphite-900 dark:border-line-200"
        >
          {T.back}
        </Link>
      </div>

      {projects === null ? (
        <div className="p-8 text-sm text-stone-500">Loading…</div>
      ) : (
        <ProjectReorderGrid
          initialProjects={projects}
          labels={{ saving: T.saving, save: T.save, saved: T.saved, dragHint: T.dragHint }}
        />
      )}
    </div>
  );
}
