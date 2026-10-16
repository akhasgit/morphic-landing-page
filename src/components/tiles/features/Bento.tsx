"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { cssVars } from "@/lib/css";
import { useTile } from "../TileContext";
import { ButtonsMicro, ChartsMicro, EverywhereMicro, PointMicro, RepairMicro, UndoMicro } from "./micro";

type Feature = { id: string; span: 1 | 2; title: string; copy: string; Micro: ComponentType<{ reduced: boolean }>; loopMs: number };

// Copy is final (§7.6). "Views that repair themselves" is a (verify) claim — see /dev/launch-checklist.
const features: Feature[] = [
  { id: "A", span: 2, title: "Point at anything", copy: "Pick one element with the cursor tool and reshape just that part.", Micro: PointMicro, loopMs: 3400 },
  { id: "B", span: 1, title: "Undo anything", copy: "Every morph is a version. Roll back in one click.", Micro: UndoMicro, loopMs: 3000 },
  { id: "C", span: 1, title: "Views that repair themselves", copy: "When a site changes and a view breaks, agents fix it.", Micro: RepairMicro, loopMs: 2800 },
  { id: "D", span: 1, title: "Works the site's own buttons", copy: "Swipe right to “Save to Watch later” — Morphic clicks the real button.", Micro: ButtonsMicro, loopMs: 2800 },
  { id: "E", span: 1, title: "Save once, use everywhere", copy: "A saved view applies to every matching page.", Micro: EverywhereMicro, loopMs: 2400 },
  { id: "F", span: 2, title: "Charts and chat over any data", copy: "Turn tables and dashboards into charts, then ask questions about the numbers.", Micro: ChartsMicro, loopMs: 3800 },
];

/**
 * Bento (§7.6): 4×2 grid. Each tile has a cursor-following spotlight on its border and a
 * micro-animation that plays on tile entry and loops on hover. Mobile: one tile at a time.
 */
export function Bento() {
  const { isCurrent } = useTile();
  const [entry, setEntry] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [dot, setDot] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (isCurrent) setEntry((e) => e + 1);
  }, [isCurrent]);

  // Mobile dots follow the horizontal scroll position.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.firstElementChild?.getBoundingClientRect().width ?? 1;
      setDot(Math.round(el.scrollLeft / (w + 12)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bento-wrap">
      <div ref={scroller} className="bento no-scrollbar">
        {features.map((f, i) => (
          <BentoTile key={f.id} f={f} index={i} entry={entry} reduced={reduced} />
        ))}
      </div>
      <div className="bento-dots" aria-hidden="true">
        {features.map((f, i) => (
          <span key={f.id} data-on={i === dot || undefined} />
        ))}
      </div>
    </div>
  );
}

function BentoTile({ f, index, entry, reduced }: { f: Feature; index: number; entry: number; reduced: boolean }) {
  const [hoverRun, setHoverRun] = useState(0);
  const [hovering, setHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hovering || reduced) return;
    setHoverRun((r) => r + 1);
    const iv = window.setInterval(() => setHoverRun((r) => r + 1), f.loopMs);
    return () => window.clearInterval(iv);
  }, [hovering, reduced, f.loopMs]);

  return (
    <div
      ref={ref}
      className="bento-tile reveal"
      data-span={f.span}
      style={cssVars({ i: 2 + index })}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div className="bento-micro" aria-hidden="true">
        <f.Micro key={`${entry}-${hoverRun}`} reduced={reduced} />
      </div>
      <div className="bento-text">
        <h3 className="bento-title">{f.title}</h3>
        <p className="bento-copy">{f.copy}</p>
      </div>
    </div>
  );
}
