"use client";

import { Switch } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserFrame } from "@/components/demo/BrowserFrame";
import { MorphStage } from "@/components/demo/MorphStage";
import { moreProducts, products, sites, type Product } from "@/demo/data";
import { track } from "@/lib/analytics";
import { useIsDesktop } from "@/lib/hooks";
import { useTile } from "../TileContext";

/**
 * Tile 03 demo (§7.3): the panel toggle at 2× over a Shopwise results page.
 * Off = cluttered results; on = a sortable comparison table of the same records.
 * While on, the "site" keeps loading products and changing prices, and the view follows.
 */
export default function SameDataDemo() {
  const { isActive, isCurrent } = useTile();
  const isDesktop = useIsDesktop();
  const [on, setOn] = useState(false);
  const [touched, setTouched] = useState(false);
  const [records, setRecords] = useState<Product[]>(products);
  const [pulse, setPulse] = useState<string[]>([]);
  const [flash, setFlash] = useState<string[]>([]);
  const recordsRef = useRef(records);
  recordsRef.current = records;
  const userFlipped = useRef(false);
  const poolIndex = useRef(0);

  // Each time the tile becomes active: start from the original and flip once.
  useEffect(() => {
    if (!isCurrent) return;
    userFlipped.current = false;
    setOn(false);
    setRecords(products);
    poolIndex.current = 0;
    const t = window.setTimeout(() => {
      if (!userFlipped.current) setOn(true);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [isCurrent]);

  // Live mode: new results stream in (~3s) and a price drops (~7s).
  useEffect(() => {
    if (!on || !isActive) return;
    const add = window.setInterval(() => {
      const p = moreProducts[poolIndex.current];
      if (!p) return;
      poolIndex.current++;
      setRecords((r) => [p, ...r]);
      setPulse([p.id]);
    }, 3000);
    const tick = window.setInterval(() => {
      const list = recordsRef.current;
      const candidates = list.filter((p) => p.price >= 45);
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      if (!target) return;
      const drop = target.price >= 120 ? 10 : 5;
      setRecords((r) => r.map((p) => (p.id === target.id ? { ...p, oldPrice: p.oldPrice ?? p.price, price: p.price - drop } : p)));
      setFlash([target.id]);
    }, 7000);
    return () => {
      window.clearInterval(add);
      window.clearInterval(tick);
    };
  }, [on, isActive]);

  useEffect(() => {
    if (!flash.length) return;
    const t = window.setTimeout(() => setFlash([]), 1700);
    return () => window.clearTimeout(t);
  }, [flash]);

  const flip = useCallback((next: boolean) => {
    userFlipped.current = true;
    setTouched(true);
    setOn(next);
    track("toggle_flip", { tile: "same-data", to: next ? "morphic" : "original" });
  }, []);

  return (
    <div className="sd-demo">
      <div className="sd-switch-row">
        <span className={`sd-switch-label ${!on ? "is-on" : ""}`} aria-hidden="true">
          Original
        </span>
        <Switch.Root
          className="sd-switch"
          data-untouched={!touched || undefined}
          checked={on}
          onCheckedChange={flip}
          aria-label="Show the Morphic view of this page"
        >
          <Switch.Thumb className="sd-switch-thumb" />
        </Switch.Root>
        <span className={`sd-switch-label ${on ? "is-on" : ""}`} aria-hidden="true">
          Morphic
        </span>
      </div>
      <div className="sd-frame-wrap">
        <BrowserFrame
          url={`${sites.shopwise.domain}/search?q=headphones`}
          className="sd-frame"
          morphicActive={on}
          badge={
            on ? (
              <span className="sd-live" aria-hidden="true">
                <span className="live-dot" /> Live
              </span>
            ) : undefined
          }
        >
          <MorphStage
            dataset="products"
            records={records}
            layout={on ? "table" : "original"}
            compact={!isDesktop}
            pulseIds={pulse}
            flashIds={flash}
            sourceTips={isDesktop}
            interactive
          />
        </BrowserFrame>
      </div>
      <p className="sr-only" aria-live="polite">
        {on
          ? `Morphic view: a comparison table of ${records.length} products from the page, updating live.`
          : "Original page: cluttered search results."}
      </p>
    </div>
  );
}
