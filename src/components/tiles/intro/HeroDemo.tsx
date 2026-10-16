"use client";

import { AnimatePresence, m as motion, useMotionTemplate, useMotionValue, useSpring, type MotionValue } from "motion/react";
import { Check, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { dotBus } from "@/components/dotfield/bus";
import { BrowserFrame, SpedUpBadge } from "@/components/demo/BrowserFrame";
import { MorphicPanel } from "@/components/demo/MorphicPanel";
import { MorphStage, type Layout } from "@/components/demo/MorphStage";
import { useDemoPlayer, type ChatItem, type DemoState } from "@/components/demo/player";
import { chipScript, heroChips, heroScript, type Chip } from "@/components/demo/scripts";
import { sites, videos } from "@/demo/data";
import { track } from "@/lib/analytics";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { useHeroStore } from "@/store/hero";
import { useTile } from "../TileContext";

const LINE_FOR: Partial<Record<Layout, number>> = { "circle-grid": 0, deck: 1, table: 2 };

function nextVersion(items: ChatItem[]) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it.kind === "version") return it.v + 1;
  }
  return 2;
}

/**
 * Hero demo (§7.1): BrowserFrame + MorphStage (Streamly) + docked MorphicPanel on a
 * ~26s autoplay loop. Chips interrupt with a compressed run; autoplay resumes after 8s idle.
 * The frame tilts toward the cursor (±4°) with a specular sheen.
 */
