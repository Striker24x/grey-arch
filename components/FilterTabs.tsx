"use client";

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
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          aria-pressed={active === option.key}
          className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 ${
            active === option.key
              ? "bg-graphite-900 text-paper-100"
              : "border border-line-300 text-stone-600 hover:border-graphite-800 hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
