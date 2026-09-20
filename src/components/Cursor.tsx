import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/**
 * The cursor as an agent walking the grid.
 * - The native pointer is hidden. A small accent dot IS the pointer (no lag).
 * - A thin ring follows with a spring lag; it grows over interactive elements.
 * - Each 32px grid cell the pointer visits lights up and fades, leaving a trajectory.
 * Explore mode keeps a longer trail. Disabled on touch devices and under reduced motion.
 */

const CELL = 32;
const OFF = -1; // matches body background-position
const INTERACTIVE = "a, button, input, label, [role='radio'], [role='button'], svg g[style*='cursor']";

export default function Cursor() {
  const reduce = useReducedMotion();
  const m = useStore(mode);
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false); // over something clickable
  const [shown, setShown] = useState(false); // pointer inside the window
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(m);
  modeRef.current = m;

  // exact pointer position (the dot) and a lagged copy (the ring)
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.7 });
  const ry = useSpring(my, { stiffness: 260, damping: 24, mass: 0.7 });

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
    const cells: Cell[] = [];
    let lastKey = "";

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setShown(true);
      const target = e.target as Element | null;
      setHot(!!target?.closest?.(INTERACTIVE));
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
      if (!cells.length) return;
      const now = performance.now();
      const life = modeRef.current === "explore" ? 1700 : 900;
      const rgb = modeRef.current === "explore" ? "245,185,66" : "61,220,132";
      for (let i = cells.length - 1; i >= 0; i--) {
        const c = cells[i];
        const age = (now - c.t) / life;
        if (age >= 1) {
          cells.splice(i, 1);
          continue;
        }
        const a = (1 - age) * (1 - age) * 0.22;
        const x = c.cx * CELL + OFF;
        const y = c.cy * CELL + OFF;
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.fillRect(x + 1, y + 1, CELL - 1, CELL - 1);
        ctx.strokeStyle = `rgba(${rgb},${a * 1.6})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL, CELL);
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
      {/* lagged ring */}
      <motion.div
        aria-hidden="true"
        className="fixed z-[55] pointer-events-none rounded-full"
        style={{ x: rx, y: ry, left: -16, top: -16, width: 32, height: 32, border: "1px solid var(--accent)" }}
        animate={{ scale: shown ? (hot ? 1.5 : 1) : 0, opacity: shown ? (hot ? 0.9 : 0.55) : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
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
