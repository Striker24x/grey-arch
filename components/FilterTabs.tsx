"use client";

import { motion } from "motion/react";

export default function FilterTabs({
  options,
  active,
  onChange,
}: {
  options: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = active === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={isActive}
            className={`relative cursor-pointer px-4 py-2 text-sm transition-colors duration-150 active:scale-[0.97] ${
              isActive
                ? "text-paper-100"
                : "border border-line-300 text-stone-600 hover:border-graphite-800 hover:text-ink"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="filter-pill"
                className="absolute inset-0 bg-graphite-900"
                transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
