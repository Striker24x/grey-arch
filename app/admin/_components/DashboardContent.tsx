"use client";

import Link from "next/link";
import { useAdminLang } from "./AdminLangContext";
import { getAdminT } from "./adminI18n";

interface Project {
  slug: string;
  year: string;
  translations: { en: { name: string; status: string } };
}

interface Props {
  projects: Project[];
  galleryCount: number;
  teamCount: number;
}

export default function DashboardContent({ projects, galleryCount, teamCount }: Props) {
  const { lang } = useAdminLang();
  const T   = getAdminT(lang).dashboard;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const stats = [
    { label: T.projects, count: projects.length, href: "/admin/projects",   action: "/admin/projects/new", actionLabel: T.addProject   },
    { label: T.gallery,  count: galleryCount,    href: "/admin/gallery",    action: "/admin/gallery",      actionLabel: T.manageGallery},
    { label: T.team,     count: teamCount,       href: "/admin/team",       action: "/admin/team",         actionLabel: T.manageTeam   },
  ];

  return (
    <div className="p-8" dir={dir}>
      <div className="mb-8 border-b border-stone-200 pb-6 dark:border-line-200">
        <h1 className="text-2xl font-semibold text-graphite-900">{T.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{T.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-graphite-900">{s.count}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href={s.href} className="text-xs text-stone-500 underline-offset-2 hover:underline">
                {T.viewAll}
              </Link>
              <span className="text-stone-300 dark:text-stone-500">·</span>
              <Link href={s.action} className="text-xs font-medium text-graphite-900 underline-offset-2 hover:underline">
                {s.actionLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-stone-200 bg-white p-6 dark:border-line-200 dark:bg-paper-200">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">{T.recent}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 dark:border-line-200">
              <th className="pb-2 text-start text-xs font-medium text-stone-500">{T.colName}</th>
              <th className="pb-2 text-start text-xs font-medium text-stone-500">{T.colYear}</th>
              <th className="pb-2 text-start text-xs font-medium text-stone-500">{T.colStatus}</th>
              <th className="pb-2 text-end text-xs font-medium text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 5).map((p) => (
              <tr key={p.slug} className="border-b border-stone-50 dark:border-line-200">
                <td className="py-2.5 text-graphite-900">{p.translations.en.name}</td>
                <td className="py-2.5 text-stone-500">{p.year}</td>
                <td className="py-2.5 text-stone-500">{p.translations.en.status}</td>
                <td className="py-2.5 text-end">
                  <Link href={`/admin/projects/${p.slug}`} className="text-xs text-graphite-900 hover:underline">
                    {T.edit}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
