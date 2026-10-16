// Demo scripts. Step labels mirror the real side panel's activity rows; timings shown are
// realistic agent times while the demo itself is compressed (hence the "▶▶ sped up" badge).

import type { DemoEvent } from "./player";
import type { Layout } from "./MorphStage";

type Turn = {
  t: number; // seconds
  prompt: string;
  layout: Layout;
  msPerChar?: number;
  /** Seconds from send → each sub-step start; the run takes `runLen` seconds. */
  compressed?: boolean;
  timings: [string, string, string, string, string, string]; // agent, read, render, shot, report, save
  meta: string;
  assistant: string;
  version: { v: number; summary: string };
  warnOnRender?: boolean;
  after?: (tEnd: number) => DemoEvent[];
};

const s = (x: number) => Math.round(x * 1000);

/** One prompt → agent run → morph → reply → version chip. */
export function turn(o: Turn): { events: DemoEvent[]; end: number } {
  const mpc = o.msPerChar ?? 40;
  const typed = o.t + (o.prompt.length * mpc) / 1000;
  const send = typed + (o.compressed ? 0.12 : 0.32);
  // Sub-step offsets (s). Full run ≈ 2s on autoplay, 1.2s when a chip interrupts.
  const k = o.compressed ? 0.6 : 1;
  const at = {
    read: send + 0.4 * k,
    render: send + 0.7 * k,
    renderWarn: send + 1.0 * k,
    renderOk: send + 1.3 * k,
    shot: send + 1.3 * k,
    morph: send + 1.4 * k,
    report: send + 1.6 * k,
    save: send + 1.8 * k,
    done: send + 2.0 * k,
  };
  const ev: DemoEvent[] = [
    { at: s(o.t), type: "typePrompt", text: o.prompt, msPerChar: mpc, layout: o.layout },
    { at: s(send), type: "send" },
    { at: s(send), type: "run" },
    { at: s(send), type: "step", id: "agent", label: "UI engineer: building the view", timing: o.timings[0] },
    { at: s(at.read), type: "step", id: "read", label: "Reading the page", indent: 1, timing: o.timings[1] },
    { at: s(at.render), type: "stepDone", id: "read" },
    { at: s(at.render), type: "step", id: "render", label: "Rendering view grid", indent: 1, timing: o.timings[2] },
    ...(o.warnOnRender !== false ? [{ at: s(at.renderWarn), type: "stepDone", id: "render", status: "warn" } as DemoEvent] : []),
    { at: s(at.renderOk), type: "stepDone", id: "render" },
    { at: s(at.shot), type: "step", id: "shot", label: "Taking a screenshot", indent: 1, timing: o.timings[3] },
    { at: s(at.morph), type: "morph", layout: o.layout },
    { at: s(at.report), type: "stepDone", id: "shot" },
    { at: s(at.report), type: "step", id: "report", label: "Reporting back", indent: 1, timing: o.timings[4] },
    { at: s(at.save), type: "stepDone", id: "report" },
    { at: s(at.save), type: "step", id: "save", label: "Saving a new version", indent: 1, timing: o.timings[5] },
    { at: s(at.done), type: "stepDone", id: "save" },
    { at: s(at.done), type: "stepDone", id: "agent" },
    { at: s(at.done), type: "runDone", meta: o.meta, summary: "1 agent · 6 steps" },
    { at: s(at.done + 0.2), type: "assistant", text: o.assistant },
    { at: s(at.done + (o.compressed ? 0.7 : 1.4)), type: "version", v: o.version.v, summary: o.version.summary },
  ];
  const end = at.done + (o.compressed ? 0.9 : 1.6);
  return { events: [...ev, ...(o.after?.(end) ?? [])], end };
}

