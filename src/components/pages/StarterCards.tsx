"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { sites } from "@/demo/data";
import { useUi } from "@/store/ui";

const starters = [
  {
    href: "/playground/streamly",
    site: sites.streamly.domain,
    title: "A busy video feed",
    prompt: "Make this feed swipeable cards. Right = Watch later.",
  },
  {
    href: "/playground/shopwise",
    site: sites.shopwise.domain,
    title: "Store search results",
    prompt: "Show these results as a comparison table",
  },
  {
    href: "/playground/pulseboard",
    site: sites.pulseboard.domain,
    title: "An analytics dashboard",
    prompt: "Turn this into charts and let me ask questions about it",
  },
];

/** Three starter pages, each with a prompt to copy (§11 /welcome step 3). */
export function StarterCards() {
  const [copied, setCopied] = useState<string | null>(null);
  const toast = useUi((s) => s.toast);
  return (
    <div className="wl-starters">
      {starters.map((s) => (
        <div key={s.href} className="wl-card">
          <span className="wl-card-site">{s.site}</span>
          <span className="wl-card-title">{s.title}</span>
          <p className="wl-card-prompt">{s.prompt}</p>
          <div className="wl-card-actions">
            <Link href={s.href} className="btn btn-primary btn-sm flex-1" target="_blank">
              Open page
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(s.prompt);
                } catch {
                  /* clipboard blocked; the prompt is visible to copy by hand */
                }
                setCopied(s.href);
                toast("Prompt copied — paste it into the Morphic panel");
                window.setTimeout(() => setCopied((c) => (c === s.href ? null : c)), 1800);
              }}
            >
              {copied === s.href ? <Check size={15} /> : <Copy size={15} />} Copy prompt
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
