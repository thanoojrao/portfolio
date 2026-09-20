import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/**
 * The cursor as an agent walking the grid.
 * - The native pointer is hidden. A small accent dot IS the pointer (no lag).
 * - A trail of dots shrinks and fades behind it, like a sampled trajectory.
 * - Each 32px grid cell the pointer visits lights up faintly and fades.
 * - Over clickable elements a square reticle with corner brackets wraps the pointer.
 * Explore mode keeps a longer trail. Disabled on touch devices and under reduced motion.
 */

const CELL = 32;
const OFF = -1; // matches body background-position
const INTERACTIVE = "a, button, input, label, [role='radio'], [role='button'], svg g[style*='cursor']";

export default function Cursor() {
  const reduce = useReducedMotion();
  const m = useStore(mode);
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState<string | null>(null); // label of the clickable thing under the pointer, or null
  const [shown, setShown] = useState(false); // pointer inside the window
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(m);
  modeRef.current = m;

  // exact pointer position
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  // 1. decide whether to run at all (mouse present, motion allowed)
  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(fine);
  }, [reduce]);

  // 2. hide the native cursor while active
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor");
    return () => document.documentElement.classList.remove("custom-cursor");
  }, [enabled]);

  // 3. once the canvas is in the DOM, wire the pointer and the draw loop
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Cell = { cx: number; cy: number; t: number };
    type Pt = { x: number; y: number; t: number };
    const cells: Cell[] = [];
    const trail: Pt[] = [];
    let lastKey = "";
    let lastX = -1e9;
    let lastY = -1e9;

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setShown(true);
      const target = e.target as Element | null;
      const labelled = target?.closest?.("[data-cursor]") as HTMLElement | null;
      if (labelled) setHot(labelled.dataset.cursor || "click");
      else setHot(target?.closest?.(INTERACTIVE) ? "click" : null);
      // sample a trail point every few pixels of travel
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy > 36) {
        lastX = e.clientX;
        lastY = e.clientY;
        trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (trail.length > 80) trail.splice(0, trail.length - 80);
      }
      const cx = Math.floor((e.clientX - OFF) / CELL);
      const cy = Math.floor((e.clientY - OFF) / CELL);
      const key = `${cx},${cy}`;
      if (key !== lastKey) {
        lastKey = key;
        cells.push({ cx, cy, t: performance.now() });
        const max = modeRef.current === "explore" ? 60 : 28;
        if (cells.length > max) cells.splice(0, cells.length - max);
      }
    };
    const onLeave = () => setShown(false);
    const onEnter = () => setShown(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);
      if (!cells.length && !trail.length) return;
      const now = performance.now();
      const explore = modeRef.current === "explore";
      const life = explore ? 1700 : 900;
      const rgb = explore ? "245,185,66" : "61,220,132";
      for (let i = cells.length - 1; i >= 0; i--) {
        const c = cells[i];
        const age = (now - c.t) / life;
        if (age >= 1) {
          cells.splice(i, 1);
          continue;
        }
        const a = (1 - age) * (1 - age) * 0.14;
        const x = c.cx * CELL + OFF;
        const y = c.cy * CELL + OFF;
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.fillRect(x + 1, y + 1, CELL - 1, CELL - 1);
        ctx.strokeStyle = `rgba(${rgb},${a * 1.6})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL, CELL);
      }
      // trailing dots: newest is largest and brightest, older ones shrink and fade
      const dotLife = explore ? 1100 : 600;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        const age = (now - p.t) / dotLife;
        if (age >= 1) {
          trail.splice(i, 1);
          continue;
        }
        const k = 1 - age;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8 + 2.6 * k * k, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.85 * k * k})`;
        ctx.fill();
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled, mx, my]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />
      {/* square reticle on the pointer, only over clickable things */}
      <motion.div
        aria-hidden="true"
        className="fixed z-[55] pointer-events-none"
        style={{ x: mx, y: my, left: -18, top: -18, width: 36, height: 36 }}
        animate={{ scale: shown && hot ? 1 : 0.4, opacity: shown && hot ? 1 : 0, rotate: shown && hot ? 0 : 45 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
      >
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <span
            key={c}
            className="absolute w-2.5 h-2.5"
            style={{
              top: c[0] === "t" ? 0 : undefined,
              bottom: c[0] === "b" ? 0 : undefined,
              left: c[1] === "l" ? 0 : undefined,
              right: c[1] === "r" ? 0 : undefined,
              borderTop: c[0] === "t" ? "2px solid var(--accent)" : undefined,
              borderBottom: c[0] === "b" ? "2px solid var(--accent)" : undefined,
              borderLeft: c[1] === "l" ? "2px solid var(--accent)" : undefined,
              borderRight: c[1] === "r" ? "2px solid var(--accent)" : undefined,
            }}
          />
        ))}
      </motion.div>
      {/* action label */}
      <motion.div
        aria-hidden="true"
        className="fixed z-[56] pointer-events-none text-[11px] font-medium whitespace-nowrap"
        style={{ x: mx, y: my, left: 18, top: 10, color: "var(--accent)" }}
      >
        <motion.span
          className="inline-block"
          animate={{ opacity: shown && hot ? 1 : 0, x: shown && hot ? 0 : -6 }}
          transition={{ duration: 0.15 }}
        >
          <span className="text-muted">▸</span> {hot ?? ""}
        </motion.span>
      </motion.div>
      {/* the pointer */}
      <motion.div
        aria-hidden="true"
        className="fixed z-[56] pointer-events-none rounded-full"
        style={{
          x: mx,
          y: my,
          left: -4,
          top: -4,
          width: 8,
          height: 8,
          background: "var(--accent)",
          boxShadow: "0 0 12px 2px rgb(var(--accent-rgb) / 0.5)",
        }}
        animate={{ scale: shown ? (hot ? 0.5 : 1) : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      />
    </>
  );
}
