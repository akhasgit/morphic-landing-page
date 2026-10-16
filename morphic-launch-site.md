# Morphic — Launch Website Build Spec (v2)

> **For Claude Code.** This file describes the full Morphic marketing site: stack, design system, every screen with final copy, animation behavior, and acceptance criteria. Build exactly what's here. Anything in `{{DOUBLE_BRACES}}` is a placeholder AK fills before launch. Anything marked **(verify)** is a product claim AK must confirm before it ships.
>
> **The bar:** this should feel like the most alive website on the internet. It's a set of full-screen tiles that snap into place like TikTok. The hero background is a field of dots that physically reacts to the cursor. The demos are real recordings in a cinematic carousel, and a glass pill tracks where you are.

---

## 0. Ground rules for the build

1. Build in the order in **§15**. Commit after each phase.
2. Copy in this doc is final unless marked `{{...}}`, **(verify)**, or "alt".
3. **Don't invent** features, stats, user counts, ratings, testimonials, press logos, or customer logos.
4. **Coded demos** (the hero, Same Data, How it Works, Safety, and Features tiles) use **fictional mock sites and data** (§5.1). Never recreate a real site's UI or use real brand logos in coded visuals. **AK's screen recordings** in the use-case carousel show Morphic on real sites, and that's fine.
5. Every animation has a `prefers-reduced-motion` fallback (§12).
6. If something is ambiguous, choose the simpler option and leave `// TODO(AK): ...`.
7. **Nothing on the page may need internal scrolling.** Every tile fits one screen (§6).

---

## 1. Product in one paragraph

Morphic is a Chrome extension that rebuilds any website's interface into whatever the user describes, while still showing that site's **real, live data**. The user chats in a side panel. A team of Claude agents (Orchestrator, Data, UI, QA) reads the page, designs a new view, checks it against the data, and saves it as an undoable version. Agents never write executable code: they output a declarative **morph spec** (extractor + view + optional CSS patches + actions) that a trusted renderer draws inside a Shadow DOM. The user can toggle between the Morphic view and the original site at any time.

**Site goals, in priority order**
1. Install: click to the Chrome Web Store.
2. Upgrade: start a paid checkout.
3. Mobile visitors: capture an email to send them the desktop link.

---

## 2. Config & placeholders

All editable values live in config so AK can launch without touching components.

```ts
// src/config/site.ts
export const site = {
  name: "Morphic",
  tagline: "Tell any website how to look.",
  url: "{{https://YOUR_DOMAIN}}",
  chromeStoreUrl: "{{CHROME_WEB_STORE_LISTING_URL}}",
  checkout: {
    pro:   { monthly: "{{PRO_MONTHLY_CHECKOUT_URL}}",   yearly: "{{PRO_YEARLY_CHECKOUT_URL}}" },
    power: { monthly: "{{POWER_MONTHLY_CHECKOUT_URL}}", yearly: "{{POWER_YEARLY_CHECKOUT_URL}}" },
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
    free:  { price: 0,          morphs: "{{20}}",  savedViews: "{{3}}" },
    pro:   { monthly: "{{15}}", yearly: "{{144}}", morphs: "{{200}}" },
    power: { monthly: "{{39}}", yearly: "{{372}}", morphs: "{{750}}" },
  },
  analytics: { provider: "{{plausible | posthog}}", key: "{{}}" },
};
```

```ts
// src/config/useCases.ts — the carousel. Swapping a placeholder for a real video = set `video`.
export type UseCase = {
  id: string;
  title: string;          // "Swipe through your feed"
  outcome: string;        // one line under the title
  prompt: string;         // the exact prompt typed in the recording
  siteType: string;       // "on a video site"
  video?: { mp4: string; webm?: string; poster: string; spedUp?: boolean };
  ambient: [string, string]; // fallback glow colors (and placeholder gradient)
};

export const useCases: UseCase[] = [ /* see §7.2 shot list */ ];
```

---

## 3. Tech stack

- **Next.js (App Router) + TypeScript** on **Vercel**. Static generation for every marketing page.
- **Tailwind CSS v4** with all design tokens as CSS variables (§4.2).
- **Motion** (`motion/react`) for shared-layout morphs, gestures (carousel drag), and springs.
- **CSS scroll-snap + CSS scroll-driven animations** (`animation-timeline: view()`) for the tile system (§6). They're native and smooth in Chrome, which is our whole audience.
- **Raw WebGL2** (no three.js) for the hero/final dot field (§8), with a Canvas 2D fallback.
- **Radix UI primitives**: Accordion, Dialog, Switch, Tabs.
- **lucide-react** icons.
- **next/font**: Inter (body/UI), Inter Tight (display), JetBrains Mono (meta, code, eyebrows).
- Small global store (Zustand or React context) for `activeTile`, `tileTheme`, and per-tile `innerProgress`.
- **No Lenis / smooth-scroll libraries.** They fight scroll-snap.

---

## 4. Brand & design system

The site is a bigger, more cinematic version of the extension panel: near-black surfaces, quiet borders, one indigo accent, mono meta text, and green success states. A light, airy hero contrasts with dark "cinema" tiles, and the violet ribbon logo is the brand moment.

### 4.1 Logo assets

- **Primary mark:** the 3D violet ribbon "M". A **transparent PNG (≥1024px) is required**; an SVG is ideal. Save as `public/brand/morphic-mark.png` / `.svg`. `// TODO(AK): provide transparent logo`. The dot field also samples this file's alpha channel to form the "M" (§8.5).
- **App icon:** the indigo rounded square with the white glyph from the extension panel → `public/brand/morphic-app-icon.svg`. Used in the panel replica, favicon, and floating logo.
- Wordmark "Morphic" in Inter Tight 600. Never recolor, outline, or box the mark.

### 4.2 Color tokens

**Dark tiles**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0B0D` | Tile background |
| `--bg-1` | `#131316` | Frames, panels |
| `--bg-2` | `#1A1A1E` | Cards inside panels |
| `--border` | `#27272A` | 1px borders |
| `--border-strong` | `#3F3F46` | Hover borders, inputs |
| `--text` | `#F4F4F5` | Primary text |
| `--text-2` | `#A1A1AA` | Secondary |
| `--text-3` | `#71717A` | Meta, mono timings |
| `--accent` | `#6366F1` | Primary buttons, toggle, active states |
| `--accent-hover` | `#818CF8` | Hover |
| `--user-bubble` | `#1E2140` | User chat bubble |
| `--success` | `#4ADE80` | Checks, version labels |
| `--success-bg` / `--success-border` | `#0E1F16` / `#1F5135` | Version chip |
| `--warn` | `#FBBF24` | "Preview has issues" |
| `--danger` | `#F87171` | Risky-action confirm |

**Light tiles**

| Token | Value |
|---|---|
| `--light-bg` | `#F6F6F8` |
| `--light-surface` | `#FFFFFF` |
| `--light-border` | `#E4E4E7` |
| `--light-text` | `#0A0A0B` |
| `--light-text-2` | `#52525B` |

