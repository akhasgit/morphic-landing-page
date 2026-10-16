"use client";

// Timeline runner for the coded demos (§5.6). A script is a list of DemoEvents at
// millisecond offsets; the player advances a clock while playing and folds events into
// a chat/stage state. Discrete state is a tiny external store (useSyncExternalStore);
// the clock is a MotionValue so typing, streaming text and live step timers render
// without re-rendering the whole demo every frame.

import { motionValue, type MotionValue } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Layout, SortState } from "./MorphStage";

export type DemoEvent =
  | { at: number; type: "typePrompt"; text: string; msPerChar?: number; layout?: Layout }
  | { at: number; type: "send" }
  // Extra: opens the agent run card with its headline row.
  | { at: number; type: "run" }
  | { at: number; type: "step"; id: string; label: string; indent?: 0 | 1; timing: string }
  | { at: number; type: "stepDone"; id: string; status?: "ok" | "warn" }
  // Extra: collapses the run card ("✓ 1 agent · 6 steps") and sets the meta line.
  | { at: number; type: "runDone"; meta: string; summary: string }
  | { at: number; type: "morph"; layout: Layout }
  | { at: number; type: "assistant"; text: string }
  | { at: number; type: "version"; v: number; summary: string }
  | { at: number; type: "toggle"; on: boolean }
  // Extras for the stage.
  | { at: number; type: "caption"; text: string | null }
  | { at: number; type: "deckSwipe" }
  | { at: number; type: "sort"; sort: SortState }
  | { at: number; type: "reset" };

export type Step = {
  id: string;
  label: string;
  indent: 0 | 1;
  timing: string;
  status: "running" | "warn" | "ok";
  startedAt: number;
  doneAt: number;
};

export type ChatItem =
  | { kind: "user"; key: string; text: string }
  | { kind: "run"; key: string; steps: Step[]; done: boolean; summary?: string; meta?: string }
  | { kind: "assistant"; key: string; text: string; startedAt: number; meta?: string }
  | { kind: "version"; key: string; v: number; summary: string; undone?: boolean };

export type DemoState = {
  typing: { text: string; at: number; msPerChar: number } | null;
  items: ChatItem[];
  layout: Layout;
  /** The layout of the current Morphic version (toggle returns here). */
  versionLayout: Layout;
  toggle: boolean;
  running: boolean;
  caption: string | null;
  deckSwipe: number;
  sort: SortState;
  /** Layout the latest prompt asks for (drives the hero's rotating line). */
  promptLayout: Layout | null;
  history: Layout[];
};

export const initialDemoState = (layout: Layout = "original"): DemoState => ({
  typing: null,
  items: [],
  layout,
  versionLayout: layout,
  toggle: true,
  running: false,
  caption: null,
  deckSwipe: 0,
  sort: null,
  promptLayout: null,
  history: [layout],
});

let keySeq = 0;
const nextKey = () => `k${++keySeq}`;
const MAX_ITEMS = 9;

function lastRun(items: ChatItem[]) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it.kind === "run") return { item: it, index: i };
  }
  return null;
}

function reduce(s: DemoState, ev: DemoEvent, plan: Map<string, number>): DemoState {
  switch (ev.type) {
    case "reset":
      return initialDemoState();
    case "typePrompt":
      return { ...s, typing: { text: ev.text, at: ev.at, msPerChar: ev.msPerChar ?? 40 }, promptLayout: ev.layout ?? s.promptLayout };
    case "send": {
      const text = s.typing?.text ?? "";
      return { ...s, typing: null, running: true, items: [...s.items, { kind: "user" as const, key: nextKey(), text }].slice(-MAX_ITEMS) };
    }
    case "run":
      return { ...s, items: [...s.items, { kind: "run" as const, key: nextKey(), steps: [], done: false }].slice(-MAX_ITEMS) };
    case "step": {
      const r = lastRun(s.items);
      if (!r) return s;
      const step: Step = {
        id: ev.id,
        label: ev.label,
        indent: ev.indent ?? 0,
        timing: ev.timing,
        status: "running",
        startedAt: ev.at,
        doneAt: plan.get(ev.id) ?? ev.at + 400,
      };
      const items = [...s.items];
      items[r.index] = { ...r.item, steps: [...r.item.steps, step] };
      return { ...s, items };
    }
    case "stepDone": {
      const r = lastRun(s.items);
      if (!r) return s;
      const items = [...s.items];
      items[r.index] = {
        ...r.item,
        steps: r.item.steps.map((st) => (st.id === ev.id ? { ...st, status: ev.status ?? "ok", doneAt: ev.at } : st)),
      };
      return { ...s, items };
    }
    case "runDone": {
      const r = lastRun(s.items);
      if (!r) return s;
      const items = [...s.items];
      items[r.index] = {
        ...r.item,
        done: true,
        summary: ev.summary,
        meta: ev.meta,
        steps: r.item.steps.map((st) => (st.status === "running" ? { ...st, status: "ok" } : st)),
      };
      return { ...s, items, running: false };
    }
    case "morph":
      return { ...s, layout: ev.layout, versionLayout: ev.layout, toggle: true, caption: null, sort: ev.layout === "table" ? null : s.sort, history: [...s.history, ev.layout] };
    case "assistant": {
      const r = lastRun(s.items);
      const meta = r?.item.meta;
      return { ...s, items: [...s.items, { kind: "assistant" as const, key: nextKey(), text: ev.text, startedAt: ev.at, meta }].slice(-MAX_ITEMS) };
    }
    case "version":
      return { ...s, items: [...s.items, { kind: "version" as const, key: nextKey(), v: ev.v, summary: ev.summary }].slice(-MAX_ITEMS) };
    case "toggle":
      return {
        ...s,
        toggle: ev.on,
        layout: ev.on ? s.versionLayout : "original",
        caption: ev.on ? null : "The original site, one click away.",
      };
    case "caption":
      return { ...s, caption: ev.text };
    case "deckSwipe":
      return { ...s, deckSwipe: s.deckSwipe + 1 };
    case "sort":
      return { ...s, sort: ev.sort };
  }
}

