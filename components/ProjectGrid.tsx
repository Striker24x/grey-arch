"use client";

import { AnimatePresence, motion } from "motion/react";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/dictionary-types";

export default function ProjectGrid({
  projects,
  lang,
  viewLabel,
  singleColumn = false,
}: {
  projects: Project[];
  lang: string;
  viewLabel: string;
  singleColumn?: boolean;
}) {
  if (projects.length === 0) return null;

  return (
    <div className={singleColumn ? "grid gap-y-12" : "grid gap-x-8 gap-y-16 sm:grid-cols-2"}>
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <motion.div
            key={project.slug}
            layout
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.25,
              delay: (index % 3) * 0.05,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <ProjectCard
              project={project}
              lang={lang}
              viewLabel={viewLabel}
              priority={index < 3}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
