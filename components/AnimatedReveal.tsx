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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[transform,opacity] duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${DISTANCE[variant]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
