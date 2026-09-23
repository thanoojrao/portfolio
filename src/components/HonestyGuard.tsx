import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A replay of the honesty guard. The agent's reply streams immediately; the guard runs
 * alongside it, checks each claim against records the system owns, and marks the claim
 * verified or retracts it mid-stream. Names and data are invented.
 */

type Kind = "info" | "ok" | "fail";
/** a piece of the reply; `claim` ties it to the guard lines that judge it */
type Seg = { text: string; claim?: string };
/** `dt` is ms after the claim's first segment finishes streaming (or after the reply starts) */
type GuardLine = { claim?: string; dt: number; text: string; kind: Kind };
type Scenario = {
  key: string;
  label: string;
  user: string;
  reply: Seg[];
  guard: GuardLine[];
  correction?: string;
};

const SCENARIOS: Scenario[] = [
  {
    key: "fails",
    label: "claim fails",
    user: "Send the NDA to Priya at Northwind for signature.",
    reply: [
      { claim: "sent", text: "Done, I've sent the NDA to priya@northwind.example for signature." },
      { claim: "sent", text: " She'll get an email with a signing link, and I'll tell you as soon as she signs." },
    ],
    guard: [
      { dt: 0, text: "watching reply stream", kind: "info" },
      { claim: "sent", dt: 80, text: "claim: envelope sent → priya@northwind.example", kind: "info" },
      { claim: "sent", dt: 520, text: "envelopes where recipient = priya@… → 0 rows", kind: "info" },
      { claim: "sent", dt: 980, text: "tool log: send_envelope → 422 recipient_unverified", kind: "info" },
      { claim: "sent", dt: 1450, text: "not backed by any record → retract", kind: "fail" },
    ],
    correction:
      "Correction: I didn't send it. The send failed because priya@northwind.example isn't a verified recipient yet. Want me to verify the address and try again?",
  },
  {
    key: "holds",
    label: "claim holds",
    user: "Did Priya get the reminder about the NDA?",
    reply: [
      { claim: "reminder", text: "Yes, a reminder went to priya@northwind.example at 10:42 this morning." },
      { text: " " },
      { claim: "opened", text: "She opened it about twenty minutes later" },
      { text: ", but hasn't signed yet. Want me to nudge her again tomorrow?" },
    ],
    guard: [
      { dt: 0, text: "watching reply stream", kind: "info" },
      { claim: "reminder", dt: 80, text: "claim: reminder sent 10:42 → priya@…", kind: "info" },
      { claim: "reminder", dt: 620, text: "reminders → 1 row, sent 10:42:07", kind: "ok" },
      { claim: "opened", dt: 80, text: "claim: email opened ~20 min later", kind: "info" },
      { claim: "opened", dt: 600, text: "email events → opened 11:03:51", kind: "ok" },
    ],
  },
];

const REPLY_AT = 600; // ms before the first token
const CHAR = 24; // ms per streamed character

function timeline(s: Scenario) {
  // when each segment streams, and when each claim has finished appearing
  let t = REPLY_AT;
  const segs = s.reply.map((seg) => {
    const start = t;
    t += seg.text.length * CHAR;
    return { ...seg, start, end: t };
  });
  const replyEnd = t;
  const claimEnd: Record<string, number> = {};
  for (const seg of segs) if (seg.claim && !(seg.claim in claimEnd)) claimEnd[seg.claim] = seg.end;

  const lines = s.guard
    .map((g) => ({ ...g, t: (g.claim ? claimEnd[g.claim] : REPLY_AT) + g.dt }))
    .sort((a, b) => a.t - b.t);

  const failAt = lines.find((l) => l.kind === "fail")?.t;
  const correctionAt = s.correction && failAt !== undefined ? Math.max(failAt + 450, replyEnd + 350) : undefined;
  const correctionEnd = correctionAt !== undefined ? correctionAt + s.correction!.length * CHAR : 0;
  const end = Math.max(replyEnd, correctionEnd, ...lines.map((l) => l.t)) + 400;
  return { segs, lines, correctionAt, end };
}

/** the verdict on a claim at time `el`: the latest ok/fail line for it, if any */
function verdict(lines: { claim?: string; t: number; kind: Kind }[], claim: string, el: number): Kind {
  let v: Kind = "info";
  for (const l of lines) if (l.claim === claim && l.t <= el && l.kind !== "info") v = l.kind;
  return v;
}