/** Hero autoplay (§7.1), ~26s loop. */
export function heroScript(): { events: DemoEvent[]; duration: number } {
  const a = turn({
    t: 0.8,
    prompt: "make all the videos a grid of circles",
    layout: "circle-grid",
    timings: ["24.1s", "2.4s", "6.8s", "3.1s", "1.9s", "0.6s"],
    meta: "26.5s · 6 steps",
    assistant: "Done — all 12 videos are now a grid of circles. Click any circle to open it.",
    version: { v: 2, summary: "Grid of circles for every video" },
  });
  const b = turn({
    t: 8.5,
    prompt: "now make it swipeable cards",
    layout: "deck",
    timings: ["17.4s", "1.8s", "5.9s", "2.7s", "1.6s", "0.5s"],
    meta: "18.2s · 6 steps",
    assistant: "Done — your feed is now a swipeable deck. Swipe right to save a video to Watch later.",
    version: { v: 3, summary: "Swipe deck · right = Watch later" },
    warnOnRender: false,
    after: (end) => [{ at: s(end + 0.6), type: "deckSwipe" }],
  });
  const c = turn({
    t: 15,
    prompt: "show it as a table sorted by views",
    layout: "table",
    timings: ["20.9s", "2.1s", "7.2s", "2.9s", "1.8s", "0.6s"],
    meta: "21.7s · 6 steps",
    assistant: "Here are all 12 videos as a table, sorted by views. Click a header to re-sort.",
    version: { v: 4, summary: "Table sorted by views" },
    warnOnRender: false,
  });
  // Rows reorder by views just after the table lands.
  const tableAt = c.events.find((e) => e.type === "morph")!.at;
  return {
    events: [
      { at: 0, type: "reset" },
      ...a.events,
      ...b.events,
      ...c.events,
      { at: tableAt + 650, type: "sort", sort: { key: "views", dir: "desc" } },
      { at: s(21), type: "toggle", on: false },
      { at: s(24), type: "toggle", on: true },
    ],
    duration: s(26.2),
  };
}

export type Chip = { label: string; prompt?: string; layout: Layout; summary: string; assistant: string };

/** Prompt chips under the hero demo (§7.1). */
export const heroChips: Chip[] = [
  {
    label: "Circle grid",
    prompt: "make all the videos a grid of circles",
    layout: "circle-grid",
    summary: "Grid of circles for every video",
    assistant: "Done — every video is now a circle. Click one to open it.",
  },
  {
    label: "Swipe deck",
    prompt: "make these swipeable cards",
    layout: "deck",
    summary: "Swipe deck · right = Watch later",
    assistant: "Done — swipe right to save to Watch later, left to skip.",
  },
  {
    label: "Table by views",
    prompt: "show it as a table sorted by views",
    layout: "table",
    summary: "Table sorted by views",
    assistant: "Here's a table of all 12 videos, sorted by views.",
  },
  {
    label: "Reader view",
    prompt: "turn this into a clean reading list",
    layout: "reader",
    summary: "Reading list, no clutter",
    assistant: "Done — a clean reading list with titles, channels and lengths.",
  },
  {
    label: "Big & simple",
    prompt: "make everything big and simple to read",
    layout: "big-text",
    summary: "One column, big type",
    assistant: "Done — one column, big text, high contrast.",
  },
  { label: "Original", layout: "original", summary: "", assistant: "" },
];

/** A chip interrupts autoplay: fast-type (12ms/char), compressed 1.2s run, morph. */
export function chipScript(chip: Chip, version: number): { events: DemoEvent[]; duration: number } {
  if (!chip.prompt) {
    return { events: [{ at: 0, type: "toggle", on: false }], duration: 400 };
  }
  const t = turn({
    t: 0,
    prompt: chip.prompt,
    layout: chip.layout,
    msPerChar: 12,
    compressed: true,
    timings: ["19.6s", "2.0s", "6.4s", "2.8s", "1.7s", "0.6s"],
    meta: "20.3s · 6 steps",
    assistant: chip.assistant,
    version: { v: version, summary: chip.summary },
    warnOnRender: false,
    after: (end) =>
      chip.layout === "deck"
        ? [{ at: s(end + 0.3), type: "deckSwipe" }]
        : chip.layout === "table"
          ? [{ at: s(end - 0.5), type: "sort", sort: { key: "views", dir: "desc" } }]
          : [],
  });
  return { events: [{ at: 0, type: "toggle", on: true }, ...t.events], duration: s(t.end + 0.6) };
}
