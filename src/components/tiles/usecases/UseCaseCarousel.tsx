"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCases, type UseCase } from "@/config/useCases";
import { track } from "@/lib/analytics";
import { useIsDesktop } from "@/lib/hooks";
import { innerProgress } from "@/store/tiles";
import { useTile } from "../TileContext";
import { DemoPlaceholder } from "./DemoPlaceholder";

const N = useCases.length;
const PLACEHOLDER_MS = 8000;
const wrap = (v: number) => ((v % N) + N) % N;
/** Continuous offset of card i from the focus position, wrapped to [-N/2, N/2). */
const wrapOffset = (i: number, pos: number) => {
  let o = (i - pos) % N;
  if (o >= N / 2) o -= N;
  if (o < -N / 2) o += N;
  return o;
};

type Size = { cardW: number; cardH: number; mobile: boolean };

/**
 * Tile 02 carousel (§7.2): a curved coverflow of recordings. One card in focus plays;
 * neighbors sit paused on their poster. Ambient mode tints the tile with the video's colors.
 */
export default function UseCaseCarousel() {
  const { isActive, isCurrent } = useTile();
  const isDesktop = useIsDesktop();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ cardW: 0, cardH: 0, mobile: false });
  const pos = useMotionValue(0);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [warmFirst, setWarmFirst] = useState(false);
  const progress = innerProgress["use-cases"];
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const dragMoved = useRef(false);

  const running = isActive && !paused && lightbox === null;

  // ── Card size from the stage: min(64vw, stageH × 1.6, 1040) at 16:10; 90vw on mobile.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      const vw = window.innerWidth;
      const mobile = vw < 1024;
      // Leave room above for breathing space and below for the reflection.
      let cardW = mobile ? vw * 0.9 : Math.min(vw * 0.64, (h - 40) * 1.6, 1040);
      if (mobile) cardW = Math.min(cardW, (h - 16) * 1.6);
      setSize({ cardW: Math.round(cardW), cardH: Math.round(cardW / 1.6), mobile });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Focus follows the continuous position.
  useMotionValueEvent(pos, "change", (p) => {
    const i = wrap(Math.round(p));
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  });

  const goTo = useCallback(
    (target: number, velocity = 0) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      animate(pos, target, reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 32, velocity });
    },
    [pos],
  );
  const step = useCallback((delta: number) => goTo(Math.round(pos.get()) + delta), [goTo, pos]);
  const focus = useCallback(
    (i: number) => {
      const cur = Math.round(pos.get());
      goTo(cur + wrapOffset(i, cur));
    },
    [goTo, pos],
  );

  // ── Warm the first recording while the visitor is still on the hero (§13).
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const t = window.setTimeout(() => ric(() => setWarmFirst(true)), 3000);
    return () => window.clearTimeout(t);
  }, []);

  // ── Ambient glow (§7.2): video frames when possible, else the card's configured colors.
  const setAmbient = useCallback((left: string, right: string) => {
    const el = document.querySelector<HTMLElement>("#use-cases .uc-ambient");
    if (!el) return;
    el.style.setProperty("--amb-left", left);
    el.style.setProperty("--amb-right", right);
  }, []);

  // ── Playback: only the focused card plays, from 0 each time it gains focus.
  const lastFocused = useRef(-1);
  useEffect(() => {
    const uc = useCases[active];
    const video = uc.video ? videos.current[active] : null;
    if (lastFocused.current !== active) {
      lastFocused.current = active;
      progress.set(0);
      setBlocked(false);
      setAmbient(uc.ambient[0], uc.ambient[1]);
      videos.current.forEach((v, i) => {
        if (v && i !== active) {
          v.pause();
          v.currentTime = 0;
        }
      });
      if (video) video.currentTime = 0;
      if (isCurrent) track("usecase_focus", { id: uc.id });
    }
    if (!running) {
      video?.pause();
      return;
    }

    let raf = 0;
    let sampler = 0;
    const next = () => {
      track("usecase_complete", { id: uc.id });
      step(1);
    };

    if (video) {
      video
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true)); // autoplay refused → show a play button
      const loop = () => {
        if (video.duration) progress.set(video.currentTime / video.duration);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      video.onended = next;
      // Sample the frame every 500ms into a 32×20 canvas; average each half.
      const c = document.createElement("canvas");
      c.width = 32;
      c.height = 20;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      sampler = window.setInterval(() => {
        if (!ctx || video.readyState < 2) return;
        try {
          ctx.drawImage(video, 0, 0, 32, 20);
          const avg = (x0: number) => {
            const d = ctx.getImageData(x0, 0, 16, 20).data;
            let r = 0;
            let g = 0;
            let b = 0;
            for (let k = 0; k < d.length; k += 4) {
              r += d[k];
              g += d[k + 1];
              b += d[k + 2];
            }
            const n = d.length / 4;
            return `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`;
          };
          setAmbient(avg(0), avg(16));
        } catch {
          setAmbient(uc.ambient[0], uc.ambient[1]); // tainted canvas → config colors
          window.clearInterval(sampler);
        }
      }, 500);
    } else {
      // Placeholder: simulate an 8s playback, resuming where it paused.
      const startedAt = performance.now() - progress.get() * PLACEHOLDER_MS;
      const loop = (t: number) => {
        const p = (t - startedAt) / PLACEHOLDER_MS;
        progress.set(Math.min(p, 1));
        if (p >= 1) next();
        else raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(sampler);
      if (video) {
        video.onended = null;
        video.pause();
      }
    };
  }, [active, running, isCurrent, progress, setAmbient, step]);

  // ── Horizontal trackpad swipe moves the carousel; vertical wheel is never intercepted.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let acc = 0;
    let last = 0;
    let reset = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); // also stops the browser's back-swipe
      acc += e.deltaX;
      window.clearTimeout(reset);
      reset = window.setTimeout(() => (acc = 0), 220);
      const now = performance.now();
      if (now - last < 400 || Math.abs(acc) < 60) return;
      step(Math.sign(acc));
      acc = 0;
      last = now;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  // ── ← → while this tile is on screen.
  useEffect(() => {
    if (!isCurrent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || lightbox !== null) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCurrent, lightbox, step]);

  // ── Drag / swipe with inertia, then spring-snap to the nearest card.
  const spacing = size.mobile ? size.cardW * 0.92 : size.cardW * 0.62;
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !spacing) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = pos.get();
    let lastX = startX;
    let lastT = performance.now();
    let vx = 0;
    let moved = false;
    dragMoved.current = false;
    pos.stop();
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(ev.clientY - startY)) return;
        moved = true;
        dragMoved.current = true;
      }
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      vx = vx * 0.6 + ((ev.clientX - lastX) / dt) * 0.4; // px/ms
      lastX = ev.clientX;
      lastT = now;
      pos.set(startPos - dx / spacing);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (!moved) return;
      const projected = pos.get() - (vx * 220) / spacing;
      goTo(Math.round(projected), (-vx * 1000) / spacing);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const uc = useCases[active];

  return (
    <div className="uc" role="region" aria-roledescription="carousel" aria-label="Use cases">
      <div ref={stageRef} className="uc-stage" onPointerDown={onPointerDown}>
        <div className="uc-floor" aria-hidden="true" />
        <div className="uc-track" style={{ perspective: size.mobile ? undefined : 1800 }}>
          {size.cardW > 0 &&
            useCases.map((c, i) => (
              <Card
                key={c.id}
                index={i}
                uc={c}
                pos={pos}
                size={size}
                focused={i === active}
                tileCurrent={isCurrent}
                warm={i === 0 && warmFirst}
                blocked={blocked && i === active}
                videoRef={(el) => {
                  videos.current[i] = el;
                }}
                onClick={() => {
                  if (dragMoved.current) return;
                  if (i === active) {
                    track("usecase_lightbox", { id: c.id });
                    setLightbox(i);
                  } else focus(i);
                }}
                onPlayBlocked={() => {
                  setPaused(false);
                  videos.current[i]?.play().then(() => setBlocked(false)).catch(() => {});
                }}
              />
            ))}
        </div>
      </div>

      <div className="uc-info" style={{ width: size.cardW || undefined }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={uc.id}
            className="uc-info-row"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="uc-info-text">
              <h3 className="uc-title">{uc.title}</h3>
              <p className="uc-outcome">{uc.outcome}</p>
            </div>
            <p className="uc-prompt">
              <span className="sr-only">Prompt: </span>
              {uc.prompt}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="uc-controls" style={{ width: size.cardW || undefined }}>
        {isDesktop && (
          <button type="button" className="uc-arrow glass" onClick={() => step(-1)} aria-label="Previous use case">
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="uc-segs" role="tablist" aria-label="Choose a use case">
          {useCases.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1} of ${N}: ${c.title}`}
              className="uc-seg"
              data-state={i === active ? "active" : i < active ? "passed" : "upcoming"}
              onClick={() => focus(i)}
            >
              <span className="uc-seg-track">{i === active && <motion.span className="uc-seg-fill" style={{ scaleX: progress }} />}</span>
            </button>
          ))}
        </div>
        {isDesktop && (
          <button type="button" className="uc-arrow glass" onClick={() => step(1)} aria-label="Next use case">
            <ChevronRight size={18} />
          </button>
        )}
        <button
          type="button"
          className="uc-arrow glass"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play use case videos" : "Pause use case videos"}
        >
          {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
        </button>
      </div>

      <Lightbox index={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function Card({
  index,
  uc,
  pos,
  size,
  focused,
  tileCurrent,
  warm,
  blocked,
  videoRef,
  onClick,
  onPlayBlocked,
}: {
  index: number;
  uc: UseCase;
  pos: MotionValue<number>;
  size: Size;
  focused: boolean;
  tileCurrent: boolean;
  warm: boolean;
  blocked: boolean;
  videoRef: (el: HTMLVideoElement | null) => void;
  onClick: () => void;
  onPlayBlocked: () => void;
}) {
  const { cardW, cardH, mobile } = size;
  const offset = useTransform(pos, (p) => wrapOffset(index, p));
  const x = useTransform(offset, (o) => o * cardW * (mobile ? 0.92 : 0.62));
  const z = useTransform(offset, (o) => (mobile ? 0 : -Math.min(Math.abs(o), 3) * 240));
  // Neighbors angle toward the center.
  const rotateY = useTransform(offset, (o) => (mobile ? 0 : -Math.sign(o) * Math.min(Math.abs(o), 1.5) * 30));
  const scale = useTransform(offset, (o) => 1 - Math.min(Math.abs(o), 2) * 0.1);
  const opacity = useTransform(offset, (o) => {
    const a = Math.abs(o);
    return a > 2.5 ? 0 : 1 - a * 0.3;
  });
  const blur = useTransform(offset, (o) => `blur(${Math.min(Math.abs(o), 2) * 1.5}px)`);
  const dim = useTransform(offset, (o) => Math.min(Math.abs(o), 2) * 0.25);
  const zIndex = useTransform(offset, (o) => 100 - Math.round(Math.min(Math.abs(o), 3) * 10));
  const visibility = useTransform(offset, (o) => (Math.abs(o) > 2.6 ? "hidden" : "visible"));

  // Hover tilt on the focused card (±3°) + moving specular sheen.
  const tx = useSpring(0, { stiffness: 160, damping: 18 });
  const ty = useSpring(0, { stiffness: 160, damping: 18 });
  const sx = useMotionValue(50);
  const sy = useMotionValue(30);
  const sheen = useTransform([sx, sy], ([a, b]) => `radial-gradient(420px circle at ${a}% ${b}%, rgba(255,255,255,0.13), transparent 50%)`);

  const near = Math.abs(wrapOffset(index, pos.get())) <= 1.5;
  const preload = tileCurrent && near ? "auto" : warm ? "metadata" : "none";
  const showPoster = (tileCurrent && Math.abs(wrapOffset(index, pos.get())) <= 2.5) || warm;

  return (
    <motion.div
      className="uc-card"
      data-focused={focused || undefined}
      style={{ x, z, rotateY, scale, opacity, zIndex, visibility, width: cardW, height: cardH, marginLeft: -cardW / 2, marginTop: -cardH / 2 }}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${N}: ${uc.title}`}
      aria-hidden={!focused}
      onClick={onClick}
      onPointerMove={(e) => {
        if (!focused || mobile || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ty.set((px - 0.5) * 6);
        tx.set((0.5 - py) * 6);
        sx.set(px * 100);
        sy.set(py * 100);
      }}
      onPointerLeave={() => {
        tx.set(0);
        ty.set(0);
      }}
    >
      <motion.div className="uc-card-tilt" style={{ rotateX: tx, rotateY: ty }}>
        <motion.div className="uc-card-inner" style={{ filter: blur }}>
          {uc.video ? (
            <video
              ref={videoRef}
              className="uc-video"
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload={preload}
              poster={showPoster ? uc.video.poster : undefined}
              aria-label={`${uc.title}: ${uc.outcome}`}
            >
              {uc.video.webm && <source src={uc.video.webm} type="video/webm" />}
              <source src={uc.video.mp4} type="video/mp4" />
            </video>
          ) : (
            <DemoPlaceholder uc={uc} />
          )}
          {uc.video?.spedUp && <span className="uc-sped">▶▶ sped up</span>}
          <motion.div className="uc-card-dim" style={{ opacity: dim }} aria-hidden="true" />
          {focused && !mobile && <motion.div className="uc-card-sheen" style={{ background: sheen }} aria-hidden="true" />}
          {blocked && (
            <button
              type="button"
              className="uc-blocked"
              onClick={(e) => {
                e.stopPropagation();
                onPlayBlocked();
              }}
              aria-label={`Play ${uc.title}`}
            >
              <Play size={26} fill="currentColor" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ index, onClose }: { index: number | null; onClose: () => void }) {
  const uc = index === null ? null : useCases[index];
  return (
    <Dialog.Root open={index !== null} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {uc && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                data-theme="dark"
                className="uc-lightbox"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Dialog.Title className="h3 text-[20px] text-ink">{uc.title}</Dialog.Title>
                <Dialog.Description className="mt-1 text-[15px] text-ink-2">
                  {uc.outcome} <span className="font-mono text-[13px] text-ink-3">“{uc.prompt}”</span>
                </Dialog.Description>
                <div className="uc-lightbox-media">
                  {uc.video ? (
                    <video src={uc.video.mp4} poster={uc.video.poster} controls autoPlay muted playsInline className="h-full w-full" />
                  ) : (
                    <DemoPlaceholder uc={uc} />
                  )}
                </div>
                <p className="uc-rotate">
                  <RotateCcw size={14} aria-hidden="true" /> Rotate your phone for a bigger view
                </p>
                <Dialog.Close className="uc-lightbox-close glass" aria-label="Close">
                  <X size={18} />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
