"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroParallaxImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.2}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute will-change-transform"
      style={{ inset: "-10% 0", height: "120%" }}
    >
      <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
    </div>
  );
}
