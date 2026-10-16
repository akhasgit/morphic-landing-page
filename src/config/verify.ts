// Every product claim marked **(verify)** in the build spec (§14).
// /dev/launch-checklist lists each one until AK flips `cleared: true` here.

export type VerifyItem = { id: string; claim: string; where: string; cleared: boolean };

export const verifyItems: VerifyItem[] = [
  {
    id: "self-repair",
    claim: "Views that repair themselves — when a site changes and a view breaks, agents fix it.",
    where: "Features tile C, FAQ #6, Pricing (Pro: Self-repairing views)",
    cleared: false,
  },
  {
    id: "browsers",
    claim: "Supported browsers: Chrome and Chromium browsers like Edge, Brave and Arc.",
    where: "site.supportedBrowsers → hero microcopy, FAQ #8, non-Chrome CTA tooltip",
    cleared: false,
  },
  {
    id: "saved-views-free",
    claim: "Opening your saved views doesn't use morphs.",
    where: "site.pricingCopy.morphNote → Pricing sub",
    cleared: false,
  },
  {
    id: "privacy",
    claim: "What page content and screenshots are sent to Morphic's servers, retention, and training use.",
    where: "site.privacyLine → Safety tile; FAQ #5; /privacy",
    cleared: false,
  },
  {
    id: "limitations",
    claim: "Known limitations (canvas content, embeds, …).",
    where: "FAQ #2",
    cleared: false,
  },
  {
    id: "real-site-names",
    claim: "Real site names only appear in text for sites AK has tested.",
    where: "Use-case recordings and any copy that names a real site",
    cleared: false,
  },
  {
    id: "yearly-discount",
    claim: "“2 months free” matches the yearly prices (15×12=180 vs 144; 39×12=468 vs 372).",
    where: "Pricing billing toggle pill",
    cleared: false,
  },
  {
    id: "spec-sample",
    claim: "The morph spec shown on the Safety tile matches packages/shared/src/spec-types.ts.",
    where: "Safety tile visual (src/components/tiles/safety/spec.ts)",
    cleared: false,
  },
];
