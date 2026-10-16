# Morphic — launch site

The marketing site for Morphic, built from `morphic-launch-site.md`: nine full-screen snapping tiles, a WebGL dot field, coded product demos, a cinema carousel for the recordings, and the supporting pages.

Next.js 16 (App Router, static) · React 19 · Tailwind v4 · Motion · Radix · raw WebGL2.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes are static)
npm start
npm run typecheck
```

## Before launch

Open **`/dev/launch-checklist`**. It lists everything still waiting on you, generated from the code:

- every `{{placeholder}}` in `src/config/site.ts` and `src/config/faq.ts` (in development, placeholder copy is outlined in amber on the page);
- every **(verify)** product claim in `src/config/verify.ts` — set `cleared: true` once confirmed;
- use-case recordings that are still placeholders;
- the remaining `TODO(AK)` items (hi-res transparent logo, upgrade flow, privacy/terms copy, form endpoints, spec sample, pricing matrix).

All launch values live in `src/config/` — components never need editing to launch.

| File | What |
|---|---|
| `src/config/site.ts` | URLs (store, checkout, endpoints), prices, supported browsers, analytics, legal entity, brand assets, upgrade flow |
| `src/config/useCases.ts` | The 8 carousel entries + recording instructions |
| `src/config/faq.ts` | FAQ copy (also feeds the FAQPage JSON-LD) |
| `src/config/verify.ts` | (verify) claims tracked on the checklist |
| `src/config/tiles.ts` | Tile order, labels and themes |

## Adding the recordings

Put `01.mp4` + `01.jpg` (… `08`) in `public/videos/`, then add `video` to the matching entry in `src/config/useCases.ts`:

```ts
video: { mp4: "/videos/01.mp4", poster: "/videos/01.jpg", spedUp: true },
```

Nothing else changes — focus, auto-advance, the segment bar and ambient glow already run on the placeholders. Export settings and recording tips are in the comment at the top of `useCases.ts`.

## Dev pages

- `/dev/dots` — tune the dot field live (hero, final-tile "M", 404).
- `/dev/demo` — the demo engine in isolation (every layout, autoplay, the products table, the Pulseboard dashboard ↔ chat).
- `/dev/launch-checklist` — see above.

`/dev/*` is disallowed in `robots.txt`; `/welcome`, `/uninstall` and `/playground/*` are `noindex`.

## Where things are

```
src/app/                 routes, metadata, OG image, sitemap, robots, 404
src/components/tiles/    one folder per homepage tile (+ Tile, TileController, NearGate)
src/components/chrome/   floating logo/CTA, glass progress pill, mobile dock
src/components/dotfield/ WebGL2 dot field engine (Canvas 2D fallback), shapes, shockwave bus
src/components/demo/     MorphStage, MorphicPanel, timeline player, scripts, BrowserFrame, Thumb
src/components/playground/  real DOM Streamly / Shopwise / Pulseboard pages for trying Morphic
src/demo/data.ts         fictional records used by every coded demo and the playgrounds
```

## Deploying

Deploy to Vercel as a standard Next.js project (`vercel deploy`). Set `site.url` first — it drives canonical URLs, the sitemap and Open Graph.
