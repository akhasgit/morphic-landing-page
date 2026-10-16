import type { Metadata } from "next";
import { faq } from "@/config/faq";
import { site } from "@/config/site";
import { useCases } from "@/config/useCases";
import { verifyItems } from "@/config/verify";
import { findPlaceholders, isSet } from "@/lib/placeholder";
import "@/components/pages/pages.css";

export const metadata: Metadata = { title: "Launch checklist — Morphic dev" };

/** Outstanding TODO(AK) items in the code (keep in sync with `grep -rn "TODO(AK)" src`). */
const todos = [
  { item: "Transparent ≥1024px ribbon mark (PNG or SVG)", where: "public/brand · site.brand.mark (current file is cut from the 128px logo)" },
  { item: "Confirm the upgrade flow (checkout URLs vs “Install, then upgrade in Settings”)", where: "site.upgradeFlow" },
  { item: "Privacy policy content (required for the Chrome Web Store)", where: "src/app/privacy/page.tsx" },
  { item: "Terms of service content", where: "src/app/terms/page.tsx" },
  { item: "Email capture endpoint (mobile “Get the link”)", where: "site.emailCaptureEndpoint" },
  { item: "Uninstall feedback endpoint", where: "site.uninstallFeedbackEndpoint" },
  { item: "Confirm the morph spec sample matches packages/shared spec types", where: "src/components/tiles/safety/spec.ts" },
  { item: "Confirm the pricing comparison matrix (each tier includes the one below)", where: "src/components/tiles/pricing/plans.ts" },
];

/** /dev/launch-checklist (§14): everything that still needs AK before launch. */
export default function LaunchChecklist() {
  const configPlaceholders = findPlaceholders(site, "site");
  const faqPlaceholders = faq.flatMap((f, i) => findPlaceholders(f.a, `faq[${i}].a`));
  const missingVideos = useCases.filter((u) => !u.video);
  const openVerify = verifyItems.filter((v) => !v.cleared);
  const total = configPlaceholders.length + faqPlaceholders.length + missingVideos.length + openVerify.length + todos.length;

  return (
    <div data-theme="light" className="page-shell">
      <main className="page-main">
        <p className="eyebrow">Dev</p>
        <h1 className="page-h1 mt-3">Launch checklist</h1>
        <p className="page-lead">
          {total} open item{total === 1 ? "" : "s"}. Items disappear as you fill values in <code className="font-mono">src/config</code> and clear claims
          in <code className="font-mono">src/config/verify.ts</code>.
        </p>

        <Section title="(verify) product claims" count={openVerify.length}>
          {openVerify.map((v) => (
            <Row key={v.id} label={v.claim} detail={v.where} />
          ))}
        </Section>

        <Section title="Config placeholders" count={configPlaceholders.length}>
          {configPlaceholders.map((p) => (
            <Row key={p.path} label={p.path} detail={p.value} mono />
          ))}
        </Section>

        <Section title="FAQ placeholders" count={faqPlaceholders.length}>
          {faqPlaceholders.map((p) => (
            <Row key={p.path} label={p.path} detail={p.value} mono />
          ))}
        </Section>

        <Section title="Use-case recordings still placeholders" count={missingVideos.length}>
          {missingVideos.map((u) => (
            <Row key={u.id} label={`${u.id} · ${u.title}`} detail={`/public/videos/${u.id}.mp4 + ${u.id}.jpg — “${u.prompt}”`} />
          ))}
        </Section>

        <Section title="TODO(AK) in code" count={todos.length}>
          {todos.map((t) => (
            <Row key={t.item} label={t.item} detail={t.where} />
          ))}
        </Section>

        <Section title="Status" count={0}>
          <Row label="Chrome Web Store URL" detail={isSet(site.chromeStoreUrl) ? "set" : "not set — install buttons do nothing"} />
          <Row label="Demo video" detail={isSet(site.demoVideo.src) ? "set" : "not set — “Watch the 60s demo” is hidden"} />
          <Row label="Analytics" detail={isSet(site.analytics.provider) && isSet(site.analytics.key) ? "on" : "off — events only log in development"} />
          <Row label="Social proof" detail={site.socialProof.length ? `${site.socialProof.length} quotes` : "none — marquee hidden (never invent quotes)"} />
        </Section>
      </main>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-3 font-display text-[20px] font-semibold">
        {title}
        {count > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[12px] text-amber-800">{count}</span>}
      </h2>
      <ul className="mt-3 divide-y divide-[var(--light-border)] overflow-hidden rounded-2xl border border-[var(--light-border)] bg-white">{children}</ul>
    </section>
  );
}

function Row({ label, detail, mono }: { label: string; detail: string; mono?: boolean }) {
  return (
    <li className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-baseline md:gap-6">
      <span className={`shrink-0 text-[14.5px] font-medium text-ink md:w-[42%] ${mono ? "font-mono text-[13px]" : ""}`}>{label}</span>
      <span className={`text-[14px] text-ink-2 ${mono ? "font-mono text-[12.5px]" : ""}`}>{detail}</span>
    </li>
  );
}
