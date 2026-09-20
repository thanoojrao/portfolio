import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { mode } from "../store/policy";

/** Amber drift in Explore mode. Sits behind everything, fades in and out with the mode. */
export default function Particles() {
  const reduce = useReducedMotion();
  const m = useStore(mode);
  const ref = useRef<HTMLCanvasElement>(null);
  const alpha = useRef(0);
  const target = useRef(0);

  useEffect(() => {
    target.current = m === "explore" ? 1 : 0;
  }, [m]);

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type P = { x: number; y: number; vy: number; ph: number; r: number; a: number };
    let ps: P[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.floor((w * h) / 16000));
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vy: 0.12 + Math.random() * 0.25,
        ph: Math.random() * Math.PI * 2,
        r: 0.8 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.5,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      alpha.current += (target.current - alpha.current) * 0.04;
      if (alpha.current < 0.005 && target.current === 0) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      if (document.visibilityState !== "visible") return;
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy;
        p.x += Math.sin(t + p.ph) * 0.25;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,185,66,${p.a * alpha.current})`;
        ctx.fill();
      }
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  if (reduce) return null;
  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
}
