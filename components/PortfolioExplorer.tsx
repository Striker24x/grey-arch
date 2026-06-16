"use client";

import { useState } from "react";
import Link from "next/link";
import FilterTabs from "./FilterTabs";
import ProjectGrid from "./ProjectGrid";
import type { Project } from "@/lib/dictionary-types";
import type { Dictionary } from "@/lib/dictionary-types";

const FILTER_ORDER = [
  "all",
  "projects",
  "heritage",
  "conservation",
  "residential",
  "interior",
  "landscape",
  "planning",
  "modeling",
  "digitalArch",
] as const;

export default function PortfolioExplorer({
  projects,
  filters,
  lang,
  viewLabel,
}: {
  projects: Project[];
  filters: Dictionary["portfolio"]["filters"];
  lang: string;
  viewLabel: string;
}) {
  const [active, setActive] = useState<string>("all");

  const options = FILTER_ORDER.map((key) => ({ key, label: filters[key] }));
  const visible =
    active === "all" ? projects : projects.filter((p) => p.categories.includes(active));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-200 pb-6">
        <FilterTabs options={options} active={active} onChange={setActive} />
        <Link
          href={`/${lang}/gallery`}
          className="cursor-pointer whitespace-nowrap border border-line-300 px-4 py-2 text-sm text-stone-600 transition-colors duration-200 hover:border-graphite-800 hover:text-ink"
        >
          {filters.gallery}
        </Link>
      </div>
      <div className="mt-12">
        <ProjectGrid projects={visible} lang={lang} viewLabel={viewLabel} />
      </div>
    </div>
  );
}
