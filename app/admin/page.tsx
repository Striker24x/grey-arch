import Link from "next/link";
import { getProjects, getGallery, getTeam } from "@/lib/data-manager";
import MigrateButton from "./_components/MigrateButton";

export default async function AdminDashboard() {
  const [projects, gallery, team] = await Promise.all([
    getProjects(),
    getGallery(),
    getTeam(),
  ]);

  const stats = [
    { label: "Projects", count: projects.length, href: "/admin/projects", action: "/admin/projects/new", actionLabel: "Add project" },
    { label: "Gallery images", count: gallery.length, href: "/admin/gallery", action: "/admin/gallery", actionLabel: "Manage gallery" },
    { label: "Team members", count: team.length, href: "/admin/team", action: "/admin/team", actionLabel: "Manage team" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Übersicht aller Inhalte auf der Grey Arch Website.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-stone-200 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-graphite-900">{s.count}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href={s.href} className="text-xs text-stone-500 underline-offset-2 hover:underline">
                View all
              </Link>
              <span className="text-stone-300">·</span>
              <Link href={s.action} className="text-xs font-medium text-graphite-900 underline-offset-2 hover:underline">
                {s.actionLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <MigrateButton />

      <div className="mt-8 rounded-sm border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-graphite-900">Recent Projects</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="pb-2 text-left text-xs font-medium text-stone-500">Name (EN)</th>
              <th className="pb-2 text-left text-xs font-medium text-stone-500">Year</th>
              <th className="pb-2 text-left text-xs font-medium text-stone-500">Status</th>
              <th className="pb-2 text-right text-xs font-medium text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 5).map((p) => (
              <tr key={p.slug} className="border-b border-stone-50">
                <td className="py-2.5 text-graphite-900">{p.translations.en.name}</td>
                <td className="py-2.5 text-stone-500">{p.year}</td>
                <td className="py-2.5 text-stone-500">{p.translations.en.status}</td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/projects/${p.slug}`} className="text-xs text-graphite-900 hover:underline">
                    Edit
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
