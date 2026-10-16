// How it works (§7.4) — copy is final.
export const howSteps = [
  {
    title: "You describe it.",
    body: "Type what you want in the side panel, like you'd brief a designer. Or use the picker to point at one part of the page and reshape just that.",
  },
  {
    title: "The Data agent reads the page.",
    body: "It finds the records — every video, product or row — and writes an extractor: the selectors that pull them from the live page.",
  },
  {
    title: "The UI agent designs the view.",
    body: "It builds the layout from Morphic's components — decks, grids, tables, charts, kanban boards, chat — and streams live previews as it goes.",
  },
  {
    title: "The QA agent checks the work.",
    body: "It screenshots the result and checks it against the extracted data. If something's off, it goes back for a fix.",
  },
  {
    title: "You get a version.",
    body: "The result is saved as a version you can undo, revisit, or reapply on every matching page.",
  },
] as const;

export const STEP_MS = 4500;
