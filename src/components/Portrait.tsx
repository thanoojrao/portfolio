import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { epsilon, mode } from "../store/policy";
import data from "../data/portrait.json";

/**
 * A portrait made of lattice points. No image ships: `portrait.json` is one brightness
 * value per grid node, derived offline from a photo.
 *
 * ε controls how well it resolves. Near 0 every dot sits on its node and the face is
 * sharp. As ε rises, dots wander toward random scatter positions and the face
 * dissolves. Exploitation converges, exploration scatters. The pointer nudges nearby
 * dots aside; they spring back.
 */

const { cols, rows, v } = data as { cols: number; rows: number; v: number[] };

type Dot = {
  gx: number; // grid column
  gy: number; // grid row
  val: number; // 0..1 brightness
  sx: number; // scatter offset (in cells)
  sy: number;
  ph: number; // drift phase
  x: number; // current position (px)
  y: number;
};

export default function Portrait() {
  const reduce = useReducedMotion();
  const eps = useStore(epsilon);
  const m = useStore(mode);
  const ref = useRef<HTMLCanvasElement>(null);
  const epsRef = useRef(eps);
  const modeRef = useRef(m);
  epsRef.current = eps;
  modeRef.current = m;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // build dots once, with a fixed random scatter target per dot
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const dots: Dot[] = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const val = v[gy * cols + gx] / 99;
        const a = rand() * Math.PI * 2;
        const r = 4 + rand() * 14;
        dots.push({ gx, gy, val, sx: Math.cos(a) * r, sy: Math.sin(a) * r, ph: rand() * Math.PI * 2, x: 0, y: 0 });
      }
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cell = 8;
    let W = 0;
    let H = 0;
    let repaint: (() => void) | null = null; // set once draw exists; resizing wipes the canvas
    const resize = () => {
      const cw = canvas.parentElement?.clientWidth ?? 380;
      cell = cw / cols;
      W = cw;
      H = rows * cell;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const d of dots) {
        d.x = d.gx * cell + cell / 2;
        d.y = d.gy * cell + cell / 2;
      }
      repaint?.();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // pointer, in canvas coordinates
    let px = -1e9;
    let py = -1e9;
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      px = e.clientX - b.left;
      py = e.clientY - b.top;
    };
    const onLeave = () => {
      px = -1e9;
      py = -1e9;
    };
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);

    let k = 0; // current scatter amount, eased toward target
    let t = 0;
    let raf = 0;

    const draw = () => {
      const explore = modeRef.current === "explore";
      const rgb = explore ? "245,185,66" : "61,220,132";
      // scatter target from ε: nothing below 0.15, full at 0.95
      const target = Math.max(0, Math.min(1, (epsRef.current - 0.15) / 0.8));
      k += (target - k) * 0.06;
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      const half = cell / 2;
      for (const d of dots) {
        const hx = d.gx * cell + half;
        const hy = d.gy * cell + half;
        if (d.val < 0.05) {
          // unlit lattice node, kept faint so the face reads against it
          ctx.fillStyle = "rgba(42,53,46,0.55)";
          ctx.fillRect(hx - 0.6, hy - 0.6, 1.2, 1.2);
          continue;
        }
        // scatter + drift while scattered
        const drift = k * 0.6 * Math.sin(t * 2 + d.ph);
        let x = hx + (d.sx * cell * k + drift * cell) * 1;
        let y = hy + (d.sy * cell * k + drift * cell * 0.7) * 1;
        // pointer repulsion
        const dx = x - px;
        const dy = y - py;
        const dist2 = dx * dx + dy * dy;
        const R = cell * 5;
        if (dist2 < R * R) {
          const dist = Math.sqrt(dist2) || 1;
          const push = (1 - dist / R) * cell * 2.2;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
        // ease toward the computed position so motion is smooth
        d.x += (x - d.x) * 0.25;
        d.y += (y - d.y) * 0.25;
        const r = cell * (0.08 + 0.34 * d.val);
        const a = 0.3 + 0.7 * d.val;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${a * (1 - k * 0.35)})`;
        ctx.fill();
      }
    };

    // first paint: dots start at home
    repaint = draw;
    for (const d of dots) {
      d.x = d.gx * cell + cell / 2;
      d.y = d.gy * cell + cell / 2;
    }
    draw();

    if (!reduce) {
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (document.visibilityState !== "visible") return;
        draw();
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div className="relative w-full max-w-[380px] mx-auto select-none" aria-label="portrait of Thanooj, drawn as lattice points">
      <canvas ref={ref} className="block w-full" />
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>
          render: <span className="accent">lattice</span>
        </span>
        <span>{eps < 0.5 ? "converged" : "scattering"}</span>
      </div>
    </div>
  );
}
