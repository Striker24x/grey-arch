import Link from "next/link";
import { getProjects } from "@/lib/data-manager";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Projects</h1>
          <p className="mt-1 text-sm text-stone-500">{projects.length} projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="border border-graphite-900 bg-graphite-900 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          + Add project
        </Link>
      </div>

      <div className="rounded-sm border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">Categories</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.slug} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-graphite-900">{p.translations.en.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{p.slug}</td>
                <td className="px-4 py-3 text-stone-500">{p.year}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.categories.slice(0, 3).map((c) => (
                      <span key={c} className="rounded-sm bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600">
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/projects/${p.slug}`}
                    className="text-xs font-medium text-graphite-900 hover:underline"
                  >
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
