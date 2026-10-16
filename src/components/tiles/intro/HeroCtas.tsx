"use client";

import { Play } from "lucide-react";
import { dotBus } from "@/components/dotfield/bus";
import { InstallButton } from "@/components/ui/InstallButton";
import { track } from "@/lib/analytics";
import { demoVideoConfigured } from "@/lib/links";
import { useUi } from "@/store/ui";

/** Primary install CTA (brand sweep + dot-field shockwave on hover) and the demo video button. */
export function HeroCtas() {
  const setVideoOpen = useUi((s) => s.setVideoOpen);
  return (
    <div className="hero-ctas">
      <InstallButton
        tile="intro"
        size="lg"
        sweep
        className="hero-cta"
        onPointerEnter={(e) => e.pointerType === "mouse" && dotBus.shockwaveFrom(e.currentTarget, 0.55)}
      />
      {demoVideoConfigured && (
        <button
          type="button"
          className="btn btn-ghost btn-lg"
          onClick={() => {
            track("video_open");
            setVideoOpen(true);
          }}
        >
          <Play size={16} fill="currentColor" aria-hidden="true" /> Watch the 60s demo
        </button>
      )}
    </div>
  );
}
