"use client";

import Link from "next/link";
import { useAdminLang } from "./AdminLangContext";
import { getAdminT } from "./adminI18n";

export default function ProjectsListActions() {
  const { lang } = useAdminLang();
  const T = getAdminT(lang).projectsList;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/admin/projects/reorder"
        className="border border-stone-200 px-4 py-2 text-sm text-graphite-900 transition-colors hover:border-graphite-900 dark:border-line-200"
      >
        {T.reorderButton}
      </Link>
      <Link
        href="/admin/projects/new"
        className="border border-graphite-900 bg-graphite-900 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
      >
        + Add project
      </Link>
    </div>
  );
}
