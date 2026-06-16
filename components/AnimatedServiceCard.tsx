"use client";

import type { ReactNode } from "react";
import AnimatedReveal from "./AnimatedReveal";

export default function AnimatedServiceCard({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedReveal variant="card" delay={delay} className="h-full">
      {children}
    </AnimatedReveal>
  );
}