**Hero (light dot field)**

| Token | Value |
|---|---|
| `--hero-bg-top` | `#F6F5FD` |
| `--hero-bg-bottom` | `#ECEAF9` |
| `--hero-dot` | `rgba(99, 102, 241, 0.30)` |
| `--hero-dot-active` | `#7C3AED` |
| `--hero-halo` | `rgba(124, 58, 237, 0.12)` |

**Midnight (final tile dot field)**

| Token | Value |
|---|---|
| `--mid-bg-top` | `#0B1020` |
| `--mid-bg-bottom` | `#121735` |
| `--mid-dot` | `rgba(165, 180, 252, 0.35)` |
| `--mid-dot-active` | `#FFFFFF` |
| `--mid-halo` | `rgba(139, 92, 246, 0.28)` |

**Brand gradient (from the logo).** `linear-gradient(135deg, #2E1065 0%, #6D28D9 45%, #A78BFA 100%)`. Use it sparingly: the Pro card border, CTA hover sweeps, and the final tile.

**Glass (used by the progress pill, floating nav, dock, overlays)**

| | On dark tiles | On light tiles |
|---|---|---|
| Fill | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.55)` |
| Border | `rgba(255,255,255,0.18)` | `rgba(10,10,11,0.08)` |
| Inner highlight | `inset 0 1px 0 rgba(255,255,255,0.25)` | `inset 0 1px 0 rgba(255,255,255,0.9)` |
| Shadow | `0 8px 32px rgba(0,0,0,0.35)` | `0 8px 32px rgba(30,16,80,0.12)` |
| Backdrop | `blur(18px) saturate(180%)` | same |

Glass elements cross-fade between the two styles (300ms) when the active tile's theme changes.

### 4.3 Typography

| Role | Font | Size | Notes |
|---|---|---|---|
| Hero H1 | Inter Tight 600 | `clamp(44px, 5.4vw, 84px)` | line-height 1.0, tracking −0.035em |
| Tile H2 | Inter Tight 600 | `clamp(32px, 4vw, 56px)` | line-height 1.05, tracking −0.025em |
| H3 | Inter Tight 600 | 20–24px | |
| Body | Inter 400 | 16–18px | line-height 1.55 |
| Eyebrow | JetBrains Mono 500 | 12px | uppercase, tracking 0.14em, indigo |
| Meta / code | JetBrains Mono 400 | 12–13px | `26.5s · 6 steps` |

### 4.4 Shape & depth

- Radius: 10px buttons/inputs, 16px cards, 24px frames, `9999px` pills.
- Depth from 1px borders + faint inner highlight, not heavy shadows. Exception: the hero demo frame floats on the light hero with `0 40px 90px -30px rgba(30,16,80,0.45)`.
- Dark tiles get a faint 1px grid texture (`rgba(255,255,255,0.03)`, 48px, radial-faded) + 2% noise.

### 4.5 Motion principles

- **Things morph in place.** Prefer shared-layout transitions over generic fades.
- Entrance easing `[0.22, 1, 0.36, 1]`. Layout springs `{ stiffness: 260, damping: 30 }`.
- Micro 150–200ms · UI 300–450ms · morphs 600–900ms (20–30ms stagger).
- **Tile entrances replay every time a tile becomes active.** Content rises 16px and fades in over 450ms with a 50ms stagger. Because tiles are discrete screens, replaying keeps every snap feeling alive.
- Only the **active tile** runs loops, physics, or video. Everything else is paused (§6.4).
- Every autoplay longer than 5s has a visible pause control (WCAG 2.2.2).

---

## 5. Core building blocks

The coded demos run on one engine. Build it in isolation at `/dev/demo` first.

### 5.1 Mock data — `src/demo/data.ts`

Typed, fictional, original content. The `.demo` TLD guarantees fictional domains.

| Dataset | Fictional site | Records |
|---|---|---|
| `videos` | Streamly (`streamly.demo`) | 12 — title, channel, views, age, duration, thumbSeed |
| `products` | Shopwise (`shopwise.demo`) | 8 — name, price, oldPrice?, rating, reviews, shipping, thumbSeed |
| `metrics` | Pulseboard (`pulseboard.demo`) | 12 months — revenue, signups, churn |

### 5.2 `<Thumb seed>`
Deterministic generated artwork: a two-stop gradient from a curated palette (violet, indigo, teal, amber, rose, slate) plus one simple shape. Videos add a play glyph and duration badge. No external images in coded demos.

### 5.3 `<BrowserFrame url>`
Traffic lights, back/forward chevrons, a URL pill, and an extension puzzle icon. `--bg-1`, 24px radius, 1px border. Optional docked side panel on the right.

### 5.4 `<MockSite variant>`
A deliberately busy, generic, grey "before" page: left nav, banner ad, sponsored row, chips, cookie bar, recommendation sidebar, dense type.

### 5.5 `<MorphStage records layout>` — the heart of the coded demos
Renders the **same records** as `original` · `circle-grid` · `deck` · `table` · `grid` · `reader` · `big-text`.
- `<LayoutGroup>`. Each record is a `motion.div` with `layoutId="rec-{id}"`, and nested `thumb-`/`title-`/`price-` layoutIds. **Items physically fly from old position to new.**
- Clutter exits first (`opacity 0, scale .96, blur 6px`, 250ms). Records move. New chrome (table headers etc.) enters last.
- Thumbnail `border-radius` animates (12px → 50% for `circle-grid`).
- `deck` supports drag-to-swipe; `table` supports column sort.
- Fires `onMorphStart` (used to trigger a dot-field shockwave, §8.4) and `onMorphComplete`.

### 5.6 `<MorphicPanel>` — replica of the extension side panel
- Header: app icon, "Morphic", domain (`--text-2`), indigo toggle + "Morphic".
- Tabs: Chat (active, indigo underline) · Versions · Saved · Settings · "+".
- User bubble right-aligned, `--user-bubble`, 16px radius.
- Agent run card: "✓ 1 agent · 6 steps", collapsible. Each step row has a check/spinner/amber dot, a label, and a right-aligned mono timing that counts up live while running. Sub-steps are indented.
- Assistant text streams word by word.
- Version chip: green border, `v3` green mono, truncated summary, "Undo".
- Meta line: **time and steps only** (`26.5s · 6 steps`). Hide tokens and cost on marketing.
- Input: cursor-picker button, placeholder "How should this page look or work?", indigo send button.
- Driven by a timeline:

```ts
type DemoEvent =
  | { at: number; type: "typePrompt"; text: string; msPerChar?: number }
  | { at: number; type: "send" }
  | { at: number; type: "step"; id: string; label: string; indent?: 0 | 1; timing: string }
  | { at: number; type: "stepDone"; id: string; status?: "ok" | "warn" }
  | { at: number; type: "morph"; layout: Layout }
  | { at: number; type: "assistant"; text: string }
  | { at: number; type: "version"; v: number; summary: string }
  | { at: number; type: "toggle"; on: boolean }
  | { at: number; type: "reset" };
