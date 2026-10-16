"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { installUrl } from "@/lib/links";

/** A plain link to the Web Store listing (UTM'd) that fires cta_install_click. */
export function StoreLink({ tile, className, children }: { tile: string; className?: string; children: ReactNode }) {
  const href = installUrl(tile);
  return (
    <a
      href={href ?? "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener" : undefined}
      className={className}
      onClick={(e) => {
        track("cta_install_click", { tile });
        if (!href) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
