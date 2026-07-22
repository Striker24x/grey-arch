"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

export interface PizzaSection {
  label: string;
  href: string;
}

const SIZE = 250;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 108;   // outer radius
const IR = 30;   // inner radius (donut hole)

function polarXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const os = polarXY(startDeg, R);
  const oe = polarXY(endDeg, R);
  const is_ = polarXY(startDeg, IR);
  const ie = polarXY(endDeg, IR);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${is_.x.toFixed(2)} ${is_.y.toFixed(2)}`,
    `L ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${R} ${R} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${IR} ${IR} 0 ${large} 0 ${is_.x.toFixed(2)} ${is_.y.toFixed(2)}`,
    `Z`,
  ].join(" ");
}

function splitLabel(text: string): [string, string | null] {
  if (text.length <= 9) return [text, null];
  const sp = text.indexOf(" ");
  if (sp > 0) return [text.slice(0, sp), text.slice(sp + 1)];
  const m = Math.ceil(text.length / 2);
  return [text.slice(0, m) + "-", text.slice(m)];
}

export default function PizzaWheel({
  sections,
  onNavigate,
  centerLabel,
}: {
  sections: PizzaSection[];
  onNavigate: () => void;
  centerLabel: string;
}) {
  const router = useRouter();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const n = sections.length;
  const sweep = 360 / n;

  function handleClick(href: string) {
    router.push(href);
    onNavigate();
  }

  return (
    <motion.div
      initial={{ scale: 0.1, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.1, opacity: 0, rotate: -10 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.8 }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ overflow: "visible" }}
      >
        {/* Outer ring border */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(196,157,110,0.25)"
          strokeWidth="1"
        />

        {/* Slices */}
        {sections.map((sec, i) => {
          const startDeg = i * sweep;
          const endDeg = (i + 1) * sweep;
          const midDeg = startDeg + sweep / 2;
          const labelR = (R + IR) / 2 + 6;
          const lPos = polarXY(midDeg, labelR);
          const hovered = hoveredIdx === i;
          const [line1, line2] = splitLabel(sec.label);
          const fontSize = sec.label.length > 11 ? 7.5 : sec.label.length > 8 ? 8.5 : 9.5;

          return (
            <motion.g
              key={sec.href}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06 + i * 0.06, duration: 0.2 }}
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(sec.href)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Slice fill */}
              <motion.path
                d={arcPath(startDeg, endDeg)}
                stroke="rgba(196,157,110,0.3)"
                strokeWidth="0.8"
                animate={{
                  fill: hovered
                    ? "rgba(171,124,73,0.72)"
                    : "rgba(26,24,21,0.78)",
                }}
                transition={{ duration: 0.18 }}
              />

              {/* Label */}
              <text
                x={lPos.x}
                y={lPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={hovered ? "#fdfcfa" : "#a59c8c"}
                fontSize={fontSize}
                fontFamily="var(--font-inter, sans-serif)"
                letterSpacing="0.07em"
                style={{
                  pointerEvents: "none",
                  textTransform: "uppercase",
                  transition: "fill 0.15s",
                }}
              >
                {line2 ? (
                  <>
                    <tspan x={lPos.x} dy="-0.55em">{line1}</tspan>
                    <tspan x={lPos.x} dy="1.1em">{line2}</tspan>
                  </>
                ) : (
                  line1
                )}
              </text>

              {/* Divider line from center */}
              {i > 0 && (
                <line
                  x1={polarXY(startDeg, IR).x}
                  y1={polarXY(startDeg, IR).y}
                  x2={polarXY(startDeg, R).x}
                  y2={polarXY(startDeg, R).y}
                  stroke="rgba(196,157,110,0.3)"
                  strokeWidth="0.8"
                  style={{ pointerEvents: "none" }}
                />
              )}
            </motion.g>
          );
        })}

        {/* Center dot */}
        <circle
          cx={CX} cy={CY} r={IR}
          fill="rgba(26,24,21,0.92)"
          stroke="rgba(196,157,110,0.5)"
          strokeWidth="1"
        />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(196,157,110,0.7)"
          fontSize={6.5}
          fontFamily="var(--font-inter, sans-serif)"
          letterSpacing="0.14em"
          style={{ textTransform: "uppercase", pointerEvents: "none" }}
        >
          {centerLabel.slice(0, 7).toUpperCase()}
        </text>
      </svg>
    </motion.div>
  );
}
