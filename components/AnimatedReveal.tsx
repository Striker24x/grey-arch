"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const DISTANCE: Record<string, string> = {
  text: "translate-y-3",
  card: "translate-y-6",
};

export default function AnimatedReveal({
  children,
  className = "",
  delay = 0,
  variant = "text",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "text" | "card";
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible — avoids flash of invisible content before JS hydrates
  const [visible, setVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    // Only animate elements that start below the fold
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
    <div
      ref={ref}
      style={{ transitionDelay: shouldAnimate && !visible ? `${delay}ms` : "0ms" }}
      className={`transition-[transform,opacity] duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${DISTANCE[variant]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
