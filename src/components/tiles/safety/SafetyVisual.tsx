"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { Check, Heart, MousePointer2, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Thumb } from "@/components/demo/Thumb";
import { formatViews, videos } from "@/demo/data";
import { useIsDesktop } from "@/lib/hooks";
import { useTile } from "../TileContext";
import { specLines, type SpecGroup } from "./spec";

type Phase = "extractor" | "view" | "actions" | "confirm";
const SEQ: { phase: Phase; ms: number }[] = [
  { phase: "extractor", ms: 3200 },
  { phase: "view", ms: 3000 },
  { phase: "actions", ms: 3800 },
  { phase: "confirm", ms: 3400 },
];
const GROUP: Record<Phase, SpecGroup> = { extractor: "extractor", view: "view", actions: "actions", confirm: "actions" };
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Tile 05 visual (§7.5): the morph spec on the left, the UI it renders on the right.
 * Spec blocks highlight in sequence while the matching UI part glows; the loop ends on a
 * confirm dialog for a risky action.
 */
export default function SafetyVisual() {
  const { isActive, isCurrent } = useTile();
  const isDesktop = useIsDesktop();
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState<Phase>("extractor");
  const [cycle, setCycle] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r) setPhase("view");
  }, []);

  useEffect(() => {
    if (isCurrent && !reduced) {
      setPhase("extractor");
      setCycle((c) => c + 1);
    }
  }, [isCurrent, reduced]);

  useEffect(() => {
    if (!isActive || reduced) return;
    const i = SEQ.findIndex((s) => s.phase === phase);
    const t = window.setTimeout(() => {
      const next = SEQ[(i + 1) % SEQ.length].phase;
      if (next === "extractor") setCycle((c) => c + 1);
      setPhase(next);
    }, SEQ[i].ms);
    return () => window.clearTimeout(t);
  }, [phase, isActive, reduced]);

  const group = GROUP[phase];
  const code = <SpecCode group={reduced ? null : group} />;
  const render = <Rendered phase={phase} cycle={cycle} reduced={reduced} />;

  return (
    <div className="sf-wrap">
      {isDesktop ? (
        <div className="sf-frame" data-phase={phase} aria-hidden="true">
          <div className="sf-head">
            <span className="sf-head-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="sf-tab is-on">morph spec</span>
            <span className="sf-tab">renderer → Shadow DOM</span>
            <span className="sf-phase">{phase === "confirm" ? "actions · risky → ask" : group}</span>
          </div>
          <div className="sf-split">
            {code}
            <div className="sf-render">{render}</div>
          </div>
          <AnimatePresence>{phase === "confirm" && <ConfirmMock key={cycle} />}</AnimatePresence>
        </div>
      ) : (
        <div className="sf-flip" data-flipped={flipped || undefined}>
          <div className="sf-face sf-front" aria-hidden="true">
            <div className="sf-render">{render}</div>
            <AnimatePresence>{phase === "confirm" && <ConfirmMock key={cycle} />}</AnimatePresence>
          </div>
          <div className="sf-face sf-back" aria-hidden="true">
            {code}
          </div>
          <button type="button" className="sf-flip-btn glass" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>
            {flipped ? "View UI" : "View spec"}
          </button>
        </div>
      )}
    </div>
  );
}

