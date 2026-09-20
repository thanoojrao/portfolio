import { atom, map, type ReadableAtom } from "nanostores";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";

/**
 * Like useStore, but returns `fallback` (the server-rendered default) on the first
 * client render so hydration matches, then the live value after mount.
 */
export function useHydratedStore<T>(store: ReadableAtom<T>, fallback: T): T {
  const v = useStore(store);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? v : fallback;
}

export type Mode = "exploit" | "explore";

export const epsilon = atom<number>(0.1);
export const mode = atom<Mode>("exploit");
export const pulls = map<Record<string, number>>({});
export const steps = atom<number>(0);
export const hydrated = atom<boolean>(false);
/** true once the boot overlay has finished (or was skipped) */
export const booted = atom<boolean>(false);

const KEY = "policy";

function clamp(x: number) {
  return Math.min(1, Math.max(0, x));
}

export function setEpsilon(e: number) {
  const v = clamp(Math.round(e * 100) / 100);
  epsilon.set(v);
  const m: Mode = v >= 0.5 ? "explore" : "exploit";
  if (mode.get() !== m) {
    mode.set(m);
    steps.set(steps.get() + 1);
  }
}

export function setMode(m: Mode) {
  if (mode.get() !== m) steps.set(steps.get() + 1);
  mode.set(m);
  epsilon.set(m === "explore" ? 0.9 : 0.1);
}

export function pull(arm: string) {
  pulls.setKey(arm, (pulls.get()[arm] ?? 0) + 1);
  steps.set(steps.get() + 1);
}

function save() {
  if (!hydrated.get()) return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        mode: mode.get(),
        epsilon: epsilon.get(),
        pulls: pulls.get(),
        steps: steps.get(),
      })
    );
  } catch {}
}

let scheduled = false;

/**
 * Call from any island after mount. The persisted policy is applied only after the
 * page has fully loaded, so every island first hydrates against the server-rendered
 * defaults (no React hydration mismatch), then all of them update together.
 */
export function hydrate() {
  if (hydrated.get() || scheduled) return;
  scheduled = true;
  const run = () => window.setTimeout(applyPersisted, 0);
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

function applyPersisted() {
  if (hydrated.get()) return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.mode === "explore" || p.mode === "exploit") mode.set(p.mode);
      if (typeof p.epsilon === "number") epsilon.set(clamp(p.epsilon));
      if (p.pulls && typeof p.pulls === "object") pulls.set(p.pulls);
      if (typeof p.steps === "number") steps.set(p.steps);
    }
  } catch {}
  hydrated.set(true);
  mode.subscribe((m) => {
    document.documentElement.dataset.mode = m;
    save();
  });
  epsilon.subscribe(save);
  pulls.subscribe(save);
  steps.subscribe(save);
}

/** slug of the arm currently hovered in the graph or the card grid, or null */
export const hoverArm = atom<string | null>(null);
