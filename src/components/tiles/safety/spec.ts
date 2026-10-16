// Sanitized sample of a real morph spec view (packages/shared/src/spec-types.ts: View →
// source: Extractor, root: deck ViewNode, siteActions). Abbreviated with "…" for display.
// TODO(AK): confirm this still matches the shipped spec types before launch (listed in /dev/launch-checklist).

export type SpecGroup = "extractor" | "view" | "actions" | null;

/** Each line is [indent, tokens…]; tokens are [kind, text]. */
type Tok = ["k" | "s" | "p" | "c", string]; // key · string · punctuation · comment/ellipsis
export type SpecLine = { group: SpecGroup; indent: number; toks: Tok[] };

const k = (t: string): Tok => ["k", `"${t}"`];
const s = (t: string): Tok => ["s", `"${t}"`];
const p = (t: string): Tok => ["p", t];
const c = (t: string): Tok => ["c", t];

export const specLines: SpecLine[] = [
  { group: null, indent: 0, toks: [p("{")] },
  { group: "extractor", indent: 1, toks: [k("source"), p(": {")] },
  { group: "extractor", indent: 2, toks: [k("itemSelector"), p(": "), s("article.video-card"), p(",")] },
  { group: "extractor", indent: 2, toks: [k("fields"), p(": {")] },
  { group: "extractor", indent: 3, toks: [k("title"), p(":   { "), k("selector"), p(": "), s("h3 a"), p(" },")] },
  { group: "extractor", indent: 3, toks: [k("channel"), p(": { "), k("selector"), p(": "), s(".channel-name"), p(" },")] },
  { group: "extractor", indent: 3, toks: [k("views"), p(":   { "), k("selector"), p(": "), s(".meta span:first-child"), p(",")] },
  { group: "extractor", indent: 5, toks: [k("transform"), p(": [{ "), k("op"), p(": "), s("compactNumber"), p(" }] },")] },
  { group: "extractor", indent: 3, toks: [k("thumb"), p(":   { "), k("selector"), p(": "), s("img"), p(", "), k("attr"), p(": "), s("src"), p(" },")] },
  { group: "extractor", indent: 3, toks: [k("url"), p(":     { "), k("selector"), p(": "), s("h3 a"), p(", "), k("attr"), p(": "), s("href"), p(" }")] },
  { group: "extractor", indent: 2, toks: [p("}")] },
  { group: "extractor", indent: 1, toks: [p("},")] },
  { group: "view", indent: 1, toks: [k("root"), p(": {")] },
  { group: "view", indent: 2, toks: [k("type"), p(": "), s("deck"), p(",")] },
  { group: "view", indent: 2, toks: [k("item"), p(": { "), k("type"), p(": "), s("card"), p(", "), k("children"), p(": ["), c(" … "), p("] },")] },
  { group: "actions", indent: 2, toks: [k("onSwipeRight"), p(": { "), k("type"), p(": "), s("siteAction"), p(", "), k("id"), p(": "), s("watch-later"), p(" },")] },
  { group: "actions", indent: 2, toks: [k("onSwipeLeft"), p(":  { "), k("type"), p(": "), s("dismiss"), p(" }")] },
  { group: "view", indent: 1, toks: [p("},")] },
  { group: "actions", indent: 1, toks: [k("siteActions"), p(": [{")] },
  { group: "actions", indent: 2, toks: [k("id"), p(": "), s("watch-later"), p(",")] },
  { group: "actions", indent: 2, toks: [k("label"), p(": "), s("Save to Watch later"), p(",")] },
  { group: "actions", indent: 2, toks: [k("risk"), p(": "), s("low"), p(",")] },
  { group: "actions", indent: 2, toks: [k("steps"), p(": ["), c(" …open the menu, click “Save to Watch later” "), p("]")] },
  { group: "actions", indent: 1, toks: [p("}]")] },
  { group: null, indent: 0, toks: [p("}")] },
];
