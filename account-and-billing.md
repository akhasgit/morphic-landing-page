# Morphic — Accounts, billing, and synced API keys

Build spec for accounts, payments, and the account dashboard. This sits next to the marketing site (`morphic-launch-site.md`) and the extension/server in the sibling `morphic` repo.

## Locked decisions

| Topic | Decision |
|---|---|
| Identity | Google Sign-In only. No Firebase. No license keys. |
| Billing | Stripe Checkout + Customer Portal + webhooks. |
| Entitlement | The Morphic user row in Postgres is the source of truth for plan and quota. Stripe is the source of truth for money. |
| Account required | Every install signs in with Google before hosted or bring-your-own-key (BYOK) runs. |
| API keys | Anthropic keys are saved from the dashboard (or the extension) onto the Morphic server, encrypted at rest, and used for BYOK runs on every signed-in device. The raw key is not stored in the extension and is never returned after save. |
| Dashboard host | `account.<domain>`. Marketing stays on the apex / `www`. API stays on `api.<domain>`. |
| Upgrade | Paid CTAs on the marketing site open Stripe Checkout. The extension and dashboard also offer Upgrade / Manage billing for people who installed first. |

## What already exists

In `morphic`:

- Extension Google sign-in via `chrome.identity` → `POST /v1/auth/google` → Morphic session JWT (`server/src/auth/session.ts`, 30-day HS256). Session is stored in `chrome.storage`.
- Two modes in Settings: **Morphic account** (hosted) and **My Anthropic key** (BYOK). The BYOK key currently lives only in extension settings (`byokKey`) and is sent on each run as `auth: { kind: "byok", apiKey }`.
- Users table: `id`, `email`, `name`, `google_sub`. Usage ledger already records hosted vs BYOK.
- Flat hosted quotas: `HOSTED_DAILY_RUNS` / `HOSTED_DAILY_USD`. No plans, Stripe, or dashboard yet.
- Logs already scrub secrets. BYOK keys must stay out of logs.

In this landing repo:

- Pricing CTAs read `site.checkout` or, if `site.upgradeFlow === "in-extension"`, send people to the Chrome Web Store. Set `upgradeFlow` to `"checkout"` and fill the Stripe URLs (or replace static URLs with a “create Checkout Session” call once accounts exist).
- Install buttons do nothing until `site.chromeStoreUrl` is set.

## Surfaces

```text
www / marketing          install + Stripe Checkout
account.<domain>         Google login, plan, usage, billing, Anthropic key
api.<domain>             Morphic server (auth, entitlements, key vault, runs, Stripe webhooks)
Chrome extension         Google login, session in chrome.storage, BYOK uses the server-held key
Stripe                   Checkout, Customer Portal, webhooks
```

The dashboard is only for account management: subscription, usage, and the Anthropic key. Morphing stays in the extension.

### Why a subdomain

`account.<domain>` keeps the cinematic marketing site separate from a plain signed-in app: different UI, independent deploys, easy `noindex`, and cookies/API scoped to the product. Marketing and dashboard can still share the parent cookie domain `.yourdomain.com` if the session cookie is set that way. Starting at `/account` on the marketing site is acceptable for a prototype; move to the subdomain before launch.

## User journeys

**Buy on the site.** Marketing → Stripe Checkout (Google account already created, or created from the Stripe email right after pay) → webhook sets the plan → install the extension → sign in with the same Google account → Pro/Power quota applies.

**Install first.** Install → Google sign-in → free tier → Upgrade in the extension or dashboard → Stripe → webhook updates the plan. The extension, already signed in, sees the new quota on the next `/v1/me`.

**Add an Anthropic key.** Sign in on the dashboard → paste key → server validates with Anthropic, stores ciphertext → any signed-in extension on “My Anthropic key” uses that key. No re-paste per device.

## Data model (Postgres)

Extend `users` (or add tables keyed by `user_id`):

```text
users
  id, email, name, google_sub, created_at
  stripe_customer_id          nullable, unique

subscriptions
  user_id
  stripe_subscription_id
  plan                        free | pro | power
  interval                    month | year | null
  status                      trialing | active | past_due | canceled | incomplete
  current_period_end
  cancel_at_period_end

user_secrets
  user_id                     primary key
  anthropic_key_ciphertext    bytea
  key_hint                    text          -- e.g. last 4 chars, never the full key
  updated_at
```

Plans (match `src/config/site.ts` once the `{{placeholders}}` are filled):

| Plan | Hosted morphs | Saved views | BYOK |
|---|---|---|---|
| Free | landing `pricing.free.morphs` | `pricing.free.savedViews` | allowed, account required |
| Pro | `pricing.pro.morphs` | includes free | allowed |
| Power | `pricing.power.morphs` | includes pro | allowed |

Quota checks read the usage ledger (`usageSince`) against the user’s current plan, not a second counter. Free users with no Stripe customer still have a `subscriptions` row of `plan=free, status=active` created at sign-up.

## Auth and staying signed in

Google remains the only identity provider. First successful sign-in upserts the user (`google_sub`) and creates the free subscription row.

**Dashboard.** Google ID token → `POST /v1/auth/google` (existing) → set an HTTP-only session cookie on `.yourdomain.com` (or a long-lived refresh beside the 30-day Morphic JWT). Refresh before expiry so a returning visit stays logged in until Sign out.

**Extension.** Keep the current flow: `chrome.identity` → `POST /v1/auth/google` → `chrome.storage` session. On 401, try silent Google sign-in and re-issue. Sign out clears storage only; it does not delete the server account.

Same Google account on the dashboard and the extension is the same `users` row.

## Stripe

