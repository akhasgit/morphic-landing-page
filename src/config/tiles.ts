// The homepage is 9 full-screen tiles (§6.1). Order here = order on the page.

export type TileTheme = "hero" | "light" | "dark" | "midnight";

export const tiles = [
  { id: "intro", label: "Intro", theme: "hero" },
  { id: "use-cases", label: "Use cases", theme: "dark" },
  { id: "same-data", label: "Same data", theme: "light" },
  { id: "how-it-works", label: "How it works", theme: "dark" },
  { id: "safety", label: "Safety", theme: "light" },
  { id: "features", label: "Features", theme: "dark" },
  { id: "pricing", label: "Pricing", theme: "light" },
  { id: "faq", label: "FAQ", theme: "dark" },
  { id: "get-morphic", label: "Get Morphic", theme: "midnight" },
] as const satisfies readonly { id: string; label: string; theme: TileTheme }[];

export type TileId = (typeof tiles)[number]["id"];

/** Floating chrome (logo, glass pill, dock) only needs light vs dark ink. */
export function chromeTheme(theme: TileTheme): "light" | "dark" {
  return theme === "hero" || theme === "light" ? "light" : "dark";
}

export const tileIndex = (id: TileId) => tiles.findIndex((t) => t.id === id);
export const pad2 = (n: number) => String(n).padStart(2, "0");
