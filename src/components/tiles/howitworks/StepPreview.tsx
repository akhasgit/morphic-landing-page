"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { Check, MousePointer2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Thumb } from "@/components/demo/Thumb";
import { videos } from "@/demo/data";

const ease = [0.22, 1, 0.36, 1] as const;

/** The small screen under the agent graph showing the page state for each step (§7.4). */
export function StepPreview({ step, reduced }: { step: number; reduced: boolean }) {
  return (
    <div className="hw-preview" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="hw-scene"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && <Describe reduced={reduced} />}
          {step === 1 && <Read reduced={reduced} />}
          {step === 2 && <Design />}
          {step === 3 && <Check_ reduced={reduced} />}
          {step === 4 && <Version reduced={reduced} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MiniPage({ children, outlined }: { children?: React.ReactNode; outlined?: number }) {
  return (
    <div className="hw-mini">
      <div className="hw-mini-side">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="hw-mini-grid">
        {videos.slice(0, 6).map((v, i) => (
          <div key={v.id} className="hw-mini-card" data-outlined={outlined !== undefined && i < outlined ? "" : undefined}>
            <div className="hw-mini-thumb">
              <Thumb seed={v.thumbSeed} bare />
            </div>
            <i />
            <i className="short" />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

function useTyped(text: string, start: number, msPerChar: number, reduced: boolean) {
  const [n, setN] = useState(reduced ? text.length : 0);
  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let iv = 0;
    const t = window.setTimeout(() => {
      iv = window.setInterval(() => {
        i++;
        setN(i);
        if (i >= text.length) window.clearInterval(iv);
      }, msPerChar);
    }, start);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(iv);
    };
  }, [text, start, msPerChar, reduced]);
  return text.slice(0, n);
}

// 1 · You describe it — prompt types; the picker outlines the sidebar.
function Describe({ reduced }: { reduced: boolean }) {
  const typed = useTyped("Make this feed swipeable cards", 150, 45, reduced);
  return (
    <div className="hw-split">
      <div className="relative min-w-0 flex-1">
        <MiniPage />
        <motion.span
          className="hw-picked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 2.1, duration: 0.25 }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="6"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: reduced ? 0 : 2.1, duration: 0.6, ease }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <em>sidebar</em>
        </motion.span>
        {!reduced && (
          <motion.span
            className="hw-cursor"
            initial={{ left: "70%", top: "80%", opacity: 0 }}
            animate={{ left: ["70%", "9%"], top: ["80%", "42%"], opacity: [0, 1] }}
            transition={{ delay: 1.2, duration: 0.9, ease }}
          >
            <MousePointer2 size={14} fill="#fff" />
          </motion.span>
        )}
      </div>
      <div className="hw-minipanel">
        <span className="hw-minipanel-label">Morphic</span>
        <span className="hw-minipanel-input">
          {typed}
          <span className="mp-caret" />
        </span>
      </div>
    </div>
  );
}

// 2 · Data agent reads the page — records outline one by one, with a counter and the extractor.
function Read({ reduced }: { reduced: boolean }) {
  const [n, setN] = useState(reduced ? 6 : 0);
  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const iv = window.setInterval(() => {
      i++;
      setN(i);
      if (i >= 6) window.clearInterval(iv);
    }, 380);
    return () => window.clearInterval(iv);
  }, [reduced]);
  const count = n >= 6 ? 12 : n * 2;
  return (
    <div className="hw-col">
      <div className="relative min-h-0 flex-1">
        <MiniPage outlined={n} />
        <span className="hw-count">
          <b>{count}</b> records
        </span>
      </div>
      <motion.code className="hw-snippet" initial={{ opacity: 0 }} animate={{ opacity: n >= 3 ? 1 : 0 }} transition={{ duration: 0.4 }}>
        records: article.video-card · title: h3 a · views: .meta span:first-child
      </motion.code>
    </div>
  );
}

// 3 · UI agent designs the view — components slide in from a palette and snap into a layout.
const PALETTE = ["Deck", "Grid", "Table", "Chart", "Kanban", "Chat"];
function Design() {
  return (
    <div className="hw-split">
      <div className="hw-palette">
        {PALETTE.map((p, i) => (
          <motion.span
            key={p}
            className="hw-chip"
            data-picked={p === "Deck" || undefined}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.3, ease }}
          >
            {p}
          </motion.span>
        ))}
      </div>
      <div className="hw-canvas">
        {[2, 1, 0].map((d) => (
          <motion.div
            key={d}
            className="hw-deckcard"
            style={{ zIndex: 3 - d }}
            initial={{ opacity: 0, x: -60, scale: 0.8 }}
            animate={{ opacity: 1 - d * 0.25, x: 0, y: d * 7, scale: 1 - d * 0.06 }}
            transition={{ delay: 0.7 + (2 - d) * 0.35, type: "spring", stiffness: 260, damping: 26 }}
          >
            {d === 0 && (
              <>
                <motion.div className="hw-block thumb" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.3 }}>
                  <Thumb seed={videos[0].thumbSeed} />
                </motion.div>
                <motion.i className="hw-block line" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2, duration: 0.3 }} />
                <motion.i className="hw-block line short" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.4, duration: 0.3 }} />
              </>
            )}
          </motion.div>
        ))}
        <motion.span className="hw-stream" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0.6] }} transition={{ delay: 0.5, duration: 2.6 }}>
          live preview
        </motion.span>
      </div>
    </div>
  );
}

