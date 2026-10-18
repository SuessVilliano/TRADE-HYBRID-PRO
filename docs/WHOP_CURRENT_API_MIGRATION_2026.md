# Whop Current API migration runbook (October 2026)

Reference: https://docs.whop.com/developer/api/migrate-from-v2

## Status
- Production project: Vercel `trade-hybrid-pro`, domain `pro.tradehybrid.co`.
- Existing production secrets: `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `TH_SSO_SECRET` (existence confirmed; values not accessed).
- Existing webhook receiver: `/api/billing/whop/webhook`.
- Legacy OAuth calls: `https://data.whop.com/oauth/token` and `https://data.whop.com/api/v2/me`; investigate separately from account API routes.
- OAuth error fallback removed in this branch. Do not restore demo login in production.
- **NOT READY FOR PRODUCTION:** current API calls, webhooks and regression tests still need implementation and verification.

## Migration checklist
- [ ] Inventory all `data.whop.com`, `api.whop.com/api/v2`, `/v2`, legacy SDK calls, and all webhook handlers across this repo.
- [ ] Confirm current Whop OAuth/userinfo documentation and supported redirect URI before changing login.
- [ ] Move account API calls to official `@whop/sdk` or `https://api.whop.com/api/v1` with a pinned `Api-Version-Date`. Reuse existing account API key; verify permissions with read-only requests.
- [ ] Map plans to variants, access passes to products, checkout sessions to checkout configurations, and v2 pagination to cursor pagination.
- [ ] Keep persisted Whop IDs and existing user entitlement mappings intact. Never overwrite active paid entitlements with a transient API error.
- [ ] Prepare separate new-format webhook endpoint/subscription, preserving legacy receiver during overlap.
- [ ] Validate raw-body webhook signatures, timestamp freshness, duplicate event IDs and event ordering.
- [ ] Handle payment, membership activation/deactivation, cancellation, renewal and refund transitions with idempotent state changes.
- [ ] Confirm whether cancelled-at-period-end memberships retain access until expiry; never revoke prematurely.
- [ ] Test sandbox/new webhook events, existing member sign-in, checkout, renewal, failed payment, cancellation, refund, SSO and retries.
- [ ] Compare existing membership counts and entitlement levels before/after backfill.
- [ ] Deploy preview, then production with rollback plan; verify live webhook deliveries before retiring old webhook.
- [ ] Re-scan code and runtime logs for deprecated API responses before November 13, 2026.

## Operator actions
Do **not** rotate the September 28 account API key solely for this migration. A new-format webhook subscription may issue a different signing secret; store it as a separate sensitive Vercel environment variable during overlap, not by prematurely overwriting the legacy secret. Do not create the new webhook until its handler is deployed and tested.
