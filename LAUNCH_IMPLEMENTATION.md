# Morphic landing and account site release notes

Updated 2026-11-20. The landing and account site is implemented and tested with the companion Chrome extension and API. The public launch still needs publisher configuration and acceptance against the deployed services. See the [cross-repository release runbook](../morphic/LAUNCH_IMPLEMENTATION.md) for the release order, test results, coupon administration, restore drill and outstanding gates.

## Consumer journey

- The desktop install button opens the configured Chrome Web Store listing. Visitors on mobile can copy its link. First installation opens `/welcome` with pinning, sign-in and first-run instructions.
- A new user signs in with Google. The account website can ask for its own sign-in. Choosing the same Google account resolves to the same user and saved command history.
- Pricing and billing read the backend's verified catalog. The side panel starts checkout for its signed-in user and Stripe collects the card. The neutral `/billing/return` page guides people back to the panel. The account website confirms payment through server-verified subscription state and provides a link to the billing portal.
- Testing access can be redeemed in the panel or at `/account/billing`. A publisher provisions `TESTING123` in the chosen API database. Redemption grants eligible users time-limited hosted Pro access without a card or personal API key. The backend owns the grant, limits and expiry.
- At `/account/history`, users can read and delete conversations. At `/account/data` they can download their history or request account deletion. Downloads stream original commands, visible messages, request IDs, conversation and login session IDs, user IDs and outcomes. Sign-in, the FAQ and welcome explain cloud conversation storage.

## Verification and release inputs

The site typecheck and production build passed. A Chromium test built the website and exercised first-install welcome, tester redemption, saved history, download, deletion, side-panel checkout and the billing portal across both repositories. It checked command and reply ownership directly in an isolated PostgreSQL schema. The journey used an unpacked extension, local sign-in and simulated model and Stripe responses.

Configure `MORPHIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CHROME_STORE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL` and `NEXT_PUBLIC_LEGAL_ENTITY` from [.env.example](.env.example). Publish reviewed content at `/privacy` and `/terms` or configure `MORPHIC_PRIVACY_POLICY_URL` and `MORPHIC_TERMS_URL`. Enable `NEXT_PUBLIC_PAID_PLANS_ENABLED` when opening paid acquisition. Public variables take effect at build time.

```bash
npm ci
npm run typecheck
npm run preflight
npm run build
```

Preflight rejects this checkout's missing deployment URLs, support details, legal identity and preview policies. Run it against the target configuration before inviting consumers. Verify the actual Chrome listing, Google consent, payment, portal card update and cancellation on the deployed stack.
