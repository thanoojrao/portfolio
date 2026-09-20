import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/**
 * The cursor as an agent walking the grid. A spring-lagged accent dot follows the
 * pointer, and each 32px grid cell it visits lights up and fades, leaving a trajectory.
 * Explore mode keeps a longer trail. Disabled on touch devices and under reduced motion.
 */

const CELL = 32;
const OFF = -1; // matches body background-position

export default function Cursor() {
  const reduce = useReducedMotion();
  const m = useStore(mode);
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(m);
  modeRef.current = m;

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const sx = useSpring(mx, { stiffness: 320, damping: 26, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 320, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

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
    let visible = false;

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      visible = true;
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
    const onLeave = () => {
      visible = false;
      mx.set(-100);
      my.set(-100);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

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
      void visible;
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce, mx, my]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />
      <motion.div
        aria-hidden="true"
        className="fixed z-[55] pointer-events-none rounded-full mix-blend-screen"
        style={{
          x: sx,
          y: sy,
          left: -5,
          top: -5,
          width: 10,
          height: 10,
          background: "var(--accent)",
          boxShadow: "0 0 14px 2px rgb(var(--accent-rgb) / 0.55)",
          transition: "background .5s, box-shadow .5s",
        }}
      />
    </>
  );
}
