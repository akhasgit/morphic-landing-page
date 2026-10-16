// src/components/dotfield/config.ts — starting values, tune by feel (/dev/dots edits these live)
export const dotField = {
  spacing: { desktop: 14, tablet: 18, mobile: 22 }, // px between dots
  radius: 1.4, // base dot radius (px)
  depthLayers: [0.6, 0.8, 1.0], // random per dot: scales size + reaction → parallax depth
  physics: {
    spring: 0.045, // pull back to home
    damping: 0.88, // velocity multiplier per frame
    cursorRadius: 160, // px (110 on mobile)
    cursorRadiusMobile: 110,
    strength: 4.4, // repulsion force (spec start: 2.4 — raised so the hollow lens reads clearly)
    wake: 0.08, // dots get dragged along cursor velocity (fluid feel)
    maxDisplacement: 64, // clamp → dots pile up at the ring instead of scattering
  },
  shockwave: { speed: 900, life: 0.8, strength: 6 }, // px/s, s, impulse
  ghostCursor: { idleMs: 4000, strength: 0.6 },
  textSafeOpacity: 0.35, // multiplier for dots behind the headline area
  formationStep: 7, // px grid used to sample the logo / text masks (~6–7px)
};

export type DotFieldConfig = typeof dotField;

type RGBA = [number, number, number, number];

export type DotTheme = "light" | "midnight";

/** Colors mirror the --hero-* / --mid-* tokens in globals.css. */
export const dotThemes: Record<DotTheme, { base: RGBA; active: RGBA; form: RGBA; additive: boolean; glow: number; formGlow: number }> = {
  light: {
    base: [99, 102, 241, 0.3], // --hero-dot
    active: [124, 58, 237, 1], // --hero-dot-active
    form: [109, 40, 217, 0.9],
    additive: false,
    glow: 0.8,
    formGlow: 0,
  },
  midnight: {
    base: [165, 180, 252, 0.35], // --mid-dot
    active: [255, 255, 255, 0.9], // --mid-dot-active
    form: [196, 189, 255, 0.62],
    additive: true,
    glow: 0.6,
    formGlow: 0.22,
  },
};
