"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useDragControls, type PanInfo } from "motion/react";
import type { ProjectRecord } from "@/lib/data-manager";

export default function ProjectReorderGrid({
  initialProjects,
  labels,
}: {
  initialProjects: ProjectRecord[];
  labels: {
    saving: string;
    save: string;
    saved: string;
    dragHint: string;
  };
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /** Directly swaps the two projects' positions — never shifts/pushes the rest. */
  function swap(slugA: string, slugB: string) {
    if (slugA === slugB) return;
    setProjects((prev) => {
      const i = prev.findIndex((p) => p.slug === slugA);
      const j = prev.findIndex((p) => p.slug === slugB);
      if (i === -1 || j === -1) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  }

  function handleDragEnd(slug: string, info: PanInfo) {
    setDraggingSlug(null);
    // info.point is page-relative; getBoundingClientRect is viewport-relative —
    // subtract the scroll offset so the hit-test lines up correctly.
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;

    for (const [otherSlug, el] of Object.entries(cardRefs.current)) {
      if (otherSlug === slug || !el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        swap(slug, otherSlug);
        return;
      }
    }
    // Dropped on empty space (no other project there) — snaps back, nothing changes.
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: projects.map((p) => p.slug) }),
      });
      if (!res.ok) throw new Error("Save failed");
      setDirty(false);
    } catch {
      alert("Save failed");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-stone-500">{labels.dragHint}</p>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="border border-graphite-900 bg-graphite-900 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? labels.saving : dirty ? labels.save : labels.saved}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
        {projects.map((project) => (
          <ProjectReorderCard
            key={project.slug}
            project={project}
            isDragging={draggingSlug === project.slug}
            registerRef={(el) => { cardRefs.current[project.slug] = el; }}
            onDragStart={() => setDraggingSlug(project.slug)}
            onDragEnd={(info) => handleDragEnd(project.slug, info)}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectReorderCard({
  project,
  isDragging,
  registerRef,
  onDragStart,
  onDragEnd,
}: {
  project: ProjectRecord;
  isDragging: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  onDragStart: () => void;
  onDragEnd: (info: PanInfo) => void;
}) {
  const controls = useDragControls();
  const name = project.translations.en.name;

  return (
    <motion.div
      ref={registerRef}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.15}
      dragSnapToOrigin
      onDragStart={onDragStart}
      onDragEnd={(_, info) => onDragEnd(info)}
      layout
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      style={{ zIndex: isDragging ? 50 : 1, position: "relative" }}
      whileDrag={{ scale: 1.05, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.35)" }}
      className="group flex h-full flex-col select-none"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="relative aspect-[4/5] touch-none cursor-grab overflow-hidden rounded-sm border border-stone-200 active:cursor-grabbing dark:border-line-200"
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="pointer-events-none object-cover"
          />
        ) : (
          <div className="h-full w-full bg-paper-200" />
        )}
        {/* Drag handle indicator */}
        <div className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-sm backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-heading text-sm text-graphite-900">{name}</h3>
      </div>
    </motion.div>
  );
}