export default function HonestyGuard() {
  const reduce = useReducedMotion();
  const [which, setWhich] = useState(0);
  const [run, setRun] = useState(0); // bump to replay
  const [el, setEl] = useState(0);
  const s = SCENARIOS[which];
  const tl = useMemo(() => timeline(s), [s]);

  useEffect(() => {
    if (reduce) {
      setEl(Infinity);
      return;
    }
    setEl(0);
    // time-based so throttled timers cannot stretch it out
    const t0 = performance.now();
    const iv = window.setInterval(() => {
      const e = performance.now() - t0;
      setEl(e);
      if (e >= tl.end) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [which, run, reduce, tl]);

  const streaming = el >= REPLY_AT && el < tl.end - 400;
  const anyFail = tl.lines.some((l) => l.kind === "fail" && l.t <= el);
  const done = el >= tl.end;
  const status = anyFail ? "retracted" : done ? "verified" : el < REPLY_AT ? "idle" : "auditing";
  const statusClass = anyFail ? "text-fail border-fail/50" : done ? "accent accent-border" : "text-muted border-grid";

  const correctionShown =
    tl.correctionAt !== undefined && el >= tl.correctionAt
      ? s.correction!.slice(0, Math.floor((el - tl.correctionAt) / CHAR))
      : "";
  const correctionTyping = correctionShown.length > 0 && correctionShown.length < (s.correction?.length ?? 0);

  return (
    <div className="panel rounded-md overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-grid text-xs">
        <div role="tablist" aria-label="scenario" className="inline-flex rounded border border-grid bg-ink p-0.5">
          {SCENARIOS.map((sc, i) => (
            <button
              key={sc.key}
              role="tab"
              aria-selected={i === which}
              onClick={() => {
                setWhich(i);
                setRun((r) => r + 1);
              }}
              className={`px-3 py-1 rounded-sm transition-colors ${
                i === which ? "accent-bg text-ink font-semibold" : "text-muted hover:text-text"
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
        <button onClick={() => setRun((r) => r + 1)} className="text-muted hover:text-text transition-colors">
          ↻ replay
        </button>
      </div>

      <div className="grid md:grid-cols-[1.35fr_1fr]">
        {/* conversation */}
        <div className="p-4 md:p-5 space-y-4 text-sm leading-relaxed">
          <div>
            <div className="text-[11px] text-muted mb-1">you</div>
            <div className="text-text">{s.user}</div>
          </div>
          <div aria-live="polite">
            <div className="text-[11px] text-muted mb-1">agent</div>
            <div className="min-h-[5.5rem]">
              {tl.segs.map((seg, i) => {
                const shown = seg.text.slice(0, Math.max(0, Math.floor((el - seg.start) / CHAR)));
                if (!shown) return null;
                if (!seg.claim) return <span key={i}>{shown}</span>;
                const v = verdict(tl.lines, seg.claim, el);
                const isHead = tl.segs.findIndex((x) => x.claim === seg.claim) === i;
                return (
                  <span
                    key={i}
                    className={
                      v === "fail"
                        ? "line-through decoration-fail/80 text-muted/60 transition-colors duration-500"
                        : v === "ok"
                          ? "underline decoration-[rgb(var(--accent-rgb)/0.6)] underline-offset-4 transition-colors duration-500"
                          : "underline decoration-dotted decoration-muted/60 underline-offset-4"
                    }
                  >
                    {shown}
                    {v === "ok" && isHead && seg.text.length === shown.length && <sup className="accent text-[10px] ml-0.5 no-underline">✓</sup>}
                  </span>
                );
              })}
              {streaming && !correctionShown && <span className="cursor" />}
              {correctionShown && (
                <p className="mt-3 text-text">
                  <span className="text-fail">{correctionShown.slice(0, 11)}</span>
                  {correctionShown.slice(11)}
                  {correctionTyping && <span className="cursor" />}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* guard */}
        <div className="p-4 md:p-5 border-t md:border-t-0 md:border-l border-grid bg-ink/40 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted">guard</span>
            <span className={`px-2 py-0.5 rounded-sm border transition-colors duration-300 ${statusClass}`}>{status}</span>
          </div>
          <ul className="space-y-1.5 font-mono">
            {tl.lines
              .filter((l) => l.t <= el)
              .map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span className={`shrink-0 ${l.kind === "ok" ? "accent" : l.kind === "fail" ? "text-fail" : "text-muted/60"}`}>
                    {l.kind === "ok" ? "✓" : l.kind === "fail" ? "✗" : "·"}
                  </span>
                  <span className={l.kind === "fail" ? "text-fail" : l.kind === "ok" ? "text-text" : "text-muted"}>
                    {l.text}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
