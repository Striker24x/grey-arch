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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
