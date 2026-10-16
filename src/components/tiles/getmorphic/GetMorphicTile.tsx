import { cssVars } from "@/lib/css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { BreatheReset, GetMorphicCta, GetMorphicField, IdeaInput } from "./GetMorphic";
import "./getmorphic.css";

/** Tile 09 — Get Morphic · Midnight + dot field, footer inside (§7.9). */
export function GetMorphicTile() {
  return (
    <>
      <GetMorphicField />
      <BreatheReset />
      <div className="tile-content gm-content">
        <div className="gm-stack">
          <h2 className="h2-tile gm-h2 reveal">Stop adapting to websites. Make them adapt to&nbsp;you.</h2>
          <div className="reveal" style={cssVars({ i: 1 })}>
            <GetMorphicCta />
          </div>
          <div className="gm-idea reveal" style={cssVars({ i: 2 })}>
            <IdeaInput />
          </div>
        </div>
        <SiteFooter home className="gm-footer reveal" />
      </div>
    </>
  );
}
