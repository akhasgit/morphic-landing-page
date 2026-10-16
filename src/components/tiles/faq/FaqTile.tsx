import { Faq } from "./Faq";
import "./faq.css";

/** Tile 08 — FAQ · Dark (§7.8). FAQPage JSON-LD is emitted by the page. */
export function FaqTile() {
  return (
    <div className="tile-content faq-content">
      <h2 className="h2-tile faq-h2 reveal">Questions, answered.</h2>
      <Faq />
    </div>
  );
}
