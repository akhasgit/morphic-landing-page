"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { AlertTriangle, Check, Heart, MousePointer2, Undo2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Thumb } from "@/components/demo/Thumb";
import { metrics, videos } from "@/demo/data";

// Bento micro-animations (§7.6). Each mounts fresh per `run` (keyed by the parent),
// so it plays on tile entry and replays in a loop while hovered.

const ease = [0.22, 1, 0.36, 1] as const;

/** Advances through `count` phases on a schedule (ms from start). */
function usePhases(times: number[], reduced: boolean) {
  const [p, setP] = useState(reduced ? times.length : 0);
  useEffect(() => {
    if (reduced) return;
    const ts = times.map((ms, i) => window.setTimeout(() => setP(i + 1), ms));
    return () => ts.forEach(window.clearTimeout);
  }, [reduced]); // `times` is a constant per component; each run remounts via key
  return p;
}

// A · Point at anything — cursor glides in, dashed outline snaps to a sidebar, it becomes a checklist.
export function PointMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([700, 1300, 2000], reduced);
  const items = ["Groceries", "Pick up keys", "Book flights", "Call Sam back"];
  return (
    <div className="bm-point">
      <div className="bm-page">
        <div className="bm-main">
          <i className="w80" />
          <i className="w60" />
          <div className="bm-blocks">
            <span />
            <span />
            <span />
          </div>
          <i className="w70" />
          <i className="w40" />
        </div>
        <motion.div className="bm-side" data-picked={p >= 2 || undefined} data-check={p >= 3 || undefined} layout transition={{ type: "spring", stiffness: 260, damping: 28 }}>
          {p >= 3 ? (
            <>
              <b>Today</b>
              {items.map((t, i) => (
                <motion.label key={t} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i, duration: 0.25 }}>
                  <span className="bm-box" data-on={i === 1 || undefined}>
                    {i === 1 && <Check size={9} strokeWidth={4} />}
                  </span>
                  {t}
                </motion.label>
              ))}
            </>
          ) : (
            <>
              <i className="w60" />
              <i className="w80" />
              <i className="w70" />
              <i className="w50" />
              <i className="w80" />
            </>
          )}
        </motion.div>
      </div>
      {!reduced && (
        <motion.span
          className="bm-cursor"
          initial={{ left: "30%", top: "105%", opacity: 0 }}
          animate={{ left: ["30%", "78%"], top: ["105%", "44%"], opacity: p >= 3 ? 0 : 1 }}
          transition={{ duration: 0.9, ease, opacity: { duration: 0.3 } }}
        >
          <MousePointer2 size={16} fill="#fff" />
        </motion.span>
      )}
    </div>
  );
}

// B · Undo anything — v1 → v2 → v3, Undo rewinds.
export function UndoMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([350, 750, 1150, 1900], reduced);
  const vs = [
    { v: 1, s: "Reader view" },
    { v: 2, s: "Bigger text" },
    { v: 3, s: "Dark theme" },
  ];
  const undone = p >= 4;
  return (
    <div className="bm-undo">
      <AnimatePresence initial={false}>
        {vs
          .filter((x) => x.v <= Math.min(p, 3) || reduced)
          .map((x) => (
            <motion.div
              key={x.v}
              className="bm-vchip"
              data-current={(undone ? x.v === 2 : x.v === Math.min(p, 3)) || undefined}
              data-undone={(undone && x.v === 3) || undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: undone && x.v === 3 ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <b>v{x.v}</b> {x.s}
            </motion.div>
          ))}
      </AnimatePresence>
      <motion.span className="bm-undo-btn" animate={{ scale: p === 4 ? [1, 0.9, 1] : 1 }} data-on={undone || undefined}>
        <Undo2 size={12} /> Undo
      </motion.span>
    </div>
  );
}