```

**Honesty rule:** compressed demos show a mono `▶▶ sped up` badge in the frame corner, with realistic step timings.

---

## 6. Page architecture — full-screen snapping tiles

The homepage is a vertical stack of **9 full-screen tiles**. Scrolling (wheel, trackpad, touch, keyboard) **clicks each tile into place**, one per gesture, like TikTok. Incoming tiles slide up **over** the outgoing one, which sinks back with depth.

### 6.1 Tile list

| # | id | Pill label | Theme |
|---|---|---|---|
| 01 | `intro` | Intro | **Light + dot field** |
| 02 | `use-cases` | Use cases | Dark (cinema) |
| 03 | `same-data` | Same data | Light |
| 04 | `how-it-works` | How it works | Dark |
| 05 | `safety` | Safety | Light |
| 06 | `features` | Features | Dark |
| 07 | `pricing` | Pricing | Light |
| 08 | `faq` | FAQ | Dark |
| 09 | `get-morphic` | Get Morphic | **Midnight + dot field** (footer lives inside) |

### 6.2 Snap + stacking implementation (native scrolling, no scroll-jacking)

```css
html { scroll-snap-type: y mandatory; }

.tile {
  position: relative;
  height: 100vh; height: 100dvh;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;   /* one tile per gesture, no skipping */
  /* z-index set inline, ascending by index, so each tile paints over the previous */
}

/* Outgoing tile: stays pinned (translateY cancels the scroll), sinks back, darkens. */
@supports (animation-timeline: view()) {
  .tile {
    animation: tile-exit linear both;
    animation-timeline: view();
    animation-range: exit 0% exit 100%;
  }
  .tile::after { /* dimming overlay — cheaper than filter on canvas/video */
    content: ""; position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none;
    animation: tile-dim linear both;
    animation-timeline: view();
    animation-range: exit 0% exit 100%;
  }
  .tile-inner { /* incoming tile: rounded top edge flattens as it lands */
    animation: tile-enter linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
  }
}
@keyframes tile-exit  { to { transform: translateY(100%) scale(0.92); border-radius: 28px; } }
@keyframes tile-dim   { to { opacity: 0.5; } }
@keyframes tile-enter { from { border-radius: 28px 28px 0 0; box-shadow: 0 -30px 60px rgba(0,0,0,.35); } to { border-radius: 0; box-shadow: none; } }
```

- Keep the **document** as the scroller (not a nested div) so keyboard (↑ ↓ PgUp PgDn Space Home End), find-in-page, and scroll restoration all work natively.
- Browsers without scroll-driven animations get plain snap (no stacking). That's acceptable.
- **Active tile detection:** IntersectionObserver at threshold `0.6` sets `activeTile` in the store.
- **Deep links:** update the hash (`#pricing`) with `history.replaceState` on tile change. Loading with a hash jumps to that tile.
- **Short viewports** (`max-height: 620px`) or zoomed-in users: switch to `scroll-snap-type: y proximity`, set tiles to `min-height: 100dvh; height: auto`, and disable the stacking animation, so nothing ever clips.
- Each tile is designed to fit **1280×720 and up** without overflow. Verify at 1280×720, 1440×900, 1920×1080, 390×844, 360×740.

### 6.3 Floating chrome (fixed, theme-aware)

- **Top-left:** app icon + "Morphic" wordmark (links to `#intro`). No background; ink color follows tile theme.
- **Top-right:** a glass pill containing a `Pricing` text link and a solid indigo **`Add to Chrome`** button. On tile 01 the button is hidden (the hero has its own big CTA) and appears with a morph-in from tile 02 onward.
- No center nav links. The progress pill (below) is the navigation.

### 6.4 Active-tile lifecycle

Every tile component receives `isActive`:
- `true`: replay entrance animation, start loops/physics/video.
- `false`: pause everything (dot field physics, demo timelines, videos, carousel autoplay).
- Also pause everything when `document.visibilityState === "hidden"`.

### 6.5 Section progress — glass pill (desktop ≥ 1024px)

A vertical **liquid-glass capsule** fixed at `right: 24px`, vertically centered.

- **Shape:** 44px wide, auto height, `padding: 14px 0`, fully rounded, glass styles from §4.2.
- **Indicators:** one per tile (9), stacked with 12px gaps. Inactive = 6px dot at 35% opacity. Passed tiles = 6px dot at 70%.
- **Active indicator:** a single shared element (`layoutId="pill-active"`), a 6×28px indigo capsule that **slides** between positions with a liquid feel. Spring `{ stiffness: 420, damping: 30 }`, plus a stretch: `scaleY` goes to ~1.35 mid-flight and settles back, so it reads like a droplet moving between slots.
- **Inner progress:** for tiles with internal sequences (Use cases carousel, How it works stepper), the active capsule fills top→bottom with a lighter indigo as the sequence progresses (`innerProgress` from the store).
- **Label flash:** on every tile change, a small glass label pops out to the **left** of the capsule — mono `03` + "Same data" — slides in (200ms), holds 1.4s, slides back.
- **Hover:** the capsule expands leftward (44px → ~210px, spring) and reveals every label next to its dot, plus a mono `03 / 09` counter at the bottom. Clicking any row jumps to that tile (`scrollIntoView({ behavior: "smooth" })`, snap finishes the landing).
- **Theme-aware:** switches between dark/light glass with the active tile.
- **Chromium bonus (progressive):** behind `@supports (backdrop-filter: url(#x))`, add an SVG `feTurbulence` + `feDisplacementMap` backdrop filter for subtle liquid refraction at the capsule's edges. Without support, it's plain blur, which still looks great.
- **A11y:** `<nav aria-label="Page sections">` of buttons; `aria-current="true"` on the active one; visible focus ring.

### 6.6 Mobile adaptation (< 1024px): the glass dock

A floating glass **dock** at the bottom center, `bottom: max(12px, env(safe-area-inset-bottom))`, width `calc(100% - 24px)`, max 480px, height 56px.

- **Left:** a row of 9 **story-style segments** (thin 3px bars, like Instagram/TikTok stories). Passed = 70%, active = filled indigo (inner progress fills it for sequence tiles), upcoming = 20%. Under the bars sits the active tile name in 13px Inter (cross-fades on change).
- **Tapping the left area** opens a glass bottom sheet listing all 9 tiles; tap to jump.
- **Right:** a compact CTA button `Get the link` → email-capture sheet (§10).
- The dock is hidden on tile 01 (the hero has its own CTA) and slides up from tile 02.
- Snap works natively with touch, which gives the TikTok feel for free. Use `100dvh` tiles and test iOS Safari's collapsing toolbar.

---

## 7. Tiles — content, layout and motion

### 7.1 Tile 01 — Intro (hero) · Light + interactive dot field

**Background:** the full-bleed `<DotField theme="light">` (§8). It covers the entire tile behind everything. As the cursor moves, dots part around it, piling into a glowing violet ring, and spring back when it leaves. A soft violet halo (a 240px radial gradient) follows the cursor under the canvas.

