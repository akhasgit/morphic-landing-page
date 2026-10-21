// src/config/site.ts
// Every editable launch value lives here. Anything wrapped in {{…}} is a placeholder:
// the site renders the text inside the braces so previews look right, and
// /dev/launch-checklist lists every value that still has braces.

// The account dashboard is built into this app at /account. Use a full URL once it moves to its own domain.
const accountUrl = "/account";

export const site = {
  name: "Morphic",
  tagline: "Tell any website how to look.",
  url: "{{https://YOUR_DOMAIN}}",
  chromeStoreUrl: "{{CHROME_WEB_STORE_LISTING_URL}}",
  accountUrl,
  // Paid CTAs sign people in on the account page, then open Stripe Checkout (7-day trial, card collected up front).
  checkout: {
    pro: { monthly: `${accountUrl}/upgrade?plan=pro&interval=month`, yearly: `${accountUrl}/upgrade?plan=pro&interval=year` },
    power: { monthly: `${accountUrl}/upgrade?plan=power&interval=month`, yearly: `${accountUrl}/upgrade?plan=power&interval=year` },
  },
  demoVideo: { src: "{{/video/morphic-demo.mp4}}", poster: "{{/video/morphic-demo-poster.jpg}}" },
  emailCaptureEndpoint: "{{FORM_OR_API_ENDPOINT}}",
  uninstallFeedbackEndpoint: "{{FORM_OR_API_ENDPOINT}}",
  supportEmail: "{{support@YOUR_DOMAIN}}",
  legalEntity: "{{LEGAL_ENTITY_NAME}}",
  social: { x: "{{}}", productHunt: "{{}}", github: "{{}}" },
  supportedBrowsers: "Chrome {{and Chromium browsers like Edge, Brave and Arc (verify)}}",
  socialProof: [] as { quote: string; name: string; role: string }[], // empty = hidden
  pricing: {
    free: { price: 0, morphs: "{{20}}", savedViews: "{{3}}" },
    pro: { monthly: "{{15}}", yearly: "{{144}}", morphs: "{{200}}" },
    power: { monthly: "{{39}}", yearly: "{{372}}", morphs: "{{750}}" },
  },
  analytics: { provider: "{{plausible | posthog}}", key: "{{}}" },

  // ─── Additions the components need (all still config, never hard-coded in tiles) ───

  brand: {
    // TODO(AK): replace with a transparent ≥1024px PNG (or SVG) of the ribbon mark.
    // This one is cut out of the 128px morphiclogo128X128.png in the repo root.
    mark: "/brand/morphic-mark.png",
    appIcon: "/brand/morphic-app-icon.svg",
  },

  // TODO(AK): confirm upgrade flow. "checkout" = paid CTAs open the checkout URLs above.
  // "in-extension" = paid CTAs go to the Web Store with "Install, then upgrade in Settings".
  upgradeFlow: "checkout" as "checkout" | "in-extension",

  pricingCopy: {
    morphNote: "{{Opening your saved views doesn't use morphs. (verify)}}",
    checkoutProvider: "{{Stripe}}",
    guarantee: "{{money-back guarantee if offered}}",
    teamCta: "{{Talk to us}}",
    teamHref: "{{mailto:support@YOUR_DOMAIN}}",
  },

  privacyLine:
    "{{What page content and screenshots are sent to Morphic's servers, retention, and training use. (verify) — do not ship until accurate.}}",

  // /welcome step 2. The extension has no keyboard command today, so the default is the toolbar icon.
  openPanelHint: "{{Click the Morphic icon in your Chrome toolbar}}",
} as const;

export type Site = typeof site;