// C · Views that repair themselves — grid jitters, amber "Layout changed", then green "Repaired".
export function RepairMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([500, 1500], reduced);
  const broken = p === 1;
  const offsets = [
    [6, -4],
    [-5, 3],
    [4, 6],
    [-6, -3],
  ];
  return (
    <div className="bm-repair">
      <div className="bm-grid4" data-broken={broken || undefined}>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            animate={broken ? { x: offsets[i][0], y: offsets[i][1], rotate: offsets[i][0] / 2 } : { x: 0, y: 0, rotate: 0 }}
            transition={broken ? { type: "spring", stiffness: 500, damping: 8 } : { type: "spring", stiffness: 300, damping: 24 }}
          >
            <Thumb seed={videos[i + 2].thumbSeed} bare />
          </motion.span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {p === 1 ? (
          <motion.span key="warn" className="bm-badge is-warn" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertTriangle size={11} /> Layout changed
          </motion.span>
        ) : p >= 2 ? (
          <motion.span key="ok" className="bm-badge is-ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Check size={11} strokeWidth={3} /> Repaired
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// D · Works the site's own buttons — a card swipes; a ghost cursor clicks the real button.
export function ButtonsMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([500, 1100, 1500], reduced);
  return (
    <div className="bm-buttons">
      <div className="bm-faded">
        <div className="bm-faded-row">
          <span className="bm-faded-thumb">
            <Thumb seed={videos[4].thumbSeed} bare />
          </span>
          <i />
        </div>
        <motion.span className="bm-real-btn" data-hit={p >= 3 || undefined} animate={{ scale: p === 3 ? [1, 0.92, 1] : 1 }}>
          Save to Watch later
        </motion.span>
      </div>
      <motion.div
        className="bm-swipe-card"
        animate={p >= 1 && !reduced ? { x: "120%", rotate: 12, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease }}
      >
        <Thumb seed={videos[4].thumbSeed} />
        <span className="bm-swipe-like">
          <Heart size={11} fill="currentColor" />
        </span>
      </motion.div>
      {!reduced && (
        <motion.span
          className="bm-cursor"
          initial={{ left: "20%", top: "100%", opacity: 0 }}
          animate={p >= 2 ? { left: "64%", top: "78%", opacity: 1 } : { left: "20%", top: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <MousePointer2 size={15} fill="#fff" />
        </motion.span>
      )}
      <span className="bm-x" aria-hidden="true">
        <X size={10} />
      </span>
    </div>
  );
}

// E · Save once, use everywhere — a /watch/* pill; three pages stack in the same layout.
export function EverywhereMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([300, 650, 1000], reduced);
  return (
    <div className="bm-every">
      <span className="bm-glob">/watch/*</span>
      <div className="bm-stack">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="bm-pagecard"
            style={{ zIndex: 3 - i }}
            initial={false}
            animate={p > i || reduced ? { opacity: 1, x: i * 14, y: i * -10, scale: 1 - i * 0.05 } : { opacity: 0, x: 40, y: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <span className="bm-pagecard-url">streamly.demo/watch/{["a8f", "k2q", "z7m"][i]}</span>
            <span className="bm-pagecard-body">
              <span className="bm-pagecard-thumb">
                <Thumb seed={videos[i + 6].thumbSeed} bare />
              </span>
              <span className="bm-pagecard-lines">
                <i />
                <i className="w60" />
              </span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// F · Charts and chat over any data — bars grow; a question gets answered; the bar highlights.
export function ChartsMicro({ reduced }: { reduced: boolean }) {
  const p = usePhases([900, 1500, 2300], reduced);
  const max = Math.max(...metrics.map((m) => m.churn));
  const top = metrics.find((m) => m.churn === max)!;
  return (
    <div className="bm-charts">
      <div className="bm-bars" role="img" aria-label="Monthly churn">
        {metrics.map((m, i) => (
          <span key={m.month} className="bm-bar-col">
            <motion.span
              className="bm-bar"
              data-hl={(p >= 3 && m.month === top.month) || undefined}
              initial={{ scaleY: reduced ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: reduced ? 0 : 0.04 * i, type: "spring", stiffness: 200, damping: 22 }}
              style={{ height: `${(m.churn / max) * 100}%` }}
            />
            <em>{m.month[0]}</em>
          </span>
        ))}
      </div>
      <div className="bm-chat">
        <AnimatePresence>
          {p >= 1 && (
            <motion.p key="q" className="bm-q" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              Which month had the highest churn?
            </motion.p>
          )}
          {p >= 2 && (
            <motion.p key="a" className="bm-a" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {monthName(top.month)} — {top.churn}%, the highest of the year.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MONTHS: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};
const monthName = (m: string) => MONTHS[m] ?? m;
