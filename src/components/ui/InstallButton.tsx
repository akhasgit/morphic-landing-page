"use client";

import type { CSSProperties, PointerEventHandler, ReactNode } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { useBrowserKind, type BrowserKind } from "@/lib/browser";
import { installUrl } from "@/lib/links";
import { text } from "@/lib/placeholder";
import { useUi } from "@/store/ui";

const FULL: Record<BrowserKind, string> = {
  chromium: "Add to Chrome — it's free",
  other: "Get Morphic for Chrome",
  mobile: "Get the link",
};
const SHORT: Record<BrowserKind, string> = {
  chromium: "Add to Chrome",
  other: "Get Morphic",
  mobile: "Get the link",
};

type Props = {
  /** utm_medium + analytics `tile` */
  tile: string;
  size?: "lg" | "md" | "sm";
  short?: boolean;
  sweep?: boolean;
  className?: string;
  style?: CSSProperties;
  icon?: ReactNode;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  /** Mobile behaviour: open the email sheet (default) — dock/hero all use this. */
};

/**
 * Every install CTA (§10). Desktop Chromium → Web Store link with UTM; Firefox/Safari →
 * "Get Morphic for Chrome" with a tooltip; mobile/tablet → "Get the link" email sheet.
 * All label variants sit in one grid cell so swapping after hydration never shifts layout.
 */
export function InstallButton({ tile, size = "lg", short, sweep, className = "", style, icon, onPointerEnter }: Props) {
  const kind = useBrowserKind();
  const openEmail = useUi((s) => s.openEmail);
  const labels = short ? SHORT : FULL;
  const cls = `btn btn-primary btn-${size} ${sweep ? "btn-sweep" : ""} ${className}`;

  const label = (
    <span className="grid">
      {(Object.keys(labels) as BrowserKind[]).map((k) => (
        <span
          key={k}
          className="col-start-1 row-start-1 flex items-center justify-center gap-2"
          style={{ visibility: k === kind ? "visible" : "hidden" }}
          aria-hidden={k !== kind}
        >
          {icon}
          {labels[k]}
        </span>
      ))}
    </span>
  );

  if (kind === "mobile") {
    return (
      <button
        type="button"
        className={cls}
        style={style}
        onPointerEnter={onPointerEnter}
        onClick={() => {
          track("cta_install_click", { tile });
          openEmail(tile);
        }}
      >
        {label}
      </button>
    );
  }

  const href = installUrl(tile);
  return (
    <a
      href={href ?? "#"}
      className={`${cls} ${kind === "other" ? "group/tip" : ""}`}
      style={style}
      onPointerEnter={onPointerEnter}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener" : undefined}
      onClick={(e) => {
        track("cta_install_click", { tile });
        if (!href) {
          e.preventDefault();
          if (process.env.NODE_ENV !== "production") console.warn("site.chromeStoreUrl is not set yet");
        }
      }}
    >
      {label}
      {kind === "other" && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-10 w-max max-w-[260px] -translate-x-1/2 rounded-lg bg-[#0a0a0b] px-3 py-2 text-center text-[12.5px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100"
        >
          Morphic runs in {text(site.supportedBrowsers)} on desktop.
        </span>
      )}
    </a>
  );
}
