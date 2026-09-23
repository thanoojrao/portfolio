import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/**
 * The pointer as an agent walking the grid. The native pointer stays; a trail of dots
 * is sampled behind it, and each dot flies to the nearest node of the background
 * lattice, glows there, then fades. Explore mode keeps a longer trail.
 * Disabled on touch devices and under reduced motion.
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

  // 1. decide whether to run at all (mouse present, motion allowed)
  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(fine);
  }, [reduce]);

  // 2. once the canvas is in the DOM, wire the pointer and the draw loop
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

    // a trail point starts at the pointer and settles onto the nearest lattice node
    type Pt = { x0: number; y0: number; nx: number; ny: number; t: number };
    const trail: Pt[] = [];
    const byNode = new Map<string, Pt>();
    let lastX = -1e9;
    let lastY = -1e9;

    const onMove = (e: PointerEvent) => {
      // sample a trail point every few pixels of travel
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy > 144) {
        lastX = e.clientX;
        lastY = e.clientY;
        const nx = Math.round((e.clientX - OFF) / CELL) * CELL + OFF;
        const ny = Math.round((e.clientY - OFF) / CELL) * CELL + OFF;
        const key = `${nx},${ny}`;
        const existing = byNode.get(key);
        if (existing) {
          existing.t = performance.now(); // re-light a node we just visited
        } else {
          const p: Pt = { x0: e.clientX, y0: e.clientY, nx, ny, t: performance.now() };
          trail.push(p);
          byNode.set(key, p);
          if (trail.length > 140) {
            const gone = trail.splice(0, trail.length - 140);
            for (const g of gone) byNode.delete(`${g.nx},${g.ny}`);
          }
        }
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);
      if (!trail.length) return;
      const now = performance.now();
      const explore = modeRef.current === "explore";
      const rgb = explore ? "245,185,66" : "61,220,132";
      const life = explore ? 1800 : 1000;
      const settle = 0.28; // fraction of life spent flying to the node
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        const age = (now - p.t) / life;
        if (age >= 1) {
          trail.splice(i, 1);
          byNode.delete(`${p.nx},${p.ny}`);
          continue;
        }
        // ease-out flight from the pointer position to the lattice node
        const f = Math.min(1, age / settle);
        const e = 1 - (1 - f) * (1 - f) * (1 - f);
        const x = p.x0 + (p.nx - p.x0) * e;
        const y = p.y0 + (p.ny - p.y0) * e;
        // brightness: peaks as it lands, then fades
        const glow = age < settle ? 0.55 + 0.45 * f : 1 - (age - settle) / (1 - settle);
        const r = 1.2 + 2.2 * glow;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.9 * glow})`;
        ctx.fill();
        if (age >= settle) {
          // soft halo on the node
          ctx.beginPath();
          ctx.arc(x, y, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${0.18 * glow})`;
          ctx.fill();
        }
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
}
