import { Fragment } from "react";
import { site } from "@/config/site";
import { cssVars } from "@/lib/css";
import { Ph } from "@/components/ui/Ph";
import { StoreLink } from "@/components/ui/StoreLink";
import { HeroCtas } from "./HeroCtas";
import { HeroDemo } from "./HeroDemo";
import { HeroField } from "./HeroField";
import { RotatingLine } from "./RotatingLine";
import "./hero.css";

const H1 = "Tell any website how to look.";

/** Tile 01 — Intro (§7.1). The H1 and copy are static HTML (the LCP element). */
export function IntroTile() {
  const words = H1.split(" ");
  return (
    <>
      <HeroField />
      <div className="tile-content hero-content">
        <div className="hero-grid">
          <div id="hero-copy" className="hero-copy">
            <div className="reveal intro-fade" style={cssVars({ i: 0, d: "700ms" })}>
              <StoreLink tile="intro-eyebrow" className="hero-eyebrow glass">
                <span className="live-dot" aria-hidden="true" />
                Now on the Chrome Web Store <span aria-hidden="true">→</span>
              </StoreLink>
            </div>

            <h1 className="h1-hero hero-h1 reveal" style={cssVars({ i: 1 })}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="intro-word" style={cssVars({ w: i })}>
                    {w}
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </h1>

            <p className="hero-line reveal intro-fade" style={cssVars({ i: 2, d: "860ms" })}>
              Turn this <span className="hero-line-feed">feed</span> into <RotatingLine />.
            </p>

            <p className="body-copy hero-body reveal intro-fade" style={cssVars({ i: 3, d: "940ms" })}>
              Morphic is a Chrome extension that rebuilds the page you&rsquo;re on into the interface you describe — using the site&rsquo;s
              real, live data. Undo anything. Flip back to the original in one click.
            </p>

            <div className="reveal intro-fade" style={cssVars({ i: 4, d: "1020ms" })}>
              <HeroCtas />
            </div>

            <p className="hero-micro reveal intro-fade" style={cssVars({ i: 5, d: "1080ms" })}>
              Free plan · No credit card · <Ph value={site.supportedBrowsers} />
            </p>
          </div>

          <div className="hero-demo-col reveal intro-fade" style={cssVars({ i: 3, d: "880ms" })}>
            <HeroDemo />
          </div>
        </div>
      </div>
    </>
  );
}