export function HeroDemo() {
  const { isActive } = useTile();
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const { player, state } = useDemoPlayer(isActive);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const startedRef = useRef(false);
  const idle = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const setLine = useHeroStore((s) => s.setLine);

  const syncPlaying = useCallback(() => {
    player.playing = startedRef.current && !pausedRef.current;
  }, [player]);

  const loadAutoplay = useCallback(() => {
    const { events, duration } = heroScript();
    player.load(events, { duration, loop: true });
    syncPlaying();
  }, [player, syncPlaying]);

  const resumeLater = useCallback(() => {
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(loadAutoplay, 8000);
  }, [loadAutoplay]);

  // Boot: autoplay starts once the first-visit intro is done (or right away).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: no autoplay; show the "after" state with a play button.
      const { events } = heroScript();
      player.load(
        events.filter((e) => e.at <= 6500),
        { duration: 6600 },
      );
      player.finish();
      loadAutoplay();
      pausedRef.current = true;
      setPaused(true);
      startedRef.current = true;
      syncPlaying();
      return;
    }
    loadAutoplay();
    const start = () => {
      startedRef.current = true;
      syncPlaying();
    };
    const t = window.setTimeout(start, document.documentElement.dataset.intro === "play" ? 1700 : 450);
    const skip = () => {
      window.clearTimeout(t);
      start();
    };
    window.addEventListener("morphic:intro-skip", skip);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(idle.current);
      window.removeEventListener("morphic:intro-skip", skip);
    };
  }, [player, loadAutoplay, syncPlaying]);

  // Rotating headline follows the prompt being worked on.
  useEffect(() => {
    const l = state.promptLayout ? LINE_FOR[state.promptLayout] : undefined;
    if (l !== undefined) setLine(l);
  }, [state.promptLayout, setLine]);

  /** User took over: stop the loop, come back to autoplay after 8s idle. */
  const holdAutoplay = () => {
    window.clearTimeout(idle.current);
    player.load([], { duration: 0, keepState: true, onEnd: resumeLater });
    startedRef.current = true;
    syncPlaying();
  };

  const runChip = (chip: Chip) => {
    track("demo_chip_click", { prompt: chip.label });
    window.clearTimeout(idle.current);
    const { events, duration } = chipScript(chip, nextVersion(state.items));
    player.load(events, { duration, keepState: true, onEnd: resumeLater });
    startedRef.current = true;
    pausedRef.current = false;
    setPaused(false);
    syncPlaying();
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    startedRef.current = true;
    syncPlaying();
  };

  // Mouse-parallax tilt + specular sheen (desktop, motion allowed, tile active).
  const rx = useSpring(0, { stiffness: 140, damping: 18, mass: 0.7 });
  const ry = useSpring(0, { stiffness: 140, damping: 18, mass: 0.7 });
  const sx = useMotionValue(70);
  const sy = useMotionValue(10);
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(255,255,255,0.14), rgba(255,255,255,0) 55%)`;
  useEffect(() => {
    if (!isActive || !isDesktop || reduced) {
      rx.set(0);
      ry.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const el = frameRef.current;
      if (!el || e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      ry.set(Math.max(-1, Math.min(1, dx)) * 4);
      rx.set(Math.max(-1, Math.min(1, -dy)) * 4);
      sx.set(((e.clientX - r.left) / r.width) * 100);
      sy.set(((e.clientY - r.top) / r.height) * 100);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isActive, isDesktop, reduced, rx, ry, sx, sy]);

  const activeChip = state.toggle ? heroChips.find((c) => c.layout === state.layout && c.prompt)?.label : "Original";

  return (
    <div className="hero-demo">
      <p className="sr-only">
        Demo: a cluttered video site turns into a grid of circles, then swipeable cards, then a table sorted by views, while the Morphic side
        panel shows the agent at work. The original site is one click away.
      </p>
      <div className="hero-frame-wrap">
        <motion.div className="hero-tilt" style={{ rotateX: rx, rotateY: ry }}>
          <div aria-hidden="true" className="hero-frame-shell">
            <BrowserFrame
              ref={frameRef}
              url={sites.streamly.domain}
              className="hero-frame"
              badge={<SpedUpBadge />}
              corner={<span className="hero-pause-slot" />}
              morphicActive={state.toggle}
              panel={
                isDesktop ? (
                  <MorphicPanel
                    state={state}
                    clock={player.clock}
                    domain={sites.streamly.domain}
                    onToggle={() => {
                      track("toggle_flip", { to: state.toggle ? "original" : "morphic" });
                      player.dispatch({ type: "toggle", on: !state.toggle });
                      holdAutoplay();
                    }}
                    onUndo={() => {
                      player.dispatch({ type: "undo" });
                      holdAutoplay();
                    }}
                  />
                ) : undefined
              }
            >
              <MorphStage
                dataset="videos"
                records={videos}
                layout={state.layout}
                sort={state.sort}
                deckSwipe={state.deckSwipe}
                interactive
                onMorphStart={() => dotBus.shockwaveFrom(frameRef.current, 1)}
              />
              <AnimatePresence>
                {state.caption && (
                  <motion.div
                    className="hero-caption"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {state.caption}
                  </motion.div>
                )}
              </AnimatePresence>
              {!isDesktop && <MobilePrompt state={state} clock={player.clock} />}
            </BrowserFrame>
          </div>
          <motion.div className="hero-sheen" style={{ background: sheen }} aria-hidden="true" />
          <button type="button" className="hero-pause" onClick={togglePause} aria-label={paused ? "Play the demo" : "Pause the demo"}>
            {paused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
          </button>
        </motion.div>
      </div>

      <div className="hero-chips">
        <span className="hero-chips-label">Try it — tap a prompt</span>
        <div className="hero-chips-row no-scrollbar" role="group" aria-label="Demo prompts">
          {heroChips.map((c) => (
            <button key={c.label} type="button" className="hero-chip" data-active={activeChip === c.label || undefined} onClick={() => runChip(c)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mobile: no docked panel — the prompt rides on the frame as a panel-style bubble. */
function MobilePrompt({ state, clock }: { state: DemoState; clock: MotionValue<number> }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const update = (t: number) => {
      const ty = state.typing;
      setTyped(ty ? ty.text.slice(0, Math.max(0, Math.floor((t - ty.at) / ty.msPerChar))) : "");
    };
    update(clock.get());
    return clock.on("change", update);
  }, [clock, state.typing]);

  let lastUser: string | null = null;
  let version: number | null = null;
  for (const it of state.items) {
    if (it.kind === "user") {
      lastUser = it.text;
      version = null;
    }
    if (it.kind === "version") version = it.v;
  }
  const text = state.typing ? typed : lastUser;
  if (!text) return null;
  return (
    <div className="hero-mprompt">
      <span className="hero-mprompt-bubble">
        {text}
        {state.typing && <span className="mp-caret" />}
      </span>
      {!state.typing && (
        <span className="hero-mprompt-status">
          {state.running ? (
            <>
              <span className="mp-spin" /> Building the view…
            </>
          ) : version ? (
            <>
              <Check size={12} strokeWidth={3} /> v{version} saved
            </>
          ) : null}
        </span>
      )}
    </div>
  );
}
