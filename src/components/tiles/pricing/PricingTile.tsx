import { site } from "@/config/site";
import { cssVars } from "@/lib/css";
import { Ph } from "@/components/ui/Ph";
import { Pricing } from "./Pricing";
import "./pricing.css";

/** Tile 07 — Pricing · Light (§7.7). */
export function PricingTile() {
  return (
    <div className="tile-content pr-content">
      <header className="pr-head">
        <p className="eyebrow reveal">Pricing</p>
        <h2 className="h2-tile pr-h2 reveal" style={cssVars({ i: 1 })}>
          Start free. Upgrade when you&rsquo;re hooked.
        </h2>
        <p className="pr-sub reveal" style={cssVars({ i: 2 })}>
          A morph is one request that creates or changes a view. <Ph value={site.pricingCopy.morphNote} />
        </p>
      </header>
      <Pricing />
    </div>
  );
}