**Layout (desktop):** 12-column grid; text on the left (cols 1–5), demo on the right (cols 6–12), both vertically centered.

**Copy (left)**
- Eyebrow pill (light glass) with a pulsing green dot: `Now on the Chrome Web Store →`
- **H1:** **Tell any website how to look.**
  - alt: "Any website. Your interface." · "Reshape the web by describing it."
- **Rotating line** (`--light-text-2`, the two bracketed phrases in `--light-text` with an indigo underline), **synced to the demo morphs**:
  - Turn this **feed** into **a grid of circles**.
  - Turn this **feed** into **swipeable cards**.
  - Turn this **feed** into **a table sorted by views**.
  - Swap effect: old letters blur out upward, new letters blur in from below, 15ms stagger.
- **Body:** Morphic is a Chrome extension that rebuilds the page you're on into the interface you describe — using the site's real, live data. Undo anything. Flip back to the original in one click.
- **Primary CTA:** `Add to Chrome — it's free` (large, indigo). On hover, a brand-gradient light sweeps around the border once (rotating conic mask, 1.2s), and the dot field emits a gentle shockwave from the button's center.
- **Secondary CTA:** ghost `▶ Watch the 60s demo` → video dialog.
- **Microcopy:** `Free plan · No credit card · {{supportedBrowsers}}`

**Demo (right)**
- `<Demo>` = BrowserFrame + MorphStage (Streamly) + docked MorphicPanel, with the floating shadow from §4.4.
- **Mouse-parallax tilt:** the frame tilts toward the cursor (max `rotateX/rotateY ±4°`, spring-smoothed), with a faint specular sheen following the pointer across the frame glass.
- Below the frame, prompt chips labeled `Try it — tap a prompt`: `Circle grid` · `Swipe deck` · `Table by views` · `Reader view` · `Big & simple` · `Original`
- A pause/play icon button sits at the frame's top-right.

**Autoplay timeline (~26s loop)**

| Time | Event |
|---|---|
| 0.0s | Original cluttered Streamly home. |
| 0.8s | Prompt types: `make all the videos a grid of circles` (40ms/char). |
| 2.6s | Send → user bubble. Agent card opens: `UI engineer: building the view` (timer counting). |
| 3.0–4.6s | Sub-steps tick: `Reading the page` → `Rendering view grid` (amber "Preview has issues" → green) → `Taking a screenshot` → `Reporting back` → `Saving a new version`. |
| 4.0s | **Morph** to `circle-grid` + **dot-field shockwave** from the frame's center. |
| 4.8s | Assistant streams: "Done — all 12 videos are now a grid of circles. Click any circle to open it." Chip `v2 · Undo`. |
| 8.5s | `now make it swipeable cards` → morph to `deck`; the top card auto-swipes right with a toast "Saved to Watch later". `v3`. |
| 15s | `show it as a table sorted by views` → morph to `table`; rows reorder by views. `v4`. |
| 21s | Header toggle flips **off** → morph back to original. Caption: "The original site, one click away." |
| 24s | Toggle on → loop. |

Chips interrupt autoplay: fast-type (12ms/char), compressed 1.2s run, morph + shockwave. Autoplay resumes after 8s idle.

**First-visit intro (once per session, via `sessionStorage` in try/catch):** the dots start packed into the **Morphic "M"** shape at the center, hold 300ms, then burst outward to their grid homes (spring, staggered by distance). Then the H1 words rise in (60ms stagger), the demo frame fades up, and autoplay starts. Total ≤ 1.8s; any input skips it.

**Mobile:** text on top (H1 ~40px), then a compact demo below (MorphStage only, with the prompt bubble overlaid on the frame; no docked panel). Chips go in one horizontally scrolling row. The dot field is lower density and driven by the **ghost cursor** (§8.3); taps emit shockwaves.

---

### 7.2 Tile 02 — Use cases · Dark "cinema" video carousel

The strongest proof on the page: **AK's real screen recordings**, one in focus at a time, in a **horizontal** 3D carousel. **No vertical scrolling inside this tile.** Vertical wheel/swipe always moves to the next tile.

**Layout**
- Top: eyebrow `USE CASES`, **H2:** What will you morph first?, sub: Real recordings of Morphic on real websites.
- Middle: the carousel stage (fills the remaining height).
- Under the active card: its **title + outcome** (cross-fades on change) and the **prompt** shown as a panel-style user bubble.
- Bottom: story-style segment bar (one segment per card) + glass arrow buttons on either side + pause/play.

**The focus carousel (curved coverflow)**
- Stage: `perspective: 1800px; transform-style: preserve-3d`.
- Active card width = `min(64vw, (100dvh − 320px) × 1.6, 1040px)`, aspect **16:10**, radius 20px, 1px `--border`.
- Every card is placed from a continuous `offset = index − activeFloat` (continuous so dragging is buttery):

```ts
const a = Math.min(Math.abs(offset), 3);
x          = offset * cardW * 0.62;            // neighbors overlap behind the active card
translateZ = -a * 240;                          // px
rotateY    = inward(offset) * Math.min(a, 1.5) * 30; // deg — neighbors angle toward the center
scale      = 1 - Math.min(a, 2) * 0.1;
opacity    = a > 2.5 ? 0 : 1 - a * 0.3;
blur       = Math.min(a, 2) * 1.5;              // px
dim        = Math.min(a, 2) * 0.25;             // black overlay opacity
zIndex     = 100 - Math.round(a * 10);
```

- Two neighbors visible on each side on desktop.
- **Reflection:** the active card gets `-webkit-box-reflect: below 14px linear-gradient(transparent 72%, rgba(255,255,255,0.10))` (Chromium-only, which suits our audience) over a soft floor glow.
- **Hover tilt** on the active card: ±3° toward the cursor plus a moving specular sheen.

**Ambient mode (the "wow")**
- The tile background glows with the colors of the video in focus, like YouTube's ambient mode.
- While the active video plays, every 500ms draw the current frame to a 32×20 offscreen canvas, average its left and right halves, and write `--amb-left` / `--amb-right` (CSS transitions 800ms). The background is two huge blurred radial gradients using those variables.
- Requires same-origin videos (serve from `/public/videos` or set CORS + `crossOrigin="anonymous"`). If `getImageData` throws, fall back to the card's `ambient` colors from config.

**Playback rules**
- **Only the card in focus plays.** It plays from 0 every time it becomes active. Neighbors are paused on their poster frame.
- `<video muted playsInline disablePictureInPicture disableRemotePlayback>`. `preload="auto"` for the active card ±1 and `"none"` for the rest. Sources: optional AV1/WebM first, then H.264 MP4.
- Videos only play while tile 02 is active and the tab is visible.
- **When a video ends, auto-advance** to the next card (wrapping to the first after the last). The active segment in the bottom bar fills with real playback progress (`currentTime / duration`, rAF), and that progress also feeds the glass pill's `innerProgress`.
- Handle the `play()` promise rejection silently (show a play button overlay).
- If `video.spedUp`, show the mono `▶▶ sped up` badge in the card corner.

