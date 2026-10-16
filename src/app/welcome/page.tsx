import type { Metadata } from "next";
import { PageField } from "@/components/pages/PageField";
import { PageShell } from "@/components/pages/PageShell";
import { PinIllustration } from "@/components/pages/PinIllustration";
import { StarterCards } from "@/components/pages/StarterCards";
import { AppIcon } from "@/components/ui/AppIcon";
import { Ph } from "@/components/ui/Ph";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Welcome to Morphic",
  description: "Pin Morphic, open the panel, and make your first morph in under a minute.",
  alternates: { canonical: "/welcome" },
  robots: { index: false },
};

/** Opened by the extension on install (§11). Goal: a first successful morph in under 60s. */
export default function WelcomePage() {
  return (
    <PageShell cta={false} background={<PageField />}>
      <p className="eyebrow">Welcome</p>
      <h1 className="page-h1 mt-4">You&rsquo;re in. Let&rsquo;s make your first morph.</h1>
      <p className="page-lead">Three steps, under a minute.</p>

      <ol className="wl-steps">
        <li className="wl-step">
          <span className="wl-num">1</span>
          <div>
            <h2 className="wl-title">Pin Morphic</h2>
            <p className="wl-text">Click the puzzle piece in Chrome&rsquo;s toolbar, then the pin next to Morphic, so it&rsquo;s always one click away.</p>
          </div>
          <PinIllustration />
        </li>
        <li className="wl-step">
          <span className="wl-num">2</span>
          <div>
            <h2 className="wl-title">Open the panel</h2>
            <p className="wl-text">
              <Ph value={site.openPanelHint} /> to open the side panel.
            </p>
          </div>
          <div className="wl-visual flex items-center gap-3 rounded-[14px] border border-line bg-white p-4 text-[14px] text-ink-2">
            <AppIcon size={30} />
            <span>
              <b className="text-ink">Morphic</b> opens beside the page. Describe a new look, or pick an element with the cursor tool.
            </span>
          </div>
        </li>
        <li className="wl-step is-wide">
          <span className="wl-num">3</span>
          <div>
            <h2 className="wl-title">Try it on a starter page</h2>
            <p className="wl-text">Open one of these pages, copy its prompt, and paste it into the panel.</p>
          </div>
          <StarterCards />
        </li>
      </ol>
    </PageShell>
  );
}