function SpecCode({ group }: { group: SpecGroup }) {
  return (
    <pre className="sf-code">
      {specLines.map((line, i) => (
        <span key={i} className="sf-line" data-group={line.group ?? undefined} data-on={group && line.group === group ? "" : undefined} data-dim={group && line.group !== group ? "" : undefined}>
          <span className="sf-ln">{String(i + 1).padStart(2, " ")}</span>
          {"  ".repeat(line.indent)}
          {line.toks.map(([kind, text], j) => (
            <span key={j} className={`t-${kind}`}>
              {text}
            </span>
          ))}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}

function Rendered({ phase, cycle, reduced }: { phase: Phase; cycle: number; reduced: boolean }) {
  const recs = videos.slice(0, 6);
  const showDeck = phase !== "extractor";
  const acting = phase === "actions";
  return (
    <>
      {/* The live page underneath (faded once the view is mounted) */}
      <motion.div className="sf-page" animate={{ opacity: phase === "extractor" ? 1 : acting ? 0.55 : 0.22 }} transition={{ duration: 0.5 }}>
        <div className="sf-page-bar">
          <i />
          <span>streamly.demo</span>
        </div>
        <div className="sf-page-grid">
          {recs.map((v, i) => (
            <motion.div
              key={`${cycle}-${v.id}`}
              className="sf-rec"
              initial={false}
              animate={phase === "extractor" ? { outlineColor: "rgba(99,102,241,1)", backgroundColor: "rgba(99,102,241,0.1)" } : { outlineColor: "rgba(99,102,241,0)", backgroundColor: "rgba(99,102,241,0)" }}
              transition={{ delay: phase === "extractor" && !reduced ? 0.25 + i * 0.32 : 0, duration: 0.25 }}
            >
              <div className="sf-rec-thumb">
                <Thumb seed={v.thumbSeed} bare />
              </div>
              <span className="sf-rec-title">{v.title}</span>
              <span className="sf-rec-menu" data-target={acting && i === 0 ? "" : undefined}>
                ⋮
              </span>
            </motion.div>
          ))}
        </div>
        {/* Site action replayed on the real page: ⋮ → Save to Watch later */}
        <AnimatePresence>
          {acting && !reduced && (
            <motion.div
              key={`menu-${cycle}`}
              className="sf-menu"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: [0, 1, 1, 0], scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.2, times: [0, 0.1, 0.8, 1] }}
            >
              <span>Add to queue</span>
              <span className="is-hit">Save to Watch later</span>
              <span>Not interested</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {acting && !reduced && (
          <motion.span
            key={`cursor-${cycle}`}
            className="sf-cursor"
            initial={{ left: "62%", top: "70%", opacity: 0 }}
            animate={{ left: ["62%", "28%", "28%", "30%", "30%"], top: ["70%", "24%", "24%", "33%", "33%"], opacity: [0, 1, 1, 1, 0], scale: [1, 1, 0.85, 1, 1] }}
            transition={{ delay: 0.45, duration: 2.1, times: [0, 0.33, 0.4, 0.62, 1], ease }}
          >
            <MousePointer2 size={16} fill="#fff" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* The view the renderer draws from the spec */}
      <AnimatePresence>
        {showDeck && (
          <motion.div key={`deck-${cycle}`} className="sf-deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {[2, 1, 0].map((d) => {
              const v = recs[d];
              const top = d === 0;
              return (
                <motion.div
                  key={v.id}
                  className="sf-card"
                  data-glow={phase === "view" || undefined}
                  style={{ zIndex: 3 - d }}
                  initial={reduced ? false : { opacity: 0, y: 24, scale: 0.9 }}
                  animate={
                    top && acting && !reduced
                      ? { opacity: [1, 1, 0], x: ["0%", "0%", "135%"], rotate: [0, 0, 14], y: 0, scale: 1 }
                      : { opacity: 1 - d * 0.2, x: "0%", rotate: 0, y: d * 9, scale: 1 - d * 0.06 }
                  }
                  transition={
                    top && acting
                      ? { duration: 0.75, times: [0, 0.2, 1], ease }
                      : { delay: phase === "view" ? 0.15 + (2 - d) * 0.18 : 0, type: "spring", stiffness: 260, damping: 26 }
                  }
                >
                  <div className="sf-card-thumb">
                    <Thumb seed={v.thumbSeed} duration={v.duration} />
                  </div>
                  <span className="sf-card-title">{v.title}</span>
                  <span className="sf-card-meta">
                    {v.channel} · {formatViews(v.views)} views
                  </span>
                </motion.div>
              );
            })}
            <div className="sf-deck-btns">
              <span>
                <X size={13} />
              </span>
              <span className="is-save" data-glow={acting || undefined}>
                <Heart size={13} />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {acting && !reduced && (
          <motion.span
            key={`toast-${cycle}`}
            className="sf-toast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ delay: 2.3, duration: 1.4, times: [0, 0.15, 0.85, 1] }}
          >
            <Check size={12} strokeWidth={3} /> Saved to Watch later
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}

function ConfirmMock() {
  return (
    <motion.div className="sf-confirm-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div
        className="sf-confirm"
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <span className="sf-confirm-icon">
          <ShieldAlert size={16} />
        </span>
        <p>
          Morphic wants to click <b>Place order</b> on shopwise.demo.
        </p>
        <div className="sf-confirm-btns">
          <span className="sf-btn">Cancel</span>
          <span className="sf-btn is-primary">Allow once</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
