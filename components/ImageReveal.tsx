"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function ImageReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible — no flash of clipped content before JS runs
  const [visible, setVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    // Only run the clip animation for images starting below the fold
    if (rect.top >= window.innerHeight) {
      setVisible(false);
      setShouldAnimate(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-paper-200 ${className}`}>
      <div
        className={`absolute inset-0 transition-[clip-path] duration-[1000ms] ease-out ${
          visible ? "[clip-path:inset(0_0_0%_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
