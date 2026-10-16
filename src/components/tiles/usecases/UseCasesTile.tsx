import { useCases } from "@/config/useCases";
import { cssVars } from "@/lib/css";
import { UseCasesVisual } from "./UseCasesVisual";
import "./usecases.css";

/** Tile 02 — Use cases · dark "cinema" carousel of real recordings (§7.2). */
export function UseCasesTile() {
  return (
    <>
      <div className="uc-ambient" aria-hidden="true" />
      <div className="tile-content uc-content">
        <header className="uc-head">
          <p className="eyebrow reveal">Use cases</p>
          <h2 className="h2-tile reveal" style={cssVars({ i: 1 })}>
            What will you morph first?
          </h2>
          <p className="uc-sub reveal" style={cssVars({ i: 2 })}>
            Real recordings of Morphic on real websites.
          </p>
        </header>
        <ul className="sr-only">
          {useCases.map((uc) => (
            <li key={uc.id}>
              {uc.title} — {uc.outcome} Prompt used {uc.siteType}: “{uc.prompt}”
            </li>
          ))}
        </ul>
        <div className="uc-body reveal" style={cssVars({ i: 3 })}>
          <UseCasesVisual />
        </div>
      </div>
    </>
  );
}