**Controls**
- Drag/swipe the stage horizontally with inertia: on release, project with velocity and spring-snap to the nearest index.
- Click a neighbor to bring it into focus. Click the active card to open a **fullscreen lightbox** (Radix Dialog) with native controls; Esc closes.
- Glass arrow buttons ‹ ›; keyboard ← → while the tile is active.
- **Horizontal trackpad swipe** (`|deltaX| > |deltaY|`) moves the carousel: accumulate deltaX, step at a 60px threshold, 400ms cooldown. **Vertical wheel is never intercepted.**
- Pause/play button (required for a11y).

**Placeholders (until videos exist): `<DemoPlaceholder>`**
- Same 16:10 box. Fill is a slowly drifting mesh gradient built from the card's `ambient` colors.
- Centered: an outlined play glyph, mono `DEMO 03`, the card title, and mono `VIDEO COMING SOON · /public/videos/03.mp4`.
- It **simulates an 8s playback** (fake progress), so focus, auto-advance, segment fill, and ambient glow all work exactly like the real thing.
- Swapping in a real video = add `video` to that entry in `useCases.ts`. Nothing else changes.

**Shot list for AK to record** (each 12–20s after editing; 16:10 crop of page + side panel):

| # | Site type | Prompt to type | Title / outcome |
|---|---|---|---|
| 01 | Video site home | "Make this feed swipeable cards. Right = Watch later." | **Swipe through your feed** — Right to save for later, left to skip. |
| 02 | Store search results | "Show these results as a comparison table" | **Compare at a glance** — Price, rating, reviews and shipping, sortable. |
| 03 | Analytics dashboard | "Turn this into charts and let me ask questions about it" | **Talk to your dashboard** — Charts plus answers from the numbers on the page. |
| 04 | News article | "Strip everything except the article. Bigger text." | **Just the story** — No ads, no popups, no sidebars. |
| 05 | Recipe blog | "Skip the life story. Just the recipe." | **Straight to the recipe** — Ingredients as a checklist. |
| 06 | Job board | "Track these jobs on a kanban: Saved, Applied, Interviewing" | **Your job hunt, organized** — Drag roles between stages. |
| 07 | Dense page | "Make this easy for my dad to read" | **Easier for everyone** — One column, big text, high contrast. |
| 08 | Video site home | "All the videos in a grid of circles" | **Make it yours** — Any layout you can describe. |

Recording tips (put these in a code comment for AK): use a clean Chrome profile, hide the bookmarks bar, and make sure no personal accounts, notifications, or other people's private info are visible. Show the prompt being typed, speed up the agent wait 4–8× in editing (then set `spedUp: true`), show the morph, do one interaction (swipe/sort/ask), and end by flipping the toggle back to the original. Export H.264 MP4 (CRF ~23, `+faststart`, no audio track, 30fps, 1600×1000), ≤4MB each, plus a poster JPG of the first frame.

**Mobile:** one card at 90vw with a 5% peek of each neighbor, swipe-only, no 3D rotation (keep scale/opacity). Story segments sit above the dock. Tapping the active card opens the fullscreen lightbox, which suggests rotating the phone.

---

### 7.3 Tile 03 — Same data · Light

**Layout:** text on the left (cols 1–4), toggle demo on the right (cols 5–12).

- Eyebrow `THE TOGGLE`
- **H2:** Same page. Same data. Always live.
- **Body:** Morphic doesn't build a new app or invent anything. It reads the records already on the page — titles, prices, images, links — and renders them in the view you asked for. When the site updates, your view updates with it.
- Three compact proof points (icon + one line each):
  - **Infinite scroll** — new items flow into your view as the site loads them.
  - **Follows navigation** — move between pages and your view comes with you.
  - **Nothing invented** — if it isn't on the page, it isn't in your view.

**Demo (right)**
- A large switch (the panel toggle at 2×) above a `<BrowserFrame url="shopwise.demo/search?q=headphones">`, labeled `Original` ⟷ `Morphic`.
- Off = cluttered Shopwise results. On = a clean sortable comparison table (Product · Price · Rating · Reviews · Shipping · Link), via the full MorphStage animation.
- **Live mode** (while on): every ~3s a new product slides into the table with a soft indigo pulse, and every ~7s a price ticks down (`$129 → $119`) with a cell flash. A pulsing green `● Live` pill sits in the frame corner.
- **Source tooltips:** hovering a cell shows a mono tooltip such as `from page → .result-card .price`, and a ghosted copy of the original page behind the table briefly highlights the matching element.
- The switch pulses until first touched, and auto-flips once each time the tile becomes active.

**Mobile:** the H2 + body + switch go on top, with a compact frame below in which the table becomes stacked cards. Proof points collapse into one line: `Infinite scroll · Follows navigation · Nothing invented`.

---

### 7.4 Tile 04 — How it works · Dark · "stories" stepper

One screen, five steps, played like stories, with no long scroll.

- Eyebrow `HOW IT WORKS`
- **H2:** A small team of agents, working on your page.

**Layout (desktop):** left (cols 1–5) holds the five step titles as a vertical list; the active step expands to show its body text. Right (cols 6–12) holds the **agent graph** visual with **5 story progress bars across its top**.
- Auto-advance every **4.5s**; the bar fills during each step. Clicking a step jumps to it. Hovering pauses. Progress feeds the pill's `innerProgress`.

**Agent graph:** an **Orchestrator** hub in the center with **Data**, **UI**, and **QA** nodes around it, drawn as dark cards with mono labels. Connections are dashed lines with small dots traveling along them when two agents talk. Active nodes glow indigo; finished nodes show a green check and a frozen mono timing. A small preview screen beneath the graph shows the page state for the current step.

**Steps**
1. **You describe it.** Type what you want in the side panel, like you'd brief a designer. Or use the picker to point at one part of the page and reshape just that.
   *Visual:* prompt types; the cursor picker draws a dashed indigo outline around a sidebar. Orchestrator lights up.
2. **The Data agent reads the page.** It finds the records — every video, product or row — and writes an extractor: the selectors that pull them from the live page.
   *Visual:* records are outlined one by one with a counter (`12 records`) and a mono snippet: `records: article.video-card · title: h3 a · views: .meta span:first-child`
3. **The UI agent designs the view.** It builds the layout from Morphic's components — decks, grids, tables, charts, kanban boards, chat — and streams live previews as it goes.
   *Visual:* component blocks slide in from a palette and snap into a layout.
4. **The QA agent checks the work.** It screenshots the result and checks it against the extracted data. If something's off, it goes back for a fix.
   *Visual:* a scan line sweeps; one tile flags amber `Preview has issues` → loops back to UI → green.
5. **You get a version.** The result is saved as a version you can undo, revisit, or reapply on every matching page.
   *Visual:* `v1 v2 v3` chips stack; Undo rewinds; a `Saved for /watch/*` pill appears.

