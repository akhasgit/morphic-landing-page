import { Lock, Puzzle } from "lucide-react";
import type { CSSProperties, ReactNode, Ref } from "react";
import { AppIcon } from "../ui/AppIcon";

/**
 * Browser chrome for coded demos (§5.3): traffic lights, back/forward, URL pill,
 * extension puzzle icon; optional docked side panel on the right.
 */
export function BrowserFrame({
  url,
  children,
  panel,
  corner,
  badge,
  className = "",
  style,
  ref,
  morphicActive = true,
}: {
  url: string;
  children: ReactNode;
  panel?: ReactNode;
  /** Top-right slot inside the toolbar (e.g. pause/play). */
  corner?: ReactNode;
  /** Toolbar badge before the extension icons (e.g. "▶▶ sped up"). */
  badge?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  morphicActive?: boolean;
}) {
  return (
    <div ref={ref} className={`d-frame ${className}`} style={style}>
      <div className="d-frame-bar">
        <span className="d-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="d-navs" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".45">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
        <span className="d-url">
          <Lock className="d-url-lock" aria-hidden="true" />
          <span className="truncate">{url}</span>
        </span>
        {badge}
        <span className="d-ext" aria-hidden="true">
          <span className={`d-ext-icon ${morphicActive ? "is-on" : ""}`}>
            <AppIcon size={14} bar={false} />
          </span>
          <Puzzle className="d-ext-puzzle" />
        </span>
        {corner}
      </div>
      <div className="d-frame-body">
        <div className="d-frame-page">
          {children}
        </div>
        {panel && <div className="d-frame-panel">{panel}</div>}
      </div>
    </div>
  );
}

export function SpedUpBadge() {
  return (
    <span className="d-sped" title="This demo is sped up; step timings are real.">
      ▶▶ sped up
    </span>
  );
}
