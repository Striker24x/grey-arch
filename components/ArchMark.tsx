export default function ArchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Large square with quarter-circle arc cut from bottom-right corner */}
      <path
        d="M27.98 0 V15.99 C26.15,15.99 24.36,16.19 22.65,16.57 C16.35,17.95 11.29,21.76 9.13,26.65 C8.40,28.31 7.99,30.11 7.99,32 H0 V0 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      {/* Small rectangle at bottom-right */}
      <path
        d="M27.98 15.99 H36 V32 H27.98 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      {/* Gray wedge accent at arc intersection */}
      <path
        d="M22.09 22.21 V26.74 H15.96 C17.36,24.70 19.52,23.09 22.09,22.21 Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </svg>
  );
}
