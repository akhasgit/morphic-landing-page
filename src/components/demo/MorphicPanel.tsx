"use client";

import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { Check, ChevronRight, MousePointer2, Plus, Send } from "lucide-react";
import { useState } from "react";
import { AppIcon } from "../ui/AppIcon";
import type { ChatItem, DemoState, Step } from "./player";

/**
 * Replica of the extension side panel (§5.6), driven by a DemoPlayer timeline.
 * Marketing rule: the meta line shows time and steps only — never tokens or cost.
 */
export function MorphicPanel({
  state,
  clock,
  domain,
  onToggle,
  onUndo,
  interactive = false,
}: {
  state: DemoState;
  clock: MotionValue<number>;
  domain: string;
  onToggle?: () => void;
  onUndo?: () => void;
  interactive?: boolean;
}) {
  const lastVersionKey = [...state.items].reverse().find((i) => i.kind === "version")?.key;
  return (
    <div className="mp" aria-hidden={!interactive || undefined}>
      <div className="mp-root">
        <header className="mp-head">
          <AppIcon size="1.45em" bar={false} />
          <span className="mp-logo">Morphic</span>
          <span className="mp-host">{domain}</span>
          <button
            type="button"
            className="mp-toggle"
            aria-pressed={state.toggle}
            aria-label="Switch between the Morphic version and the original site"
            onClick={onToggle}
            tabIndex={interactive ? 0 : -1}
          >
            <span className="mp-track" data-on={state.toggle}>
              <span className="mp-thumb" />
            </span>
            <span className="mp-toggle-text">{state.toggle ? "Morphic" : "Original"}</span>
          </button>
        </header>
        <nav className="mp-tabs" aria-hidden="true">
          <span className="is-on">Chat</span>
          <span>Versions</span>
          <span>Saved</span>
          <span>Settings</span>
          <span className="mp-plus">
            <Plus />
          </span>
        </nav>
        <div className="mp-chat">
          <div className="mp-chat-inner">
            {state.items.length === 0 && !state.typing && (
              <motion.div className="mp-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <AppIcon size="2.2em" bar={false} />
                <p className="mp-empty-title">How should this page look?</p>
                <p className="mp-empty-sub">Describe it, or pick an element.</p>
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {state.items.map((it) => (
                <motion.div
                  key={it.key}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], layout: { type: "spring", stiffness: 380, damping: 36 } }}
                  className={`mp-item mp-item-${it.kind}`}
                >
                  <Item item={it} clock={clock} onUndo={it.key === lastVersionKey ? onUndo : undefined} interactive={interactive} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <footer className="mp-composer">
          <span className="mp-picker">
            <MousePointer2 />
          </span>
          <span className="mp-input">
            <TypedInput typing={state.typing} clock={clock} />
          </span>
          <span className={`mp-send ${state.running ? "is-running" : ""}`}>{state.running ? <i className="mp-stop" /> : <Send />}</span>
        </footer>
      </div>
    </div>
  );
}

function Item({ item, clock, onUndo, interactive }: { item: ChatItem; clock: MotionValue<number>; onUndo?: () => void; interactive: boolean }) {
  switch (item.kind) {
    case "user":
      return <div className="mp-bubble">{item.text}</div>;
    case "run":
      return <RunCard item={item} clock={clock} interactive={interactive} />;
    case "assistant":
      return (
        <div className="mp-assistant">
          <StreamedText text={item.text} startedAt={item.startedAt} clock={clock} />
          {item.meta && <p className="mp-meta">{item.meta}</p>}
        </div>
      );
    case "version":
      return (
        <div className="mp-version">
          <span className="mp-v">v{item.v}</span>
          <span className="mp-vsum">{item.summary}</span>
          <button
            type="button"
            className="mp-undo"
            onClick={onUndo}
            disabled={!onUndo || item.undone}
            tabIndex={interactive && onUndo && !item.undone ? 0 : -1}
          >
            {item.undone ? "Undone" : "Undo"}
          </button>
        </div>
      );
  }
}

function RunCard({ item, clock, interactive }: { item: Extract<ChatItem, { kind: "run" }>; clock: MotionValue<number>; interactive: boolean }) {
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const open = openOverride ?? !item.done;
  return (
    <div className="mp-run" data-done={item.done || undefined}>
      <button
        type="button"
        className="mp-run-head"
        onClick={() => interactive && setOpenOverride(!open)}
        tabIndex={interactive ? 0 : -1}
        aria-expanded={open}
      >
        {item.done ? <Check className="mp-ok" /> : <span className="mp-spin" />}
        <span className="mp-run-title">{item.done ? item.summary : "1 agent · working"}</span>
        <ChevronRight className="mp-chev" style={{ transform: open ? "rotate(90deg)" : undefined }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            className="mp-steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.steps.map((st) => (
              <motion.li
                key={st.id}
                className="mp-step"
                data-indent={st.indent}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <StepIcon status={st.status} indent={st.indent} />
                <span className="mp-step-label">
                  {st.label}
                  {st.status === "warn" && <em className="mp-warn-text">Preview has issues</em>}
                </span>
                <StepTimer step={st} clock={clock} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIcon({ status, indent }: { status: Step["status"]; indent: number }) {
  if (status === "ok") return <Check className="mp-ok" />;
  if (status === "warn") return <span className="mp-amber" />;
  return indent ? <span className="mp-dot" /> : <span className="mp-spin" />;
}

const fmt = (sec: number) => `${sec.toFixed(1)}s`;

/** Right-aligned mono timing that counts up live while the step runs. */
function StepTimer({ step, clock }: { step: Step; clock: MotionValue<number> }) {
  const final = parseFloat(step.timing);
  const compute = (t: number) => {
    if (step.status === "ok" || step.startedAt < -1e8) return step.timing;
    const span = Math.max(step.doneAt - step.startedAt, 1);
    const frac = Math.min(Math.max((t - step.startedAt) / span, 0), 0.999);
    return fmt(final * frac);
  };
  const [text, setText] = useState(() => compute(clock.get()));
  useMotionValueEvent(clock, "change", (t) => {
    const next = compute(t);
    if (next !== text) setText(next);
  });
  return <span className="mp-ms">{step.status === "ok" ? step.timing : text}</span>;
}

/** Assistant text streams word by word. */
function StreamedText({ text, startedAt, clock }: { text: string; startedAt: number; clock: MotionValue<number> }) {
  const words = text.split(" ");
  const count = (t: number) => Math.min(words.length, Math.max(0, Math.floor((t - startedAt) / 42)));
  const [n, setN] = useState(() => count(clock.get()));
  useMotionValueEvent(clock, "change", (t) => {
    const c = count(t);
    if (c !== n) setN(c);
  });
  const done = n >= words.length || startedAt < -1e8;
  return (
    <p className="mp-text">
      {done ? text : words.slice(0, n).join(" ")}
      {!done && <span className="mp-caret" />}
    </p>
  );
}

function TypedInput({ typing, clock }: { typing: DemoState["typing"]; clock: MotionValue<number> }) {
  const visible = (t: number) => (typing ? typing.text.slice(0, Math.max(0, Math.floor((t - typing.at) / typing.msPerChar))) : "");
  const [value, setValue] = useState(() => visible(clock.get()));
  useMotionValueEvent(clock, "change", (t) => {
    const v = visible(t);
    if (v !== value) setValue(v);
  });
  if (!typing || !value) return <span className="mp-placeholder">How should this page look or work?</span>;
  return (
    <span className="mp-typed">
      {value}
      <span className="mp-caret" />
    </span>
  );
}