1. Products: Pro monthly, Pro yearly, Power monthly, Power yearly. Prices match the landing config.
2. Checkout Session is created by the API (`POST /v1/billing/checkout`) with `client_reference_id` = Morphic `user_id` and `customer` = `stripe_customer_id` (create the Customer on first checkout). Success URL returns to `account.<domain>`.
3. Marketing-site buttons call that endpoint when the visitor is signed in. If they are not, send them through Google sign-in on `account.<domain>` first, then into Checkout. Do not use anonymous Payment Links that cannot be tied to a user.
4. Webhooks (verify signature): `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`. Handler is idempotent and only updates `subscriptions`.
5. `POST /v1/billing/portal` returns a Stripe Customer Portal URL (cancel, change card, invoices, switch plan).

Failed payment → `past_due`: keep access for the current period, show a banner on the dashboard and in the extension. Canceled at period end → drop to free when `current_period_end` passes.

## Synced Anthropic key

The server holds the key. The extension never stores it and never receives it back.

```text
Dashboard or extension
  PUT /v1/me/anthropic-key { apiKey }     validate, encrypt, store hint
  GET /v1/me/anthropic-key                { present, hint } only
  DELETE /v1/me/anthropic-key             wipe ciphertext

Extension run, mode = byok, auth = { kind: "session", token }
  server decrypts in memory → Anthropic for that run only
```

Rules:

- Encrypt with an app secret (`ANTHROPIC_KEY_ENCRYPTION_SECRET`, 32 bytes) or a KMS key. Decrypt only inside the run process. Do not log plaintext. Do not write it to the usage ledger.
- `GET` returns a hint (`sk-ant-…` + last 4), never the key.
- Replace overwrites ciphertext. Delete removes the row.
- Validate with a cheap Anthropic call before save (the extension already has “Save & check”).
- Protocol change: BYOK + session means “use my stored key.” Stop requiring `auth: { kind: "byok", apiKey }` from the client. Accept the old client-supplied key only during migration, then remove it so devices cannot drift.
- Extension Settings, BYOK mode: if signed in and `present` → “Using the key saved on your account (`…abcd`).” Link to `account.<domain>`. The extension may also expose the same paste field; it writes to the API, not to `chrome.storage`.
- Remove `settings.byokKey` as the source of truth (`extension/src/common/start-run.ts` currently throws if it is empty).

## API (additions)

All routes except the webhook require a Morphic session (`Authorization: Bearer` or the dashboard cookie).

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/me` | Extend today’s quota payload with `plan`, `status`, `periodEnd`, `key: { present, hint }` |
| PUT | `/v1/me/anthropic-key` | Validate, encrypt, store |
| GET | `/v1/me/anthropic-key` | Hint only |
| DELETE | `/v1/me/anthropic-key` | Remove |
| POST | `/v1/billing/checkout` | `{ plan: "pro"\|"power", interval: "month"\|"year" }` → `{ url }` |
| POST | `/v1/billing/portal` | `{ url }` |
| POST | `/v1/stripe/webhook` | Stripe only; raw body + signature |

Hosted runs already use `auth: { kind: "session" }`. They keep doing that, with the plan’s morph limit instead of the single global `HOSTED_DAILY_RUNS`.

## Dashboard (`account.<domain>`)

Thin app. Google sign-in, then:

| Screen | Contents |
|---|---|
| Overview | Email, plan, morphs used / remaining, renew date, past-due banner |
| Billing | Upgrade (Checkout) and “Manage subscription” (Portal). No card form of our own. |
| API key | Masked field, Save & check, Replace, Remove |

Out of scope: chat, morphing, page tools, team seats.

Ship it as its own Next.js app (or a route group later moved to the subdomain). `noindex`. Sign-out clears the cookie.

## Extension changes

1. Sign-in stays Google; block hosted and BYOK runs until a session exists.
2. Settings shows plan and usage from `GET /v1/me`, plus Upgrade / Manage billing links to `account.<domain>`.
3. BYOK reads “key on file” from the API. Runs send the session token only.
4. Silent re-auth when the JWT expires so they stay logged in across browser restarts.
5. `chrome.runtime.setUninstallURL` → marketing `/uninstall` when that endpoint exists.

## Env (server)

Existing: `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `DATABASE_URL`, `ANTHROPIC_API_KEY` (platform key for hosted runs), `ALLOWED_EXTENSION_IDS`.

Add:

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_POWER_MONTHLY=
STRIPE_PRICE_POWER_YEARLY=
ANTHROPIC_KEY_ENCRYPTION_SECRET=    # openssl rand -hex 32
ACCOUNT_URL=https://account.example.com
```

## Build order

1. **Schema** — `subscriptions` (free row on sign-up) and `user_secrets`.
2. **Plan quotas** — `/v1/me` and the run gateway enforce plan limits.
3. **Key vault** — encrypt/decrypt, `PUT/GET/DELETE /v1/me/anthropic-key`, validate with Anthropic.
4. **Run path** — session + BYOK uses the stored key. Extension stops persisting `byokKey`.
5. **Stripe** — Checkout, Portal, webhooks, past-due / cancel behavior.
6. **Dashboard** on `account.<domain>` — Google session, overview, billing, key form.
7. **Extension Settings** — plan, usage, key status, links to the dashboard; stay signed in.
8. **Marketing** — `upgradeFlow: "checkout"`, Checkout only after Google sign-in, `chromeStoreUrl` when the listing exists.

## Explicitly out of scope

- License keys, Firebase, email/password, Apple sign-in.
- Returning the Anthropic key to any client after it is saved.
- Storing the Anthropic key in Firebase, Firestore, or `chrome.storage`.
- Morphing, chat, or agent tools inside the dashboard.
- Team / seats billing.
