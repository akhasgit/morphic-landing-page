"use client";

import { useEffect, useRef, type RefObject } from "react";
import { site } from "@/config/site";
import { dotBus } from "./bus";
import { dotField, type DotFieldConfig, type DotTheme } from "./config";
import { DotFieldEngine, type FormationLayout, type IntroKind, type Rect } from "./engine";
import { loadImageMask, textMask, type ShapeMask } from "./shapes";
import "./dotfield.css";

export type Formation = { kind: "logo" } | { kind: "text"; text: string };

/** Where a formation sits in the field. */
export const formationLayouts: Record<"final" | "404", FormationLayout> = {
  // Final tile: the "M", ~380px tall on desktop, upper-middle so the H2 can overlap its lower third.
  final: (w, h, aspect) => {
    if (w < 640) return { cx: w / 2, cy: h * 0.25, height: Math.min((w * 0.58) / aspect, h * 0.22) };
    return { cx: w / 2, cy: h * 0.345, height: Math.min(380, h * 0.42, (w * 0.5) / aspect) };
  },
  "404": (w, h, aspect) => ({ cx: w / 2, cy: h * 0.36, height: Math.min(230, h * 0.28, (w * 0.82) / aspect) }),
};

type Props = {
  theme: DotTheme;
  /** Run physics/rendering only while true (active tile + visible tab). */
  active: boolean;
  formation?: Formation;
  layout?: keyof typeof formationLayouts;
  /** "logo-burst" only plays on the first visit of the session (html[data-intro=play]). */
  intro?: IntroKind;
  /** Elements whose area keeps dots dim so text stays crisp (refs, or a CSS selector). */
  textSafe?: RefObject<HTMLElement | null>[] | string;
  config?: DotFieldConfig;
  className?: string;
  onEngine?: (engine: DotFieldEngine | null) => void;
};

function displayFont() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-inter-tight").trim();
  return v || "ui-sans-serif, system-ui, sans-serif";
}

/**
 * Full-bleed interactive dot field (§8). Dots part around the cursor into a glowing lens
 * ring and spring back; a ghost cursor keeps it alive on idle and on touch; clicks, demo
 * morphs and CTAs send shockwaves through it.
 */
export function DotField({ theme, active, formation, layout = "final", intro = "none", textSafe, config, className = "", onEngine }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DotFieldEngine | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Engine lifecycle
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const engine = new DotFieldEngine(canvas, { theme, reducedMotion, touch, halo: haloRef.current, config: config ?? dotField });
    engineRef.current = engine;
    onEngine?.(engine);

    const measure = () => {
      rectRef.current = canvas.getBoundingClientRect();
    };
    const textRects = (): Rect[] => {
      const base = canvas.getBoundingClientRect();
      const els =
        typeof textSafe === "string"
          ? Array.from(document.querySelectorAll<HTMLElement>(textSafe))
          : (textSafe ?? []).map((r) => r.current);
      return els
        .map((el) => el?.getBoundingClientRect())
        .filter((r): r is DOMRect => !!r && r.width > 0)
        .map((r) => ({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }));
    };

    let first = true;
    let timer = 0;
    const doResize = () => {
      const r = wrap.getBoundingClientRect();
      // Layout size, not transformed size (the tile may be mid-stack-animation).
      engine.resize(wrap.offsetWidth || r.width, wrap.offsetHeight || r.height, window.devicePixelRatio || 1);
      engine.setTextSafe(textRects());
      measure();
      if (first) {
        first = false;
        requestAnimationFrame(() => wrap.setAttribute("data-ready", ""));
      }
    };
    const ro = new ResizeObserver(() => {
      if (first) return doResize();
      window.clearTimeout(timer);
      timer = window.setTimeout(doResize, 150);
    });
    ro.observe(wrap);

    // Formation (logo "M" / "404")
    let cancelled = false;
    if (formation) {
      const load: Promise<ShapeMask> =
        formation.kind === "logo"
          ? loadImageMask(site.brand.mark)
          : document.fonts.ready.then(() => textMask(formation.text, displayFont(), 600));
      load
        .then((mask) => {
          if (!cancelled) engine.setFormation(mask, formationLayouts[layout]);
          if (!cancelled && intro === "scatter") engine.playIntro("scatter");
        })
        .catch(() => {});
    } else if (intro === "scatter") {
      engine.playIntro("scatter");
    }

    // First-visit intro: dots start packed in the "M", then burst to the grid.
    // The CSS word-rise starts at first paint; if hydration came too late to lead it, skip
    // the burst rather than play it out of sync (the field just fades in).
    if (intro === "logo-burst" && document.documentElement.dataset.intro === "play" && performance.now() < 1100) {
      loadImageMask(site.brand.mark)
        .then((mask) => {
          if (!cancelled && performance.now() < 1300) engine.playIntro("logo-burst", mask);
        })
        .catch(() => {});
    }

    const onSkip = () => engine.skipIntro();
    window.addEventListener("morphic:intro-skip", onSkip);

    // Pointer → field (window-level so content above the canvas doesn't block it)
    const toLocal = (cx: number, cy: number) => {
      const r = rectRef.current;
      if (!r) return null;
      return { x: cx - r.left, y: cy - r.top, inside: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom };
    };
    const onMove = (e: PointerEvent) => {
      if (!activeRef.current || e.pointerType === "touch") return;
      const p = toLocal(e.clientX, e.clientY);
      if (p) engine.pointer(p.x, p.y);
    };
    const onDown = (e: PointerEvent) => {
      if (!activeRef.current) return;
      const p = toLocal(e.clientX, e.clientY);
      if (p?.inside) engine.shockwave(p.x, p.y, e.pointerType === "touch" ? 0.9 : 0.75);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) engine.pointerLeave();
    };
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        measure();
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    const unsub = dotBus.subscribe({
      shock: ({ x, y, strength }) => {
        if (!activeRef.current) return;
        const p = toLocal(x, y);
        if (p?.inside) engine.shockwave(p.x, p.y, strength);
      },
      breathe: (on) => {
        engine.breathTarget = on ? 1 : 0;
      },
    });

    return () => {
      cancelled = true;
      ro.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("morphic:intro-skip", onSkip);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", onScroll);
      unsub();
      engine.destroy();
      engineRef.current = null;
      onEngine?.(null);
    };
    // Options are read once; changing them remounts via `key` at the call site.
  }, []);

  // Run only while active (and the tab is visible — `active` already includes that).
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (active) {
      rectRef.current = canvasRef.current?.getBoundingClientRect() ?? null;
    }
    engine.setRunning(active);
  }, [active]);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <div ref={wrapRef} className={`dotfield ${className}`} data-theme-dots={theme} aria-hidden="true">
      <div ref={haloRef} className="dotfield-halo" />
      <canvas ref={canvasRef} className="dotfield-canvas" />
    </div>
  );
}
