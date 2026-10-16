import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";
import { sites } from "@/demo/data";

export const metadata: Metadata = {
  title: "Playground — Morphic",
  description: "Real pages to try Morphic on: a video feed, store search results and an analytics dashboard.",
  alternates: { canonical: "/playground" },
};

const pages = [
  { href: "/playground/streamly", site: sites.streamly, blurb: "A busy video feed with infinite scroll, lazy thumbnails and a “Save to Watch later” menu." },
  { href: "/playground/shopwise", site: sites.shopwise, blurb: "Search results with prices, ratings, reviews, shipping and a working cart." },
  { href: "/playground/pulseboard", site: sites.pulseboard, blurb: "An analytics dashboard: KPI cards, a monthly chart and the table behind it." },
];

/** Index of the playground pages (§11). */
export default function PlaygroundIndex() {
  return (
    <PageShell>
      <p className="eyebrow">Playground</p>
      <h1 className="page-h1 mt-4">Real pages to morph.</h1>
      <p className="page-lead">
        Plain, ordinary web pages built for trying Morphic. Open one, open the side panel, and describe how it should look.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {pages.map((p) => (
          <Link key={p.href} href={p.href} className="wl-card transition-shadow hover:shadow-lg">
            <span className="wl-card-site">{p.site.domain}</span>
            <span className="wl-card-title">{p.site.name}</span>
            <span className="text-[14.5px] leading-relaxed text-ink-2">{p.blurb}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
