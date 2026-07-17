import { notFound } from "next/navigation";
import { getProjects } from "@/lib/data-manager";
import ProjectForm from "../../_components/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="p-8">
      <div className="mb-6 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Edit project</h1>
        <p className="mt-1 font-mono text-xs text-stone-500">{slug}</p>
      </div>
      <ProjectForm initial={project} />
    </div>
  );
}
