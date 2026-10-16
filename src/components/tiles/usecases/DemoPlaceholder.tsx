import { Play } from "lucide-react";
import type { UseCase } from "@/config/useCases";

/**
 * Stand-in for a recording (§7.2): same 16:10 box, drifting mesh gradient from the card's
 * ambient colors, and the exact path the real file should live at. The carousel simulates
 * an 8s playback for it, so focus, auto-advance, segments and ambient glow all behave
 * like the real thing.
 */
export function DemoPlaceholder({ uc }: { uc: UseCase }) {
  const [a, b] = uc.ambient;
  return (
    <div className="uc-ph" style={{ ["--a" as string]: a, ["--b" as string]: b }}>
      <div className="uc-ph-mesh" aria-hidden="true" />
      <div className="uc-ph-grain" aria-hidden="true" />
      <div className="uc-ph-content">
        <span className="uc-ph-play" aria-hidden="true">
          <Play strokeWidth={1.5} />
        </span>
        <span className="uc-ph-num">DEMO {uc.id}</span>
        <span className="uc-ph-title">{uc.title}</span>
        <span className="uc-ph-path">VIDEO COMING SOON · /public/videos/{uc.id}.mp4</span>
      </div>
    </div>
  );
}
