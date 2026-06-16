"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders purely decorative motion (e.g. background line/grid effects) only
 * when the user has not requested reduced motion. Unlike AnimatedReveal,
 * which still shows its content (just instantly) under reduced motion, this
 * wrapper omits non-essential decoration entirely.
 */
export default function MotionSafeWrapper({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!allowed) return null;
  return <>{children}</>;
}
