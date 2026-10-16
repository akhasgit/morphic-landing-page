import { create } from "zustand";

/** Keeps the hero's rotating line in sync with the demo's current prompt (§7.1). */
export const useHeroStore = create<{ line: number; setLine: (line: number) => void }>()((set) => ({
  line: 0,
  setLine: (line) => set({ line }),
}));
