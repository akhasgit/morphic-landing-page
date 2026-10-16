"use client";

import { useEffect, useState } from "react";
import { BrowserFrame, SpedUpBadge } from "@/components/demo/BrowserFrame";
import { MorphicPanel } from "@/components/demo/MorphicPanel";
import { MorphStage, type Layout } from "@/components/demo/MorphStage";
import { useDemoPlayer } from "@/components/demo/player";
import { heroScript } from "@/components/demo/scripts";
import { products, sites, videos } from "@/demo/data";
import "@/components/demo/demo.css";

const LAYOUTS: Layout[] = ["original", "circle-grid", "deck", "table", "grid", "reader", "big-text"];

/** /dev/demo — the demo engine in isolation (§5, §15 step 3). */
export function DemoLab() {
  const [auto, setAuto] = useState(true);
  const { player, state } = useDemoPlayer(auto);
  const [manual, setManual] = useState<Layout>("original");
  const [productLayout, setProductLayout] = useState<Layout>("original");

  useEffect(() => {
    const { events, duration } = heroScript();
    player.load(events, { duration, loop: true });
    player.playing = true;
  }, [player]);

  const layout = auto ? state.layout : manual;

  return (
    <div data-theme="dark" className="min-h-dvh bg-[var(--bg)] p-6 text-ink">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button className={`rounded-lg border px-3 py-1.5 text-sm ${auto ? "border-accent bg-accent text-white" : "border-line"}`} onClick={() => setAuto(true)}>
          Autoplay
        </button>
        {LAYOUTS.map((l) => (
          <button
            key={l}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${!auto && manual === l ? "border-accent bg-accent text-white" : "border-line"}`}
            onClick={() => {
              setAuto(false);
              setManual(l);
            }}
          >
            {l}
          </button>
        ))}
        <span className="ml-3 font-mono text-xs text-ink-3">layout: {layout}</span>
      </div>

      <BrowserFrame
        url={sites.streamly.domain}
        className="h-[560px] w-[860px]"
        badge={<SpedUpBadge />}
        panel={<MorphicPanel state={state} clock={player.clock} domain={sites.streamly.domain} interactive />}
      >
        <MorphStage dataset="videos" records={videos} layout={layout} sort={auto ? state.sort : null} deckSwipe={state.deckSwipe} interactive />
      </BrowserFrame>

      <div className="mb-3 mt-8 flex gap-2">
        {(["original", "table", "grid"] as Layout[]).map((l) => (
          <button
            key={l}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${productLayout === l ? "border-accent bg-accent text-white" : "border-line"}`}
            onClick={() => setProductLayout(l)}
          >
            products: {l}
          </button>
        ))}
      </div>
      <div className="flex gap-6">
        <BrowserFrame url={`${sites.shopwise.domain}/search?q=headphones`} className="h-[480px] w-[820px]">
          <MorphStage dataset="products" records={products} layout={productLayout} interactive sourceTips />
        </BrowserFrame>
        <BrowserFrame url={sites.shopwise.domain} className="h-[480px] w-[340px]">
          <MorphStage dataset="products" records={products} layout={productLayout} compact />
        </BrowserFrame>
      </div>
    </div>
  );
}
