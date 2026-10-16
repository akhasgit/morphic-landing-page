"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { Check } from "lucide-react";

type NodeId = "orch" | "data" | "ui" | "qa";

const NODES: Record<NodeId, { x: number; y: number; label: string; role: string; timing: string }> = {
  orch: { x: 50, y: 50, label: "Orchestrator", role: "talks to you", timing: "26.5s" },
  data: { x: 15, y: 50, label: "Data", role: "reads the page", timing: "2.4s" },
  ui: { x: 85, y: 21, label: "UI", role: "designs the view", timing: "6.8s" },
  qa: { x: 85, y: 79, label: "QA", role: "checks the work", timing: "3.1s" },
};

const EDGES: [NodeId, NodeId][] = [
  ["orch", "data"],
  ["orch", "ui"],
  ["orch", "qa"],
  ["qa", "ui"],
];

/** Who is active, who is done, and which pairs are talking at each step. */
const STATES: { active: NodeId[]; done: NodeId[]; talk: [NodeId, NodeId][] }[] = [
  { active: ["orch"], done: [], talk: [] },
  { active: ["data"], done: [], talk: [["orch", "data"]] },
  { active: ["ui"], done: ["data"], talk: [["orch", "ui"]] },
  { active: ["qa"], done: ["data", "ui"], talk: [["qa", "ui"], ["orch", "qa"]] },
  { active: ["orch"], done: ["data", "ui", "qa"], talk: [] },
];

const key = (a: NodeId, b: NodeId) => [a, b].sort().join("-");

/**
 * Orchestrator hub with Data, UI and QA around it (§7.4). Dashed links carry small dots
 * while two agents talk; active nodes glow indigo; finished ones freeze their timing.
 */
export function AgentGraph({ step }: { step: number }) {
  const st = STATES[step];
  const talking = new Set(st.talk.map(([a, b]) => key(a, b)));
  return (
    <div className="hw-graph" aria-hidden="true">
      <svg className="hw-links" viewBox="0 0 100 100" preserveAspectRatio="none">
        {EDGES.map(([a, b]) => {
          const on = talking.has(key(a, b));
          return (
            <line
              key={key(a, b)}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              className={`hw-link ${on ? "is-on" : ""}`}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {st.talk.map(([a, b]) =>
        [0, 0.6].map((delay) => (
          <motion.span
            key={`${step}-${a}-${b}-${delay}`}
            className="hw-packet"
            initial={{ left: `${NODES[a].x}%`, top: `${NODES[a].y}%`, opacity: 0 }}
            animate={{ left: [`${NODES[a].x}%`, `${NODES[b].x}%`], top: [`${NODES[a].y}%`, `${NODES[b].y}%`], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, delay, repeat: Infinity, ease: "easeInOut", times: [0, 1] }}
          />
        )),
      )}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id];
        const active = st.active.includes(id);
        const done = st.done.includes(id);
        return (
          <div key={id} className="hw-node" data-active={active || undefined} data-done={done || undefined} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            {active && <span className="hw-node-ring" />}
            <span className="hw-node-label">{n.label}</span>
            <span className="hw-node-role">{n.role}</span>
            <span className="hw-node-status">
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span key="done" className="hw-node-done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <Check size={11} strokeWidth={3} /> {n.timing}
                  </motion.span>
                ) : active ? (
                  <motion.span key="active" className="hw-node-working" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <i /> working
                  </motion.span>
                ) : (
                  <motion.span key="idle" className="hw-node-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    idle
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        );
      })}
    </div>
  );
}
