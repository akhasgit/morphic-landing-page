// Tiny pub-sub so demos, CTAs and inputs anywhere on the page can poke the dot field
// that's currently running (§8.3: shockwaves from morphs, CTA hover, input submit).

type Shock = { x: number; y: number; strength: number };
type Listener = { shock: (s: Shock) => void; breathe: (on: boolean) => void };

const listeners = new Set<Listener>();

export const dotBus = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
  /** Client coordinates. Only fields that are running and contain the point react. */
  shockwave(x: number, y: number, strength = 1) {
    listeners.forEach((l) => l.shock({ x, y, strength }));
  },
  /** Shockwave from the center of an element. */
  shockwaveFrom(el: Element | null, strength = 1) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    dotBus.shockwave(r.left + r.width / 2, r.top + r.height / 2, strength);
  },
  breathe(on: boolean) {
    listeners.forEach((l) => l.breathe(on));
  },
};
