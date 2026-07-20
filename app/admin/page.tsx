import { getProjects, getGallery, getTeam } from "@/lib/data-manager";
import DashboardContent from "./_components/DashboardContent";

export default async function AdminDashboard() {
  const [projects, gallery, team] = await Promise.all([
    getProjects(),
    getGallery(),
    getTeam(),
  ]);

  return (
    <DashboardContent
      projects={projects}
      galleryCount={gallery.length}
      teamCount={team.length}
    />
  );
}
