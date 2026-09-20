import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/**
 * The cursor as an agent walking the grid.
 * - The native pointer is hidden. A small accent dot IS the pointer (no lag).
 * - A trail of dots is sampled behind it; each dot flies to the nearest node of the
 *   background lattice, glows there, then fades back. The path lights up the lattice.
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

    // a trail point starts at the pointer and settles onto the nearest lattice node
    type Pt = { x0: number; y0: number; nx: number; ny: number; t: number };
    const trail: Pt[] = [];
    const byNode = new Map<string, Pt>();
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
    const onLeave = () => setShown(false);
    const onEnter = () => setShown(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

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
