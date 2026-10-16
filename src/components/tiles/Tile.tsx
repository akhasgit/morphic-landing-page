import type { ReactNode } from "react";
import { tiles } from "@/config/tiles";
import { TileProvider } from "./TileContext";

/**
 * One full-screen snapping tile (§6.2).
 *
 * <section>   untransformed; snap target, IntersectionObserver target, names the view timeline
 *   .tile-shade  shadow cast upward on the tile below while this one slides in
 *   .tile-frame  pinned/sinking/rounded via the section's view timeline
 *     .tile-bg   theme background (kept off the frame so corner radius changes don't repaint it)
 *     content
 *     .tile-dim  darkens as the next tile covers this one
 */
export function Tile({ index, children }: { index: number; children: ReactNode }) {
  const t = tiles[index];
  return (
    <section
      id={t.id}
      data-tile={index}
      data-theme={t.theme}
      data-revealed={index === 0 ? "true" : "false"}
      className="tile"
      style={{ zIndex: index + 1 }}
      aria-label={t.label}
    >
      <div className="tile-shade" aria-hidden="true" />
      <div className="tile-frame">
        <div className="tile-bg" aria-hidden="true" />
        <TileProvider index={index} id={t.id}>
          {children}
        </TileProvider>
        <div className="tile-dim" aria-hidden="true" />
      </div>
    </section>
  );
}
