import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A replay of one phone call with the voice agent. Each sentence is sent to the voice as soon as
 * the model finishes writing it, and a word only counts as heard once Twilio says its audio played.
 * A listening noise ("mm-hm") lets the agent keep talking; real words cut it off, the queued audio
 * is cleared, and the transcript keeps only what the caller heard. The caller is invented.
 */

type Kind = "info" | "ok" | "cut";
type Log = { t: number; text: string; kind: Kind };
type Word = { text: string; sentAt: number; playAt: number };
type AgentTurn = { kind: "agent"; words: Word[]; cutAt?: number; noise?: { t: number; text: string } };
type CallerTurn = { kind: "caller"; text: string; t: number };

const WORD = 230; // ms per spoken word, slowed so it can be read

function agentTurn(sentences: { text: string; sentAt: number }[], start: number): { words: Word[]; end: number } {
  const words: Word[] = [];
  let t = start;
  for (const s of sentences) {
    for (const w of s.text.split(" ")) {
      t = Math.max(t, s.sentAt + 150);
      words.push({ text: w, sentAt: s.sentAt, playAt: t });
      t += WORD;
    }
  }
  return { words, end: t };
}

function build() {
  const logs: Log[] = [];
  const q1: CallerTurn = { kind: "caller", text: "Hi, what are you working on right now?", t: 200 };
  logs.push({ t: 900, text: "speech to text: caller's turn ended", kind: "info" });
  logs.push({ t: 1500, text: "LLM: sentence 1 written → voice", kind: "info" });
  logs.push({ t: 1800, text: "first audio playing, 1.1 s after the caller stopped", kind: "ok" });

  const a = agentTurn(
    [
      { text: "I'm a founding AI engineer at a contracts startup, where I built the AI agent people chat with to draft and send contracts.", sentAt: 1500 },
      { text: "On the side I built this phone agent, and every reply is spoken sentence by sentence while the model is still writing.", sentAt: 3300 },
    ],
    1800,
  );
  logs.push({ t: 3300, text: "LLM: sentence 2 written → voice", kind: "info" });

  const noiseAt = a.words[9].playAt + 60;
  logs.push({ t: noiseAt + 250, text: "caller: \"mm-hm\" → listening noise, keep talking", kind: "ok" });

  const cutIdx = 30; // the caller cuts in while this word plays
  const cutAt = a.words[cutIdx].playAt + 120;
  const heard = a.words.filter((w) => w.playAt < cutAt).length;
  logs.push({ t: cutAt, text: "caller: \"wait, what's\" → real words", kind: "cut" });
  logs.push({ t: cutAt + 120, text: "clear queued audio, cancel LLM and voice", kind: "cut" });
  logs.push({ t: cutAt + 300, text: `transcript keeps the ${heard} words the caller heard`, kind: "info" });

  const q2: CallerTurn = { kind: "caller", text: "Wait, what's it built with?", t: cutAt };
  const q2End = cutAt + 1300;
  logs.push({ t: q2End, text: "speech to text: caller's turn ended", kind: "info" });
  const bStart = q2End + 900;
  logs.push({ t: bStart, text: "first audio playing, 0.9 s after the caller stopped", kind: "ok" });
  const b = agentTurn(
    [
      { text: "Python with asyncio and FastAPI.", sentAt: bStart - 250 },
      { text: "Twilio carries the call, Deepgram turns speech into text, an LLM writes the reply and Cartesia speaks it in my voice.", sentAt: bStart + 900 },
    ],
    bStart,
  );
  logs.push({ t: b.end + 200, text: "every word played, nothing to trim", kind: "ok" });

  const turns: (AgentTurn | CallerTurn)[] = [
    q1,
    { kind: "agent", words: a.words, cutAt, noise: { t: noiseAt, text: "mm-hm" } },
    q2,
    { kind: "agent", words: b.words },
  ];
  // when the caller is talking, for the waveform: the question, the "mm-hm", the interruption
  const callerTalk: [number, number][] = [[200, 900], [noiseAt - 80, noiseAt + 320], [cutAt - 150, q2End]];
  return { turns, logs: logs.sort((x, y) => x.t - y.t), end: b.end + 700, callerTalk };
}

const BARS = 56;

