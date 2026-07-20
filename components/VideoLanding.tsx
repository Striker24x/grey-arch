"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { LandingData } from "@/lib/data-manager";
import type { Locale } from "@/lib/i18n";

export default function VideoLanding({
  landing,
  lang: _lang,
}: {
  landing: LandingData;
  lang: Locale;
}) {
  const activeVideos = landing.videos.filter((v) => v.url);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || activeVideos.length === 0) return;
      const clamped = ((idx % activeVideos.length) + activeVideos.length) % activeVideos.length;
      if (clamped === currentIdx) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIdx(clamped);
        setTransitioning(false);
      }, 500);
    },
    [transitioning, activeVideos.length, currentIdx]
  );

  const goToNext = useCallback(() => {
    const isLast = currentIdx >= activeVideos.length - 1;
    if (isLast && !landing.loop) return;
    goTo(currentIdx + 1);
  }, [currentIdx, activeVideos.length, landing.loop, goTo]);

  const handleDragStart = (x: number) => { dragStartX.current = x; };
  const handleDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - x;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? currentIdx + 1 : currentIdx - 1);
    }
    dragStartX.current = null;
  };

  const currentVideo = activeVideos[currentIdx];

  return (
    <div
      className="relative flex min-h-[calc(100vh-56px)] cursor-grab select-none flex-col items-center justify-center overflow-hidden bg-graphite-900 active:cursor-grabbing"
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseUp={(e) => handleDragEnd(e.clientX)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
    >
      {/* Video background */}
      <AnimatePresence mode="sync">
        {currentVideo ? (
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <video
              src={currentVideo.url}
              autoPlay
              muted
              playsInline
              onEnded={goToNext}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-graphite-900"
          />
        )}
      </AnimatePresence>

      {/* Text overlay — only a subtle gradient at the bottom so text stays readable */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="relative z-10 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="font-heading text-5xl leading-tight text-white sm:text-7xl"
        >
          {landing.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="mt-4 text-lg tracking-wide text-white/80 sm:text-xl"
        >
          {landing.subline}
        </motion.p>
      </div>

      {/* Dot navigation */}
      {activeVideos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {activeVideos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation */}
      {activeVideos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(currentIdx - 1); }}
            className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Vorheriges Video"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(currentIdx + 1); }}
            className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Nächstes Video"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
