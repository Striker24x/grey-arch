import { getProjects, getTeam } from "@/lib/data-manager";
import DashboardContent from "./_components/DashboardContent";

export default async function AdminDashboard() {
  const [projects, team] = await Promise.all([
    getProjects(),
    getTeam(),
  ]);

  return (
    <DashboardContent
      projects={projects}
      teamCount={team.length}
    />
  );
}