/** a strip of bars that moves like a voice while `active`, and lies flat otherwise */
function Wave({ label, active, el, seed, color }: { label: string; active: boolean; el: number; seed: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-11 shrink-0 text-[11px] ${active ? "text-text" : "text-muted"}`}>{label}</span>
      <div className="flex-1 flex items-center justify-between h-9 overflow-hidden" aria-hidden="true">
        {Array.from({ length: BARS }, (_, i) => {
          // a few sines at different speeds, shaped by an envelope, read like speech rather than a metronome
          const x = i / BARS;
          const env = Math.sin(Math.PI * x) ** 0.6;
          const v =
            0.5 +
            0.25 * Math.sin(el / 90 + i * 0.9 + seed) +
            0.15 * Math.sin(el / 47 + i * 2.3 + seed * 2) +
            0.1 * Math.sin(el / 210 + i * 0.4);
          const h = active && Number.isFinite(el) ? Math.min(1, Math.max(0.1, env * v * 1.35)) : 0.07;
          return (
            <span
              key={i}
              className={`w-[3px] shrink-0 rounded-full transition-[height,opacity] duration-100 ${color}`}
              style={{ height: `${h * 100}%`, opacity: active ? 0.9 : 0.35 }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CallReplay() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [el, setEl] = useState(0);
  const tl = useMemo(build, []);

  useEffect(() => {
    if (reduce) {
      setEl(Infinity);
      return;
    }
    setEl(0);
    const t0 = performance.now();
    const iv = window.setInterval(() => {
      const e = performance.now() - t0;
      setEl(e);
      if (e >= tl.end) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [run, reduce, tl]);

  const done = el >= tl.end;
  const cut = tl.turns.some((t) => t.kind === "agent" && t.cutAt !== undefined && el >= t.cutAt);
  const speaking = tl.turns.some(
    (t) => t.kind === "agent" && t.words.some((w) => w.playAt <= el && el < w.playAt + WORD) && !(t.cutAt !== undefined && el >= t.cutAt),
  );
  const callerTalking = tl.callerTalk.some(([a, b]) => el >= a && el < b);
  const status = done ? "call done" : speaking ? "speaking" : el < 200 ? "ringing" : "listening";

  return (
    <div className="panel rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-grid text-xs">
        <div className="flex items-center gap-3 text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-[3px] rounded bg-text" /> heard
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-[3px] rounded bg-muted/40" /> sent, not played yet
          </span>
          {cut && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-[3px] rounded bg-fail" /> cleared
            </span>
          )}
        </div>
        <button onClick={() => setRun((r) => r + 1)} className="text-muted hover:text-text transition-colors">
          ↻ replay
        </button>
      </div>

      <div className="px-4 md:px-5 py-3 border-b border-grid space-y-1.5 bg-ink/30">
        <Wave label="caller" active={callerTalking} el={el} seed={1.7} color="bg-explore" />
        <Wave label="agent" active={speaking} el={el} seed={4.1} color="bg-[rgb(var(--accent-rgb))]" />
      </div>

      <div className="grid md:grid-cols-[1.35fr_1fr]">
        <div className="p-4 md:p-5 space-y-4 text-sm leading-relaxed min-h-[19rem]" aria-live="polite">
          {tl.turns.map((turn, i) => {
            if (turn.kind === "caller") {
              if (el < turn.t) return null;
              return (
                <div key={i}>
                  <div className="text-[11px] text-muted mb-1">caller</div>
                  <div className="text-text">{turn.text}</div>
                </div>
              );
            }
            if (el < turn.words[0].sentAt) return null;
            const cutNow = turn.cutAt !== undefined && el >= turn.cutAt;
            return (
              <div key={i}>
                <div className="text-[11px] text-muted mb-1">agent</div>
                <div>
                  {turn.words.map((w, j) => {
                    if (el < w.sentAt) return null;
                    const played = w.playAt <= el && !(turn.cutAt !== undefined && w.playAt >= turn.cutAt);
                    const cleared = cutNow && w.playAt >= turn.cutAt!;
                    const noiseHere =
                      turn.noise && el >= turn.noise.t && w.playAt <= turn.noise.t && turn.noise.t < w.playAt + WORD;
                    return (
                      <span key={j}>
                        <span
                          className={
                            cleared
                              ? "line-through decoration-fail/80 text-muted/50 transition-colors duration-300"
                              : played
                                ? "text-text transition-colors duration-150"
                                : "text-muted/50"
                          }
                        >
                          {w.text}
                        </span>
                        {noiseHere && (
                          <span className="mx-1 px-1.5 py-px rounded-sm border border-grid text-[11px] text-explore align-middle">
                            caller: {turn.noise!.text}
                          </span>
                        )}{" "}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 md:p-5 border-t md:border-t-0 md:border-l border-grid bg-ink/40 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted">pipeline</span>
            <span
              className={`px-2 py-0.5 rounded-sm border transition-colors duration-300 ${
                speaking ? "accent accent-border" : "text-muted border-grid"
              }`}
            >
              {status}
            </span>
          </div>
          <ul className="space-y-1.5 font-mono">
            {tl.logs
              .filter((l) => l.t <= el)
              .map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span className={`shrink-0 ${l.kind === "ok" ? "accent" : l.kind === "cut" ? "text-fail" : "text-muted/60"}`}>
                    {l.kind === "ok" ? "✓" : l.kind === "cut" ? "✗" : "·"}
                  </span>
                  <span className={l.kind === "cut" ? "text-fail" : l.kind === "ok" ? "text-text" : "text-muted"}>{l.text}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
