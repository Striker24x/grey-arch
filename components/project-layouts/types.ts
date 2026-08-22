import type { ContentUnit } from "@/lib/parse-content-blocks";

export interface ProjectLayoutProps {
  units: ContentUnit[];
  projectName: string;
}
