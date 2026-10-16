"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cssVars } from "@/lib/css";
import { useIsDesktop } from "@/lib/hooks";
import { innerProgress } from "@/store/tiles";
import { useTile } from "../TileContext";
import { AgentGraph } from "./AgentGraph";
import { StepPreview } from "./StepPreview";
import { howSteps, STEP_MS } from "./steps";

/**
 * Tile 04 stepper (§7.4): five steps played like stories. Auto-advances every 4.5s,
 * clicking jumps, hovering pauses; progress feeds the glass pill.
 */
export function HowItWorks() {
  const { isActive, isCurrent } = useTile();
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState(false);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);
  const progress = useMotionValue(0);
  const pill = innerProgress["how-it-works"];
  const stepRef = useRef(0);
  stepRef.current = step;

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // Restart the story each time the tile becomes active.
  useEffect(() => {
    if (isCurrent) {
      setStep(0);
      progress.set(0);
      pill.set(0);
    }
  }, [isCurrent, progress, pill]);

  const running = isActive && !hover && !held && !reduced;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(t - last, 64);
      last = t;
      let p = progress.get() + dt / STEP_MS;
      if (p >= 1) {
        p = 0;
        setStep((s) => (s + 1) % howSteps.length);
      }
      progress.set(p);
      pill.set((stepRef.current + p) / howSteps.length);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, progress, pill]);

  const go = (i: number) => {
    const n = howSteps.length;
    const next = ((i % n) + n) % n;
    setStep(next);
    progress.set(0);
    pill.set(next / n);
  };

  // Mobile: tap right half → next, left half → back; press-and-hold pauses (stories).
  const press = useRef<{ t: number; x: number; timer: number } | null>(null);
  const touchHandlers = isDesktop
    ? {}
    : {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
          const timer = window.setTimeout(() => setHeld(true), 220);
          press.current = { t: performance.now(), x: e.clientX, timer };
        },
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
          const p = press.current;
          press.current = null;
          if (!p) return;
          window.clearTimeout(p.timer);
          if (held) return setHeld(false);
          const r = e.currentTarget.getBoundingClientRect();
          go(stepRef.current + (e.clientX - r.left > r.width / 2 ? 1 : -1));
        },
        onPointerCancel: () => {
          if (press.current) window.clearTimeout(press.current.timer);
          press.current = null;
          setHeld(false);
        },
      };

  return (
    <div className="hw-grid">
      <div className="hw-left">
        <p className="eyebrow reveal">How it works</p>
        <h2 className="h2-tile hw-h2 reveal" style={cssVars({ i: 1 })}>
          A small team of agents, working on your page.
        </h2>
        <ol className="hw-steps" onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)} onPointerLeave={() => setHover(false)}>
          {howSteps.map((s, i) => (
            <li key={s.title} className="hw-step reveal" data-active={i === step || undefined} style={cssVars({ i: 2 + i })}>
              <button type="button" className="hw-step-btn" onClick={() => go(i)} aria-current={i === step ? "step" : undefined}>
                <span className="hw-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="hw-title">{s.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {i === step && (
                  <motion.p
                    className="hw-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span>{s.body}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ol>
      </div>

      <div className="hw-right reveal" style={cssVars({ i: 3 })}>
        <div
          className="hw-visual"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={() => setHover(false)}
          {...touchHandlers}
        >
          <div className="hw-bars" aria-hidden="true">
            {howSteps.map((s, i) => (
              <button key={s.title} type="button" tabIndex={-1} className="hw-bar" onClick={() => go(i)}>
                <motion.span
                  className="hw-bar-fill"
                  style={{ scaleX: i === step ? progress : i < step ? 1 : 0 }}
                />
              </button>
            ))}
          </div>
          <AgentGraph step={step} />
          <StepPreview step={step} reduced={reduced} />
          {(hover || held) && !reduced && (
            <span className="hw-paused" aria-hidden="true">
              Paused
            </span>
          )}
        </div>
        <div className="hw-mobile-text" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
              <p className="hw-m-title">
                <span className="hw-num">{String(step + 1).padStart(2, "0")}</span> {howSteps[step].title}
              </p>
              <p className="hw-m-body">{howSteps[step].body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
