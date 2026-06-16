export default function ArchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 27V16C5 9.92487 9.92487 5 16 5C22.0751 5 27 9.92487 27 16V27"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M5 27H27" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