**Mobile:** the visual on top with story bars across it; step text below. **Tap the right half to go to the next step and the left half to go back**, like Instagram stories. Press-and-hold pauses.

---

### 7.5 Tile 05 — Safe by design · Light

**Layout:** left (cols 1–5) has the text and trust list; right (cols 6–12) has the spec ↔ UI visual.

- Eyebrow `SAFE BY DESIGN`
- **H2:** Agents design the view. They never run code on your page.
- **Body:** Morphic's agents don't write scripts. They produce a morph spec — validated data describing what to read, how to lay it out, and which actions are allowed. A fixed renderer turns that spec into UI inside an isolated Shadow DOM.
- Trust list (4 compact rows, icon + bold title + one line):
  - **No generated code** — Specs are checked against a schema and drawn by fixed components.
  - **Isolated rendering** — Views live in a Shadow DOM, apart from the site's own scripts.
  - **You approve risky actions** — Deleting, buying, posting or sending always asks first.
  - **Only on your screen** — The site, and everyone else on it, sees nothing different.
- Privacy line + link "Read the privacy policy →": `{{What page content and screenshots are sent to Morphic's servers, retention, and training use. (verify) — do not ship until accurate.}}`

**Visual (right):** a dark frame split in two. Left: a syntax-highlighted mono morph spec. Right: the rendered deck. Spec blocks highlight in sequence and the matching UI part glows at the same time: `extractor` → records outline, `view` → deck layout, `actions` → a card swipes right and a ghost cursor clicks "Save" on a faded copy of the page behind. At the end of the loop, a **confirm-dialog mock** pops in: "Morphic wants to click **Place order** on shopwise.demo." `[Cancel]` `[Allow once]`.

```json
{
  "extractor": {
    "records": "article.video-card",
    "fields": {
      "title":   "h3 a",
      "channel": ".channel-name",
      "views":   { "select": ".meta span:first-child", "transform": "parseCount" },
      "thumb":   { "select": "img", "attr": "src" },
      "url":     { "select": "h3 a", "attr": "href" }
    }
  },
  "view": { "type": "deck", "card": ["thumb", "title", "channel", "views"] },
  "actions": {
    "swipeRight": { "type": "replayClicks", "label": "Save to Watch later" },
    "swipeLeft":  { "type": "skip" }
  }
}
```
`// TODO(AK): replace with a sanitized real spec matching packages/shared types`

**Mobile:** the visual shrinks to the rendered deck with a "View spec" button that flips the card (3D flip) to show the JSON. The trust list becomes 4 icon chips; tapping one shows its line.

---

### 7.6 Tile 06 — Features · Dark bento

- Eyebrow `BUILT FOR THE REAL WEB`
- **H2:** Built for the messy, real web.

**Bento:** a 4-column × 2-row grid sized to fit the remaining height. Each tile is `--bg-1` with a 1px border and a **cursor-following spotlight** on its border (a radial gradient at the pointer). Each has a title, one line, and a micro-animation that plays on tile entry and loops on hover.

| Tile | Span | Title | Copy | Micro-animation |
|---|---|---|---|---|
| A | 2×1 | **Point at anything** | Pick one element with the cursor tool and reshape just that part. | A cursor glides in, a dashed indigo outline snaps to a sidebar, and it morphs into a checklist. |
| B | 1×1 | **Undo anything** | Every morph is a version. Roll back in one click. | `v1→v2→v3` chips; Undo rewinds. |
| C | 1×1 | **Views that repair themselves** | When a site changes and a view breaks, agents fix it. **(verify)** | A grid jitters, an amber `Layout changed` badge appears, then green `Repaired`. |
| D | 1×1 | **Works the site's own buttons** | Swipe right to "Save to Watch later" — Morphic clicks the real button. | A card swipes; a ghost cursor clicks the real button on a faded page. |
| E | 1×1 | **Save once, use everywhere** | A saved view applies to every matching page. | A `/watch/*` pill with three page thumbnails stacking, all in the same layout. |
| F | 2×1 | **Charts and chat over any data** | Turn tables and dashboards into charts, then ask questions about the numbers. | Bars grow; the question "Which month had the highest churn?" gets an answer and the matching bar highlights. |

**Mobile:** the bento becomes a **horizontal swipe** of single tiles (one at a time, with dots); no vertical overflow.

---

### 7.7 Tile 07 — Pricing · Light

