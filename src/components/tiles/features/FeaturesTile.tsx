import { cssVars } from "@/lib/css";
import { Bento } from "./Bento";
import "./features.css";

/** Tile 06 — Features · Dark bento (§7.6). */
export function FeaturesTile() {
  return (
    <div className="tile-content ft-content">
      <header className="ft-head">
        <p className="eyebrow reveal">Built for the real web</p>
        <h2 className="h2-tile ft-h2 reveal" style={cssVars({ i: 1 })}>
          Built for the messy, real web.
        </h2>
      </header>
      <Bento />
    </div>
  );
}
