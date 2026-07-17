import ProjectForm from "../../_components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="p-8">
      <div className="mb-6 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-semibold text-graphite-900">New project</h1>
        <p className="mt-1 text-sm text-stone-500">Fill in all languages before saving.</p>
      </div>
      <ProjectForm isNew />
    </div>
  );
}
