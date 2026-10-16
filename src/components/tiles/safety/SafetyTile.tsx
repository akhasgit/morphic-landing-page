import Link from "next/link";
import { site } from "@/config/site";
import { cssVars } from "@/lib/css";
import { Ph } from "@/components/ui/Ph";
import { LazySafetyVisual } from "./LazySafetyVisual";
import { trust } from "./trust";
import { TrustChips } from "./TrustChips";
import "./safety.css";

/** Tile 05 — Safe by design · Light (§7.5). */
export function SafetyTile() {
  return (
    <div className="tile-content sf-content">
      <div className="sf-grid">
        <div className="sf-copy">
          <p className="eyebrow reveal">Safe by design</p>
          <h2 className="h2-tile sf-h2 reveal" style={cssVars({ i: 1 })}>
            Agents design the view. They never run code on your page.
          </h2>
          <p className="body-copy sf-body reveal" style={cssVars({ i: 2 })}>
            Morphic&rsquo;s agents don&rsquo;t write scripts. They produce a morph spec — validated data describing what to read, how to lay
            it out, and which actions are allowed. A fixed renderer turns that spec into UI inside an isolated Shadow DOM.
          </p>
          <ul className="sf-trust">
            {trust.map((t, i) => (
              <li key={t.title} className="sf-trust-item reveal" style={cssVars({ i: 3 + i })}>
                <span className="sf-trust-icon" aria-hidden="true">
                  <t.icon size={16} />
                </span>
                <span>
                  <b>{t.title}</b>
                  <span className="sf-trust-line">{t.line}</span>
                </span>
              </li>
            ))}
          </ul>
          <TrustChips />
          <p className="sf-privacy reveal" style={cssVars({ i: 7 })}>
            <span className="sf-privacy-text">
              <Ph value={site.privacyLine} />
            </span>{" "}
            <Link href="/privacy" className="sf-privacy-link">
              Read the privacy policy →
            </Link>
          </p>
        </div>
        <div className="sf-visual reveal" style={cssVars({ i: 2 })}>
          <p className="sr-only">
            Illustration: a morph spec — an extractor, a deck view and a “Save to Watch later” site action — next to the deck it renders.
            Risky actions such as placing an order show a confirmation first.
          </p>
          <LazySafetyVisual />
        </div>
      </div>
    </div>
  );
}
