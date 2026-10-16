"use client";

import { MousePointer2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dotBus } from "@/components/dotfield/bus";
import { DotField } from "@/components/dotfield/DotField";
import { InstallButton } from "@/components/ui/InstallButton";
import { track } from "@/lib/analytics";
import { useUi } from "@/store/ui";
import { useTile } from "../TileContext";

/** Midnight field where ~a third of the dots form the Morphic "M" (§7.9). */
export function GetMorphicField() {
  const { isActive, isNear } = useTile();
  if (!isNear) return null;
  return <DotField theme="midnight" active={isActive} formation={{ kind: "logo" }} layout="final" textSafe="#get-morphic .gm-h2" />;
}

/** Install CTA: hovering makes the M breathe; the idea input pulses it on submit. */
export function GetMorphicCta() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const on = () => setPulse((p) => p + 1);
    window.addEventListener("morphic:pulse-cta", on);
    return () => window.removeEventListener("morphic:pulse-cta", on);
  }, []);
  return (
    <div className="gm-cta">
      <span className="gm-cta-btn" key={pulse} data-pulse={pulse > 0 || undefined}>
        <InstallButton
          tile="get-morphic"
          size="lg"
          sweep
          onPointerEnter={() => dotBus.breathe(true)}
        />
      </span>
      <p className="gm-micro">Free plan · No credit card</p>
    </div>
  );
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/** "What would you morph?" — styled exactly like the panel input (§7.9). */
export function IdeaInput() {
  const [value, setValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useUi((s) => s.toast);

  return (
    <form
      ref={formRef}
      className="gm-input"
      onSubmit={async (e) => {
        e.preventDefault();
        const prompt = value.trim();
        if (!prompt) return;
        await copy(prompt);
        toast("Copied — paste it into Morphic after installing");
        dotBus.shockwaveFrom(formRef.current, 1.3);
        window.dispatchEvent(new Event("morphic:pulse-cta"));
        track("idea_prompt_submit", { prompt: prompt.slice(0, 300) });
      }}
    >
      <span className="gm-picker" aria-hidden="true">
        <MousePointer2 size={16} />
      </span>
      <label htmlFor="idea" className="sr-only">
        What would you morph?
      </label>
      <input
        id="idea"
        className="gm-field"
        placeholder="How should your favorite site look?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        enterKeyHint="send"
        maxLength={300}
      />
      <button type="submit" className="gm-send" aria-label="Copy this prompt">
        <Send size={17} />
      </button>
    </form>
  );
}

/** Stops the M breathing once the pointer leaves the CTA area. */
export function BreatheReset() {
  useEffect(() => {
    const off = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest?.(".gm-cta-btn")) dotBus.breathe(false);
    };
    window.addEventListener("pointerover", off, { passive: true });
    return () => window.removeEventListener("pointerover", off);
  }, []);
  return null;
}
