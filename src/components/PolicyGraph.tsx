import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { epsilon, mode, booted, hoverArm, useHydratedStore } from "../store/policy";
import { projects } from "../data/site";

/**
 * A live ε-greedy bandit. The centre node is the policy π; each arm is a project.
 * Every tick the policy pulls an arm: with probability ε a random one, otherwise the best.
 * Pulses travel along the edge and the arm's ring grows with its pull count.
 */

const W = 360;
const H = 300;
const C = { x: W / 2, y: H / 2 };
const R = 112;

const ARMS = projects.map((p, i) => {
  const a = -Math.PI / 2 + (i / projects.length) * Math.PI * 2;
  return {
    slug: p.slug,
    label: p.short ?? p.slug.split("-")[0].slice(0, 7),
    value: p.exploit,
    x: C.x + Math.cos(a) * R,
    y: C.y + Math.sin(a) * R,
  };
});
const BEST = ARMS.reduce((b, a) => (a.value > b.value ? a : b), ARMS[0]);

type Pulse = { id: number; to: number };

export default function PolicyGraph() {
  const reduce = useReducedMotion();
  const eps = useHydratedStore(epsilon, 0.1);
  const m = useHydratedStore(mode, "exploit");
  const isBooted = useStore(booted);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [counts, setCounts] = useState<number[]>(() => ARMS.map(() => 0));
  const [last, setLast] = useState<number>(-1);
  const idRef = useRef(0);
  const epsRef = useRef(eps);
  epsRef.current = eps;

  const hovered = useStore(hoverArm);
  const hoveredIdx = ARMS.findIndex((a) => a.slug === hovered);

  const fire = useCallback((to: number) => {
    const id = ++idRef.current;
    setPulses((p) => [...p.slice(-6), { id, to }]);
    setLast(to);
    window.setTimeout(() => {
      setCounts((c) => c.map((v, i) => (i === to ? v + 1 : v)));
      setPulses((p) => p.filter((x) => x.id !== id));
    }, 620);
  }, []);

  // the policy's own ε-greedy ticks
  useEffect(() => {
    if (reduce || !isBooted) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (hoverArm.get()) return; // a hovered arm takes over
      const explore = Math.random() < epsRef.current;
      const to = explore
        ? Math.floor(Math.random() * ARMS.length)
        : ARMS.findIndex((a) => a.slug === BEST.slug);
      fire(to);
    };
    const iv = window.setInterval(tick, m === "explore" ? 520 : 720);
    return () => clearInterval(iv);
  }, [reduce, isBooted, m, fire]);

  // hovering an arm (here or on a card) pulls it repeatedly
  useEffect(() => {
    if (reduce || hoveredIdx < 0) return;
    fire(hoveredIdx);
    const iv = window.setInterval(() => fire(hoveredIdx), 380);
    return () => clearInterval(iv);
  }, [hoveredIdx, reduce, fire]);

  const maxCount = useMemo(() => Math.max(1, ...counts), [counts]);

  return (
    <div className="relative w-full max-w-[360px] mx-auto select-none" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* edges */}
        {ARMS.map((a, i) => (
          <line
            key={a.slug}
            x1={C.x}
            y1={C.y}
            x2={a.x}
            y2={a.y}
            stroke={i === last ? "var(--accent)" : "var(--color-grid)"}
            strokeOpacity={i === last ? 0.9 : 1}
            strokeWidth={i === last ? 1.4 : 1}
            style={{ transition: "stroke .35s, stroke-width .35s" }}
          />
        ))}

        {/* pulses */}
        <AnimatePresence>
          {pulses.map((p) => (
            <motion.circle
              key={p.id}
              r={3.2}
              fill="var(--accent)"
              initial={{ cx: C.x, cy: C.y, opacity: 0 }}
              animate={{ cx: ARMS[p.to].x, cy: ARMS[p.to].y, opacity: 1 }}
              exit={{ opacity: 0, r: 9 }}
              transition={{ duration: 0.6, ease: [0.3, 0, 0.2, 1] }}
            />
          ))}
        </AnimatePresence>

        {/* arms */}
        {ARMS.map((a, i) => {
          const ring = 8 + (counts[i] / maxCount) * 12;
          const isBest = a.slug === BEST.slug;
          const isHover = i === hoveredIdx;
          return (
            <g
              key={a.slug}
              style={{ cursor: "pointer" }}
              data-cursor="pull"
              onMouseEnter={() => hoverArm.set(a.slug)}
              onMouseLeave={() => hoverArm.set(null)}
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              {/* generous hit area */}
              <circle cx={a.x} cy={a.y} r={26} fill="transparent" />
              <motion.circle
                cx={a.x}
                cy={a.y}
                fill="url(#glow)"
                animate={{
                  r: ring + (isHover ? 14 : 6),
                  opacity: isHover ? 0.9 : 0.25 + (counts[i] / maxCount) * 0.5,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
              <motion.circle
                cx={a.x}
                cy={a.y}
                fill="var(--color-ink)"
                stroke={isHover || (isBest && m === "exploit") ? "var(--accent)" : "var(--color-muted)"}
                strokeWidth={isHover ? 2 : isBest ? 1.6 : 1}
                animate={{ r: ring + (isHover ? 3 : 0) }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                style={{ transition: "stroke .5s" }}
              />
              <text
                x={a.x}
                y={a.y + ring + 14}
                textAnchor="middle"
                fontSize="10"
                fill={isHover ? "var(--accent)" : "var(--color-muted)"}
                fontFamily="inherit"
                style={{ transition: "fill .3s" }}
              >
                {a.label}
              </text>
              <text
                x={a.x}
                y={a.y + 3.5}
                textAnchor="middle"
                fontSize="9"
                fill="var(--color-text)"
                fontFamily="inherit"
              >
                {counts[i]}
              </text>
            </g>
          );
        })}

        {/* policy node */}
        <circle cx={C.x} cy={C.y} r={20} fill="var(--color-panel)" stroke="var(--accent)" strokeWidth={1.5} style={{ transition: "stroke .5s" }} />
        <motion.circle
          cx={C.x}
          cy={C.y}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          animate={reduce ? {} : { r: [20, 30], opacity: [0.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
        <text x={C.x} y={C.y + 5} textAnchor="middle" fontSize="14" fill="var(--color-text)" fontFamily="inherit">
          π
        </text>
      </svg>
      <div className="absolute top-0 left-0 text-[11px] text-muted leading-5">
        <div>
          policy: <span className="accent">ε-greedy</span>
        </div>
        <div>ε = {eps.toFixed(2)}</div>
      </div>
      <div className="absolute top-0 right-0 text-[11px] text-muted text-right leading-5">
        <div>arms: {ARMS.length}</div>
        <div>
          pulls: {counts.reduce((a, b) => a + b, 0)}
        </div>
      </div>
    </div>
  );
}
