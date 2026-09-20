import { useEffect, useMemo, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useStore } from "@nanostores/react";
import { epsilon, hoverArm, hydrate, mode, pull, pulls, steps, useHydratedStore } from "../store/policy";
import { projects, type Project } from "../data/site";

function useJitter() {
  // per-visit randomness so Explore ordering differs between visits
  return useMemo(() => {
    const j: Record<string, number> = {};
    for (const p of projects) j[p.slug] = Math.random() * 0.35;
    return j;
  }, []);
}

function Reward({ p, onPolicy }: { p: Project; onPolicy: boolean }) {
  const reduce = useReducedMotion();
  if (p.rewardKnown) {
    return (
      <div className="mt-4 text-xs">
        <div className="flex justify-between text-muted mb-1.5">
          <span>reward</span>
          <span className="text-text">{p.reward}</span>
        </div>
        <div className="h-1.5 w-full bg-grid rounded-sm overflow-hidden">
          <motion.div
            className="h-full accent-bg"
            initial={reduce ? { width: `${p.exploit * 100}%` } : { width: 0 }}
            whileInView={{ width: `${p.exploit * 100}%` }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ opacity: onPolicy ? 1 : 0.5 }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 text-xs">
      <div className="flex justify-between text-muted mb-1.5">
        <span>reward</span>
        <span className="text-text">
          {p.reward} <span className="accent">?</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-sm overflow-hidden relative bg-grid">
        <motion.div
          className="absolute inset-y-0 w-1/3"
          style={{
            background: "linear-gradient(90deg, transparent, rgb(var(--accent-rgb) / .55), transparent)",
            opacity: onPolicy ? 1 : 0.4,
          }}
          animate={reduce ? {} : { x: ["-100%", "400%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export default function Projects() {
  const reduce = useReducedMotion();
  const m = useHydratedStore(mode, "exploit");
  const eps = useHydratedStore(epsilon, 0.1);
  const p = useHydratedStore(pulls, {} as Record<string, number>);
  const s = useHydratedStore(steps, 0);
  const hovered = useStore(hoverArm);
  const jitter = useJitter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, []);

  const ordered = useMemo(() => {
    const score = (x: Project) => (1 - eps) * x.exploit + eps * (x.explore + jitter[x.slug]);
    return [...projects].sort((a, b) => score(b) - score(a));
  }, [eps, jitter]);

  const totalPulls = Object.values(p).reduce((a, b) => a + b, 0);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 md:px-8 py-14 md:py-20">
      <div className="prompt text-sm md:text-base">
        <span className="text-text">$</span> ls projects/ <span className="text-muted">--sort=policy --epsilon={eps.toFixed(2)}</span>
      </div>
      <div className="mt-2 text-xs text-muted flex flex-wrap gap-x-5 gap-y-1">
        <span>
          mode=<span className="accent">{m}</span>
        </span>
        <span>arms={projects.length}</span>
        <span>pulls={ready ? totalPulls : 0}</span>
        <span>steps={ready ? s : 0}</span>
        <span>
          regret=<span className="text-text">unknown</span>
        </span>
      </div>

      <LayoutGroup>
        <motion.ul layout className="mt-8 grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((proj, i) => {
            const onPolicy = proj.mode === m;
            const count = p[proj.slug] ?? 0;
            const lit = hovered === proj.slug;
            return (
              <motion.li
                key={proj.slug}
                layout
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
                animate={{ opacity: onPolicy || lit ? 1 : 0.55, scale: lit ? 1.015 : onPolicy ? 1 : 0.985 }}
                whileHover={{ opacity: 1, scale: 1.015 }}
                onMouseEnter={() => hoverArm.set(proj.slug)}
                onMouseLeave={() => hoverArm.set(null)}
                className="list-none"
              >
                <a
                  href={`/projects/${proj.slug}/`}
                  onClick={() => pull(proj.slug)}
                  data-cursor="open"
                  className={`group block h-full panel rounded-md p-5 border transition-[border-color,box-shadow] duration-300 ${
                    onPolicy ? "" : "border-grid"
                  } hover:accent-border`}
                  style={{
                    borderColor: lit ? "var(--accent)" : onPolicy ? "rgb(var(--accent-rgb) / 0.45)" : undefined,
                    boxShadow: lit ? "0 0 0 1px rgb(var(--accent-rgb) / 0.35), 0 0 28px rgb(var(--accent-rgb) / 0.18)" : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 text-[11px] text-muted">
                    <span className="shrink-0 whitespace-nowrap">
                      [{i}] <span className={proj.mode === "exploit" ? "text-exploit" : "text-explore"}>{proj.mode}</span>
                    </span>
                    <span className="text-right">
                      {proj.org ? `${proj.org} · ` : ""}
                      {proj.period}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base md:text-lg font-semibold leading-snug hover-accent transition-colors">
                    {proj.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{proj.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {proj.tags.map((t) => (
                      <span key={t} className="text-[11px] px-1.5 py-0.5 rounded-sm bg-ink border border-grid text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Reward p={proj} onPolicy={onPolicy} />
                  <div className="mt-3 flex justify-between text-[11px] text-muted">
                    <span>pulled ×{ready ? count : 0}</span>
                    <span className="hover-accent transition-colors">open →</span>
                  </div>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      </LayoutGroup>
    </section>
  );
}
