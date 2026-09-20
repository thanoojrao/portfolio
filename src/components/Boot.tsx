import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { booted, hydrate } from "../store/policy";
import { projects } from "../data/site";

const LINES = [
  "[ ok ] loading policy ............ done",
  "[ ok ] epsilon=0.10 (greedy)",
  `[ ok ] arms detected: ${projects.length}`,
  "[ ok ] mounting /home/thanooj",
  "$ ./portfolio --mode exploit",
];

const SKIP_KEY = "booted";

export default function Boot() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [typed, setTyped] = useState<string[]>([]);
  const done = useRef(false);

  function finish() {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {}
    setShow(false);
    booted.set(true);
  }

  useEffect(() => {
    hydrate();
    document.getElementById("boot-shield")?.remove();

    let skip = false;
    try {
      skip = sessionStorage.getItem(SKIP_KEY) === "1";
    } catch {}
    if (skip || reduce) {
      finish();
      return;
    }

    // Build a timeline: each char has an absolute time. Rendering is driven by elapsed
    // time so throttled timers cannot stretch the sequence out.
    const events: { t: number; li: number; ci: number }[] = [];
    let t = 250;
    LINES.forEach((line, li) => {
      const perChar = li === LINES.length - 1 ? 34 : 9;
      for (let ci = 1; ci <= line.length; ci++) {
        t += perChar;
        events.push({ t, li, ci });
      }
      t += 110;
    });
    const endAt = t + 420;
    const t0 = performance.now();

    const iv = window.setInterval(() => {
      const el = performance.now() - t0;
      if (el >= endAt) {
        clearInterval(iv);
        finish();
        return;
      }
      const out: string[] = [];
      for (const ev of events) {
        if (ev.t > el) break;
        out[ev.li] = LINES[ev.li].slice(0, ev.ci);
      }
      setTyped(out.length ? out : [""]);
    }, 30);

    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(iv);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          onClick={finish}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="fixed inset-0 z-[60] bg-ink cursor-pointer select-none"
          aria-label="boot sequence, click to skip"
        >
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <pre className="text-[13px] md:text-sm leading-7 text-muted whitespace-pre-wrap">
              {typed.map((l, i) => (
                <div key={i} className={i === LINES.length - 1 ? "text-text" : ""}>
                  {l.startsWith("[ ok ]") ? (
                    <>
                      <span className="accent">[ ok ]</span>
                      {l.slice(6)}
                    </>
                  ) : (
                    l
                  )}
                  {i === typed.length - 1 && <span className="cursor" />}
                </div>
              ))}
            </pre>
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center text-xs text-muted/70">
            press any key to skip
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