- Eyebrow `PRICING`
- **H2:** Start free. Upgrade when you're hooked.
- **Sub:** A morph is one request that creates or changes a view. {{Opening your saved views doesn't use morphs. (verify)}}
- Monthly / Yearly toggle (yearly shows a "2 months free" pill). Prices change with a **vertical digit roll**.

| | Free | **Pro** (highlighted) | Power |
|---|---|---|---|
| Price | $0 | ${{15}}/mo · ${{144}}/yr | ${{39}}/mo · ${{372}}/yr |
| Line | Try it on your favorite sites. | For everyday browsing, your way. | For people who morph everything. |
| Includes | {{20}} morphs/month · All view types · Versions & undo · {{3}} saved views | {{200}} morphs/month · Unlimited saved views · Self-repairing views · Charts & chat over data | {{750}} morphs/month · Everything in Pro · Early access to new view types · Priority support |
| CTA | `Add to Chrome` | `Get Pro` | `Go Power` |

- **The Pro card is dark** on the light tile, raised 12px, with a slowly rotating brand-gradient border (conic, 8s) and a "Most popular" pill.
- `Compare all features` opens a Dialog with the full comparison table (keeps the tile one screen).
- Trust row: `Cancel anytime · Secure checkout by {{Stripe}} · {{money-back guarantee if offered}}` · `Need it for a team? {{Talk to us}}`
- **If `site.socialProof` has entries**, a slow quote marquee runs along the bottom edge of this tile. Otherwise nothing renders there.
- **Checkout routing:** if upgrading requires an account created inside the extension, paid CTAs go to the store with the copy "Install, then upgrade in Settings". `// TODO(AK): confirm upgrade flow`

**Mobile:** plan cards become a horizontal swipe carousel, with Pro centered first and Free/Power peeking on either side.

---

### 7.8 Tile 08 — FAQ · Dark

- **H2:** Questions, answered.
- **Desktop:** a two-column Radix Accordion with **single-open** behavior and 8 questions. Answers are kept to ≤ 3 lines so the tile never overflows. The height animation is smooth and the chevron rotates.
- **Mobile:** a list of questions; tapping one opens a glass **bottom sheet** with the answer.

1. **What does Morphic actually change?** Only what you see in your own browser. The website, and everyone else on it, sees nothing different.
2. **Which websites does it work on?** Most sites where content is on the page: feeds, search results, listings, dashboards, articles. Content drawn in a canvas or locked in some embeds can't be read. {{Known limitations (verify)}}
3. **Does it ever make things up?** No. Everything comes from the page through an extractor, and a QA agent checks the result against that data.
4. **Can it click things for me? Is that safe?** Agents never run code. Actions are limited to opening links, saving, loading more, and replaying short click sequences. Anything risky asks you first.
5. **What data does Morphic see and send?** {{From the privacy policy (verify)}}
6. **What happens when a site changes its design?** Morphic notices when a view breaks and agents repair it. Your versions stay available. **(verify)**
7. **Can I go back to the normal site?** Anytime. Flip the toggle, or undo to any earlier version.
8. **Which browsers are supported? Can I cancel?** {{supportedBrowsers}} on desktop. Plans cancel anytime. {{refund details}}

Add `FAQPage` JSON-LD.

---

### 7.9 Tile 09 — Get Morphic · Midnight + dot field (with footer)

The bookend: the hero's dot field returns in **midnight** mode (deep navy with luminous dots, additive glow), and this time the dots **form the Morphic "M"**.

- **Background:** `<DotField theme="midnight" formation="logo">`. About 35% of the dots have their home positions sampled from the logo's alpha mask (centered, ~380px tall on desktop) and render brighter. The rest stay a faint grid. The cursor tears through the M; dots spring back and reform it. When the CTA is hovered, the M **breathes** (dots push out 4px and settle, 1.2s loop).
- **H2** (above or overlapping the lower third of the M): Stop adapting to websites. Make them adapt to you.
- **CTA:** `Add to Chrome — it's free` · microcopy `Free plan · No credit card`
- **"What would you morph?" input**, styled exactly like the panel input (placeholder: `How should your favorite site look?`, indigo send button). On submit: copy the prompt to the clipboard, show a toast "Copied — paste it into Morphic after installing", emit a shockwave from the input, and pulse the CTA. Fire `idea_prompt_submit` (prompt text only, anonymous).
- **Footer** as a slim bar pinned to the bottom of this tile: mark + "Morphic" · Use cases · Pricing · Privacy · Terms · {{X}} · `© 2026 {{legalEntity}}` · small "Morphic is not affiliated with the websites it works on."

---

## 8. `<DotField>` — the interactive particle background

The reference is a dot-matrix object whose dots part around the cursor into a bright, hollow "lens" ring and spring back. Here it spans the **entire hero background on a light field**, and returns on the final tile in midnight mode.

### 8.1 Rendering
- One `<canvas>` absolutely filling the tile, under all content. DPR capped at 2.
- **WebGL2** `gl.POINTS` in a single draw call. The fragment shader draws soft round dots with a 1px antialiased edge. Light theme uses normal alpha blending; midnight uses additive blending (`SRC_ALPHA, ONE`) so overlapping dots bloom.
- **Fallback:** Canvas 2D with a pre-rendered dot sprite (`drawImage`) at 60% density.
- A CSS radial-gradient **halo** div follows the cursor under the canvas (240px, `--hero-halo` / `--mid-halo`, transform only).

### 8.2 Grid & look

```ts
// src/components/dotfield/config.ts — starting values, tune by feel
export const dotField = {
  spacing:   { desktop: 14, tablet: 18, mobile: 22 }, // px between dots
  radius:    1.4,                                     // base dot radius (px)
  depthLayers: [0.6, 0.8, 1.0],                       // random per dot: scales size + reaction → parallax depth
  physics: {
    spring: 0.045,          // pull back to home
    damping: 0.88,          // velocity multiplier per frame
    cursorRadius: 160,      // px (110 on mobile)
    strength: 2.4,          // repulsion force
    wake: 0.08,             // dots get dragged along cursor velocity (fluid feel)
    maxDisplacement: 64,    // clamp → dots pile up at the ring instead of scattering
  },
  shockwave: { speed: 900, life: 0.8, strength: 6 },  // px/s, s, impulse
  ghostCursor: { idleMs: 4000, strength: 0.6 },
  textSafeOpacity: 0.35,    // multiplier for dots behind the headline area
};
```

- Square grid; each dot gets a random depth layer and ±10% size variance so the field feels organic, not like graph paper.
- Overall opacity fades out toward the tile edges (radial vignette) and drops to `textSafeOpacity` behind the hero text column, so the H1 stays crisp.

### 8.3 Physics (per dot, `Float32Array` state: homeX, homeY, x, y, vx, vy, depth, seed)

Each frame:
1. **Spring:** `a = (home − p) * spring`
2. **Cursor repulsion** (if `d < cursorRadius`): `a += dir * strength * (1 − d/R)² * depth`. This pushes dots out of a hollow disc around the cursor.
3. **Wake:** `a += cursorVelocity * wake * (1 − d/R)`, so the field gets "stirred" in the direction you move.
4. **Idle breathing:** a tiny offset `sin(t*0.6 + seed) * 0.15px`.
5. `v = (v + a) * damping`; `p += v`; clamp `|p − home| ≤ maxDisplacement`.

**Visual mapping:** `m = |p − home|`. Size = `radius * (1 + min(m/18, 1.4))`. Color lerps from `--hero-dot` to `--hero-dot-active` by `min(m/24, 1)`. Dots compressed at the ring edge become bigger, denser, and violet, producing the **glowing lens ring** from the reference.

**Target feel:** a clean hollow lens with a dense, bright ring that glides with the cursor and leaves a soft rippling wake, then settles calmly. If dots scatter messily, raise `spring` or lower `strength`; if the ring is weak, raise `strength` and lower `maxDisplacement`.

**Shockwaves:** triggered by clicks/taps, by demo morphs (`onMorphStart`), by CTA hover, and by the final-tile input submit. A ring expands from the origin at `speed`; dots it crosses get an outward impulse that decays over `life`.

**Ghost cursor:** after `idleMs` without pointer movement (and always on touch devices), a virtual cursor drifts along a slow Lissajous path at reduced strength, so the field is never static. Real pointer movement takes over instantly.

**Logo formation (§7.1 intro, §7.9):** load the transparent mark, draw it to an offscreen canvas, sample opaque pixels on a ~6px grid, and assign those points as `start` (intro) or `home` (final tile) positions for a subset of dots.

### 8.4 Performance
- Physics and rendering run **only while the tile is active** and the tab is visible.
- **Sleep optimization:** skip dots that are at rest (`|v| < 0.01`, `|p−home| < 0.05`) and outside `1.5 × cursorRadius`, unless a shockwave is live.
- Adaptive quality: if average frame time > 20ms over 30 frames, rebuild with 40% fewer dots.
- Rebuild the grid on resize (debounced 150ms).
- Budget: ≤ 3ms/frame on a mid-range laptop at 1440×900 (~6.5k dots).

### 8.5 Reduced motion
Render a static grid (with the M formation on the final tile), with no physics, intro, ghost cursor, or shockwaves.

---

## 9. Video dialog
A Radix Dialog with a 16:9 player (`site.demoVideo`) on `--bg`, 24px radius, and a violet glow. It plays with sound when opened (the click allows it), Esc closes it, and focus is trapped. If no video is configured, hide every "Watch the demo" button.

---

## 10. Conversion & browser handling

- Install buttons link to `chromeStoreUrl?utm_source=site&utm_medium={{tile-id}}`.
- **Browser detection** (after hydration, no layout shift):
  - Desktop Chrome/Chromium: `Add to Chrome — it's free`
  - Desktop Firefox/Safari: `Get Morphic for Chrome`, with a tooltip noting {{supportedBrowsers}}
  - **Mobile/tablet:** every install CTA becomes **`Get the link`** → a glass bottom sheet with an email field → `emailCaptureEndpoint` → "Check your inbox on your computer."
- **Analytics events:** `tile_view {id}`, `cta_install_click {tile}`, `demo_chip_click {prompt}`, `video_open`, `usecase_focus {id}`, `usecase_complete {id}`, `usecase_lightbox {id}`, `toggle_flip`, `pill_nav {to}`, `idea_prompt_submit {prompt}`, `pricing_billing_toggle`, `checkout_click {plan, billing}`, `email_capture`.

---

## 11. Other pages

- **`/welcome`** — opened by the extension on install. Goal: **a first successful morph in under 60s.** H1: You're in. Let's make your first morph. Steps: (1) Pin Morphic (animated puzzle → pin illustration); (2) open the panel {{shortcut}}; (3) three starter cards linking to `/playground` pages, each with a `Copy prompt` button. The light dot field runs in the background.
- **`/playground/*`** — real DOM pages (not animated mocks) for Streamly, Shopwise, and Pulseboard, generated from `src/demo/data.ts`. **Port the repo's `test-website/` fixtures if they fit.** This guarantees a working first try and a reliable recording surface.
- **`/uninstall`** — set via `chrome.runtime.setUninstallURL`. "Sorry to see you go. What didn't work?" (Didn't work on my site · Too slow · Too expensive · Just trying it) + optional text → `uninstallFeedbackEndpoint`.
- **`/privacy`, `/terms`** — page layouts only; content `{{AK to provide}}`. Required for the Chrome Web Store.
- **`404`** — the dot field arrives scattered and reassembles into "404"; below it: "This page didn't morph." + `Back home`.

These pages scroll normally (no tile snap).

---

## 12. Accessibility & reduced motion

- WCAG AA contrast on every theme, including text over the dot field (enforced by the text-safe mask).
- Decorative canvases and demo internals use `aria-hidden="true"`, with visually hidden descriptions of what each demo shows.
- Carousel: `role="region"` + `aria-roledescription="carousel"`; slides use `aria-roledescription="slide"` + `aria-label="3 of 8: Talk to your dashboard"`; visible pause button; arrow buttons labeled.
- The progress pill and dock are real buttons with `aria-current`.
- Focus rings: 2px `--accent`, 2px offset. Everything is keyboard operable; focusing an element inside another tile scrolls that tile into view.
- **`prefers-reduced-motion: reduce`:** snap stays (it isn't animation), but the stacking transition is off; tile entrances become 150ms fades; the dot field is static; demo and carousel autoplay are off (posters with play buttons; the hero shows its "after" state); the pill indicator moves without stretch.

---

## 13. Performance & SEO

- **Targets:** Lighthouse Performance ≥ 90 desktop / ≥ 80 mobile, LCP < 2.2s, CLS < 0.05, landing JS < 230KB gz (excluding video).
- The hero H1 and copy are static HTML (the LCP element). DotField and the demo hydrate after first paint; the canvas fades in over 400ms.
- Tiles 02–09 load their heavy code via `next/dynamic` once the previous tile is active (prefetch one ahead).
- **Videos:** never load until tile 02 is next or active. Then load only active ±1. While the user is on the hero, use `requestIdleCallback` after 3s to preload the **first** video's metadata + poster.
- **Metadata:** title `Morphic — Tell any website how to look`; description `Morphic is a Chrome extension that rebuilds any web page into the interface you describe, using the site's real, live data. Undo anything, anytime.`
- **OG image** (1200×630, `next/og`): light dot-field background with a violet lens ring, the ribbon mark, the H1, and a frozen circle-grid demo frame.
- Favicon from the app icon. JSON-LD `SoftwareApplication` (`BrowserApplication`, `operatingSystem: "Chrome"`, offers from config) + `FAQPage`. `sitemap.xml`, `robots.txt`, canonical URLs.

---

## 14. Content rules (must follow)

- No fake testimonials, user counts, ratings, "as seen in", or customer logos.
- Coded visuals use fictional sites only. Real site names appear in text only for sites AK has tested **(verify)**.
- Recordings: no personal accounts, notifications, or other people's private data visible.
- Sped-up demos and recordings always show the `▶▶ sped up` badge.
- Every **(verify)** item is listed on `/dev/launch-checklist` until AK clears it in code.

---

## 15. Build order & definition of done

1. **Scaffold:** Next.js, tokens, fonts, configs, the tile system (§6.2) with 9 empty themed tiles, the active-tile store, floating chrome, the **glass progress pill**, and the **mobile dock**. Get the snap + stacking feel perfect before anything else.
2. **DotField:** WebGL2 renderer, physics, halo, ghost cursor, shockwaves, logo sampling, fallback, perf guards. Tune on `/dev/dots`.
3. **Demo engine:** data, Thumb, BrowserFrame, MockSite, MorphStage, MorphicPanel, timeline runner (`/dev/demo`).
4. **Tile 01** hero (layout, intro, autoplay, chips, tilt, rotating line, video dialog).
5. **Tile 02** video carousel with placeholders (coverflow, drag, ambient mode, playback rules, segments, lightbox).
6. **Tiles 03–06:** Same data, How it works stepper, Safety, Features bento.
7. **Tiles 07–09:** Pricing, FAQ, Get Morphic (midnight dot field + M formation + footer).
8. **Other pages:** `/welcome`, `/playground/*`, `/uninstall`, `/privacy`, `/terms`, 404.
9. **Polish:** responsive at every listed viewport, reduced motion, a11y, perf budgets, SEO/OG, analytics, browser detection, `/dev/launch-checklist`.

**Done when:**
- [ ] One scroll gesture = one tile, on trackpad, mouse wheel, keyboard and touch, with no skipping and no half-landed tiles.
- [ ] The incoming tile visibly slides over the outgoing one, which sinks back and dims (Chrome).
- [ ] The glass pill's active indicator glides with a liquid stretch, labels flash on change, and hover expands to clickable labels. On mobile, the dock segments and sheet work.
- [ ] No tile needs internal scrolling at 1280×720, 1440×900, 1920×1080, 390×844 or 360×740.
- [ ] The hero dot field forms a clean glowing lens ring around the cursor at 60fps, with ghost-cursor movement on idle/touch and shockwaves on morphs/clicks.
- [ ] In the carousel, only the focused card plays; it auto-advances on end; ambient glow follows the video; vertical scrolling is never captured; placeholders behave exactly like videos.
- [ ] Every coded morph moves the *same* records (shared layoutIds), not a crossfade.
- [ ] Reduced-motion mode is fully static and usable.
- [ ] Every CTA uses config values and fires its analytics event.
- [ ] No real brand logos in coded visuals and no invented social proof anywhere.