/** Ends anything mid-flight (used when a new script interrupts the current one). */
function settle(s: DemoState): DemoState {
  return {
    ...s,
    typing: null,
    running: false,
    items: s.items.map((it) => {
      if (it.kind === "assistant") return { ...it, startedAt: -1e9 };
      if (it.kind === "run" && !it.done)
        return { ...it, done: true, summary: it.summary ?? "1 agent", steps: it.steps.map((st) => ({ ...st, status: "ok" as const, startedAt: -1e9, doneAt: -1e9 })) };
      if (it.kind === "run") return { ...it, steps: it.steps.map((st) => ({ ...st, startedAt: -1e9, doneAt: -1e9 })) };
      return it;
    }),
  };
}

export class DemoPlayer {
  state: DemoState;
  readonly clock: MotionValue<number> = motionValue(0);
  private events: DemoEvent[] = [];
  private idx = 0;
  private elapsed = 0;
  private duration = 0;
  private loop = false;
  private onEnd: (() => void) | null = null;
  private plan = new Map<string, number>();
  private listeners = new Set<() => void>();
  playing = false;

  constructor(initial: DemoState = initialDemoState()) {
    this.state = initial;
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  };
  getState = () => this.state;
  private emit() {
    this.listeners.forEach((l) => l());
  }

  /** Load a script. `keepState` continues the chat (chips); otherwise its own reset applies. */
  load(events: DemoEvent[], opts: { duration: number; loop?: boolean; keepState?: boolean; onEnd?: () => void }) {
    this.events = [...events].sort((a, b) => a.at - b.at);
    this.idx = 0;
    this.elapsed = 0;
    this.duration = opts.duration;
    this.loop = !!opts.loop;
    this.onEnd = opts.onEnd ?? null;
    this.plan = new Map();
    for (const ev of this.events) if (ev.type === "stepDone" && (ev.status ?? "ok") === "ok") this.plan.set(ev.id, ev.at);
    this.state = settle(this.state);
    this.clock.set(0);
    this.emit();
  }

  dispatch(ev: Omit<DemoEvent, "at"> & { at?: number }) {
    this.state = reduce(this.state, { ...ev, at: ev.at ?? this.elapsed } as DemoEvent, this.plan);
    this.emit();
  }

  setState(next: DemoState) {
    this.state = next;
    this.emit();
  }

  tick(dt: number) {
    if (!this.playing) return;
    this.elapsed += dt;
    this.clock.set(this.elapsed);
    let changed = false;
    while (this.idx < this.events.length && this.events[this.idx].at <= this.elapsed) {
      this.state = reduce(this.state, this.events[this.idx++], this.plan);
      changed = true;
    }
    if (changed) this.emit();
    if (this.elapsed >= this.duration && this.idx >= this.events.length) {
      if (this.loop) {
        this.idx = 0;
        this.elapsed = 0;
        this.clock.set(0);
      } else {
        this.playing = false;
        const end = this.onEnd;
        this.onEnd = null;
        end?.();
      }
    }
  }

  /** Jump to the end state of the loaded script without animating (reduced motion). */
  finish() {
    while (this.idx < this.events.length) this.state = reduce(this.state, this.events[this.idx++], this.plan);
    this.state = settle(this.state);
    this.emit();
  }
}

/** Creates a player and drives it with rAF while `active`. */
export function useDemoPlayer(active: boolean, initial?: () => DemoState) {
  const [player] = useState(() => new DemoPlayer(initial?.()));
  const state = useSyncExternalStore(player.subscribe, player.getState, player.getState);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      player.tick(Math.min(t - last, 64));
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, player]);

  return { player, state };
}
