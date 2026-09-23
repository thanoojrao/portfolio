import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { epsilon, hydrate, mode, setEpsilon, setMode, useHydratedStore, type Mode } from "../store/policy";
import { profile } from "../data/site";
import Portrait from "./Portrait";

const CMD = "policy --epsilon";

function useTypewriter(text: string, start: boolean, speed = 42) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (!start || reduce) return;
    // time-based so throttled timers cannot stretch it out
    const t0 = performance.now();
    const iv = window.setInterval(() => {
      const i = Math.min(text.length, Math.floor((performance.now() - t0) / speed));
      setN(i);
      if (i >= text.length) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [start, text, speed, reduce]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

type Sweep = { id: number; x: number; y: number; color: string };

export default function Hero() {
  const reduce = useReducedMotion();
  const m = useHydratedStore(mode, "exploit");
  const eps = useHydratedStore(epsilon, 0.1);
  const [sweeps, setSweeps] = useState<Sweep[]>([]);
  const sweepId = useRef(0);

  useEffect(() => {
    hydrate();
  }, []);

  // the prompt types itself; everything below it is visible from the first paint
  const { shown, done } = useTypewriter(CMD, true);

  function switchMode(next: Mode, e: React.MouseEvent) {
    if (next === m) return;
    const color = next === "explore" ? "#f5b942" : "#3ddc84";
    const id = ++sweepId.current;
    setSweeps((s) => [...s, { id, x: e.clientX, y: e.clientY, color }]);
    setMode(next);
    window.setTimeout(() => setSweeps((s) => s.filter((x) => x.id !== id)), 900);
  }

  const greedy = eps < 0.5;

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24">
      {/* colour sweep on mode switch */}
      <AnimatePresence>
        {sweeps.map((s) => (
          <motion.div
            key={s.id}
            className="fixed z-30 pointer-events-none rounded-full"
            style={{ left: s.x, top: s.y, width: 40, height: 40, marginLeft: -20, marginTop: -20, background: s.color }}
            initial={{ scale: 0, opacity: 0.32 }}
            animate={{ scale: 90, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0.7, 0.2, 1] }}
          />
        ))}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 md:px-8 grid md:grid-cols-[1.25fr_1fr] gap-10 md:gap-14 items-center">
        <div>
          {/* prompt */}
          <div className="prompt text-sm md:text-base">
            <b>{profile.handle}@portfolio</b>:~$ <span className="text-text">{shown}</span>
            {done && <span className="text-text"> {eps.toFixed(2)}</span>}
            {!done && <span className="cursor" />}
          </div>

          <div className="mt-6">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              {profile.name}
            </h1>
            <p className="mt-3 text-base md:text-lg">
              <span className="accent accent-glow">{profile.title}</span>
              <span className="text-muted"> @ </span>
              <a className="u" href={profile.org.url} target="_blank" rel="noreferrer">
                {profile.org.name}
              </a>
            </p>
            <p className="mt-5 max-w-xl text-muted leading-relaxed">
              {profile.tagline}
            </p>

            <nav aria-label="links" className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {profile.resume && (
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="accent-bg text-ink font-semibold rounded px-3 py-1.5 hover:opacity-90 transition-opacity"
                >
                  résumé.pdf ↗
                </a>
              )}
              <a className="u" href={`mailto:${profile.email}`}>email</a>
              <a className="u" href={profile.github} target="_blank" rel="noreferrer">github</a>
              <a className="u" href={profile.linkedin} target="_blank" rel="noreferrer">linkedin</a>
            </nav>

            {/* controls */}
            <div className="mt-9 panel rounded-md p-4 md:p-5 max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-muted">
                  <span className="text-text">$</span> set mode
                </div>
                <div
                  role="radiogroup"
                  aria-label="site mode"
                  className="relative inline-flex rounded-md border border-grid bg-ink p-1 text-xs md:text-sm"
                >
                  {(["exploit", "explore"] as Mode[]).map((opt) => {
                    const active = m === opt;
                    return (
                      <button
                        key={opt}
                        role="radio"
                        aria-checked={active}
                        onClick={(e) => switchMode(opt, e)}
                        className={`relative z-10 px-4 py-1.5 rounded transition-colors duration-300 ${
                          active ? "text-ink font-semibold" : "text-muted hover:text-text"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="mode-thumb"
                            className="absolute inset-0 -z-10 rounded accent-bg"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          />
                        )}
                        {opt.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor="eps" className="text-muted">
                    <span className="text-text">$</span> set epsilon
                  </label>
                  <span className="text-muted">
                    ε = <span className="accent">{eps.toFixed(2)}</span>
                    <span className="text-muted/70"> // {greedy ? "mostly greedy" : "mostly random"}</span>
                  </span>
                </div>
                <input
                  id="eps"
                 
                  className="eps"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={eps}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  aria-valuetext={`epsilon ${eps.toFixed(2)}`}
                />
                <div className="flex justify-between text-[10px] text-muted/70 mt-1">
                  <span>0 · always exploit</span>
                  <span>1 · always explore</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-first md:order-none max-w-[220px] md:max-w-none mx-auto w-full">
          <Portrait />
        </div>
      </div>
    </section>
  );
}
