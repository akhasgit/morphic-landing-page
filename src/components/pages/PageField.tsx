"use client";

import { useEffect, useState } from "react";
import { DotField, type Formation } from "../dotfield/DotField";
import type { IntroKind } from "../dotfield/engine";

/** Light dot field behind a normal page; runs while the tab is visible. */
export function PageField({ formation, intro, layout, textSafe }: { formation?: Formation; intro?: IntroKind; layout?: "final" | "404"; textSafe?: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === "visible");
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return (
    <div className="page-field" aria-hidden="true">
      <DotField theme="light" active={visible} formation={formation} intro={intro} layout={layout} textSafe={textSafe} />
    </div>
  );
}
