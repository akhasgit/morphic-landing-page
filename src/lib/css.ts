import type { CSSProperties } from "react";

/** Inline CSS custom properties: cssVars({ i: 2, d: "800ms" }) → { "--i": 2, "--d": "800ms" } */
export function cssVars(vars: Record<string, string | number>, style?: CSSProperties): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(vars)) out[`--${k}`] = v;
  return { ...out, ...style } as CSSProperties;
}
