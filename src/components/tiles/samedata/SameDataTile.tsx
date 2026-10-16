import { Infinity as InfinityIcon, Route, ScanSearch } from "lucide-react";
import { cssVars } from "@/lib/css";
import { LazySameDataDemo } from "./LazySameDataDemo";
import "./samedata.css";

const proof = [
  { icon: InfinityIcon, title: "Infinite scroll", line: "new items flow into your view as the site loads them." },
  { icon: Route, title: "Follows navigation", line: "move between pages and your view comes with you." },
  { icon: ScanSearch, title: "Nothing invented", line: "if it isn't on the page, it isn't in your view." },
];

/** Tile 03 — Same data · Light (§7.3). */
export function SameDataTile() {
  return (
    <div className="tile-content sd-content">
      <div className="sd-grid">
        <div className="sd-copy">
          <p className="eyebrow reveal">The toggle</p>
          <h2 className="h2-tile sd-h2 reveal" style={cssVars({ i: 1 })}>
            Same page. Same data. Always&nbsp;live.
          </h2>
          <p className="body-copy sd-body reveal" style={cssVars({ i: 2 })}>
            Morphic doesn&rsquo;t build a new app or invent anything. It reads the records already on the page — titles, prices, images,
            links — and renders them in the view you asked for. When the site updates, your view updates with it.
          </p>
          <ul className="sd-proof">
            {proof.map((p, i) => (
              <li key={p.title} className="sd-proof-item reveal" style={cssVars({ i: 3 + i })}>
                <span className="sd-proof-icon" aria-hidden="true">
                  <p.icon size={17} />
                </span>
                <span>
                  <b>{p.title}</b> — {p.line}
                </span>
              </li>
            ))}
          </ul>
          <p className="sd-proof-line reveal" style={cssVars({ i: 3 })}>
            Infinite scroll · Follows navigation · Nothing invented
          </p>
        </div>
        <div className="sd-visual reveal" style={cssVars({ i: 2 })}>
          <LazySameDataDemo />
        </div>
      </div>
    </div>
  );
}
