"use client";

import { useEffect, useRef, useState } from "react";
import { dotBus } from "@/components/dotfield/bus";
import { dotField } from "@/components/dotfield/config";
import { DotField, type Formation } from "@/components/dotfield/DotField";
import type { DotFieldEngine } from "@/components/dotfield/engine";

type Mode = "hero" | "final" | "404";

const sliders: { key: keyof typeof dotField.physics; min: number; max: number; step: number }[] = [
  { key: "spring", min: 0.005, max: 0.15, step: 0.001 },
  { key: "damping", min: 0.7, max: 0.98, step: 0.005 },
  { key: "cursorRadius", min: 60, max: 320, step: 5 },
  { key: "strength", min: 0.2, max: 8, step: 0.1 },
  { key: "wake", min: 0, max: 0.4, step: 0.005 },
  { key: "maxDisplacement", min: 8, max: 160, step: 2 },
];

/** /dev/dots — tune the dot field by feel (§15 step 2). Values edit the shared config live. */
export function DotsLab() {
  useEffect(() => {
    (window as unknown as { __dotField: typeof dotField }).__dotField = dotField; // tune from the console
  }, []);
  const [mode, setMode] = useState<Mode>("hero");
  const [run, setRun] = useState(0);
  const [, force] = useState(0);
  const [stats, setStats] = useState({ fps: 0, dots: 0, renderer: "" });
  const engine = useRef<DotFieldEngine | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      frames++;
      if (t - last > 500) {
        setStats({ fps: Math.round((frames * 1000) / (t - last)), dots: engine.current?.N ?? 0, renderer: engine.current?.rendererKind ?? "" });
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const theme = mode === "final" ? "midnight" : "light";
  const formation: Formation | undefined = mode === "final" ? { kind: "logo" } : mode === "404" ? { kind: "text", text: "404" } : undefined;

  return (
    <div
      data-theme={mode === "final" ? "midnight" : "hero"}
      className="relative h-dvh overflow-hidden"
      style={{
        background:
          mode === "final"
            ? "linear-gradient(180deg, var(--mid-bg-top), var(--mid-bg-bottom))"
            : "linear-gradient(180deg, var(--hero-bg-top), var(--hero-bg-bottom))",
      }}
    >
      <DotField
        key={`${mode}-${run}`}
        theme={theme}
        active
        formation={formation}
        layout={mode === "404" ? "404" : "final"}
        intro={mode === "404" ? "scatter" : mode === "hero" && run > 0 ? "logo-burst" : "none"}
        textSafe={mode === "hero" ? [textRef] : undefined}
        onEngine={(e) => (engine.current = e)}
      />

      {mode === "hero" && (
        <div ref={textRef} className="pointer-events-none absolute left-[8vw] top-[34vh] max-w-[440px]">
          <p className="h1-hero text-ink">Tell any website how to look.</p>
        </div>
      )}

      <div className="glass absolute right-4 top-4 z-10 w-[300px] rounded-2xl p-4 text-[13px] text-ink">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-ink-2">
          <span>{stats.renderer}</span>
          <span>{stats.dots} dots</span>
          <span>{stats.fps} fps</span>
        </div>
        <div className="mb-3 flex gap-1.5">
          {(["hero", "final", "404"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setRun(0);
              }}
              className={`flex-1 rounded-lg border px-2 py-1.5 ${m === mode ? "border-accent bg-accent text-white" : "border-line"}`}
            >
              {m}
            </button>
          ))}
        </div>
        {sliders.map((s) => (
          <label key={s.key} className="mb-2 block">
            <span className="flex justify-between font-mono text-[11px]">
              <span>{s.key}</span>
              <span>{dotField.physics[s.key]}</span>
            </span>
            <input
              type="range"
              className="w-full accent-[var(--accent)]"
              min={s.min}
              max={s.max}
              step={s.step}
              value={dotField.physics[s.key]}
              onChange={(e) => {
                dotField.physics[s.key] = Number(e.target.value);
                force((n) => n + 1);
              }}
            />
          </label>
        ))}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button className="rounded-lg border border-line px-2 py-1.5" onClick={() => dotBus.shockwave(window.innerWidth / 2, window.innerHeight / 2, 1)}>
            Shockwave
          </button>
          <button
            className="rounded-lg border border-line px-2 py-1.5"
            onClick={() => {
              document.documentElement.dataset.intro = "play";
              setRun((r) => r + 1);
            }}
          >
            Replay intro
          </button>
          <button className="rounded-lg border border-line px-2 py-1.5" onPointerEnter={() => dotBus.breathe(true)} onPointerLeave={() => dotBus.breathe(false)}>
            Hover: breathe
          </button>
          <button className="rounded-lg border border-line px-2 py-1.5" onClick={() => setRun((r) => r + 1)}>
            Rebuild
          </button>
        </div>
      </div>
    </div>
  );
}