// 4 · QA checks — a scan line sweeps; one tile flags amber, loops back to UI, then turns green.
function Check_({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<"scan" | "warn" | "fix" | "ok">(reduced ? "ok" : "scan");
  useEffect(() => {
    if (reduced) return;
    const t1 = window.setTimeout(() => setPhase("warn"), 1100);
    const t2 = window.setTimeout(() => setPhase("fix"), 2300);
    const t3 = window.setTimeout(() => setPhase("ok"), 3100);
    return () => [t1, t2, t3].forEach(window.clearTimeout);
  }, [reduced]);
  return (
    <div className="hw-col">
      <div className="hw-qa">
        {videos.slice(0, 4).map((v, i) => (
          <div key={v.id} className="hw-qa-tile" data-flag={i === 2 ? phase : undefined}>
            <div className="hw-mini-thumb">
              <Thumb seed={v.thumbSeed} bare />
            </div>
            <i />
          </div>
        ))}
        {!reduced && phase === "scan" && (
          <motion.span className="hw-scan" initial={{ top: "0%" }} animate={{ top: "100%" }} transition={{ duration: 1.05, ease: "linear" }} />
        )}
      </div>
      <div className="hw-qa-status" data-phase={phase}>
        {phase === "scan" && <>Taking a screenshot · comparing with 12 records…</>}
        {phase === "warn" && <>Preview has issues · title missing on 1 card</>}
        {phase === "fix" && <>Sending back to UI · fixing…</>}
        {phase === "ok" && (
          <>
            <Check size={13} strokeWidth={3} /> Matches the page data
          </>
        )}
      </div>
    </div>
  );
}

// 5 · You get a version — v1 v2 v3 stack; Undo rewinds; "Saved for /watch/*".
function Version({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState(reduced ? 3 : 0);
  useEffect(() => {
    if (reduced) return;
    const ts = [450, 900, 1350, 2300, 3000].map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(window.clearTimeout);
  }, [reduced]);
  const versions = [
    { v: 1, s: "Original layout, cleaned up" },
    { v: 2, s: "Grid of circles" },
    { v: 3, s: "Swipe deck · right = Watch later" },
  ];
  const undone = phase >= 4;
  return (
    <div className="hw-col hw-versions">
      <div className="hw-vstack">
        <AnimatePresence initial={false}>
          {versions
            .filter((x) => x.v <= Math.min(phase, 3))
            .map((x) => (
              <motion.div
                key={x.v}
                className="hw-vchip"
                data-undone={undone && x.v === 3 ? "" : undefined}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: undone && x.v === 3 ? 0.4 : 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease }}
              >
                <b>v{x.v}</b>
                <span>{x.s}</span>
                {x.v === 3 && (
                  <span className="hw-undo" data-pressed={phase === 4 ? "" : undefined}>
                    <Undo2 size={11} /> {undone ? "Undone" : "Undo"}
                  </span>
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {(phase >= 5 || reduced) && (
          <motion.span className="hw-saved" initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease }}>
            <Check size={12} strokeWidth={3} /> Saved for <code>/watch/*</code>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
