# Trade Hybrid Club identity and entitlement contract

Trade Hybrid Club is the identity hub. Standalone products keep their own UI and deployment, but they do not create a second password account.

## Environment variables

Set these server-side in the Club project and in each participating app:

- `WHOP_API_KEY`: Whop API key. Never expose it to browser code.
- `WHOP_WEBHOOK_SECRET`: the `ws_` signing secret from the Club Whop webhook.
- `TH_SSO_SECRET`: a new high-entropy shared secret used only for Club SSO ticket signing.
- `DATABASE_URL`: the Club users database.

## Whop webhook

Whop sends signed Standard Webhooks events to:

`https://pro.tradehybrid.co/api/billing/whop/webhook`

The receiver verifies the raw body, timestamp, and signature before processing. It currently applies:

- `payment.succeeded` → paid entitlement
- `membership.activated` → paid entitlement
- `membership.deactivated` → free entitlement

All other subscribed events are acknowledged without changing access, so broad initial event selection is safe while testing. Delivery handlers must remain idempotent.

## SSO handoff

1. A signed-in Club browser requests `GET /api/sso/ticket?return_to=<approved-app-url>`.
2. The Club returns a short-lived ticket (120 seconds).
3. The target app sends the ticket server-to-server to `POST /api/sso/exchange`.
4. The Club returns the user identity and current membership level.
5. The target app creates its local session.

The ticket is single-use, signed with `TH_SSO_SECRET`, audience-bound to an allowlisted origin, and never contains a password.

## App integration rule

The Journal, Battles, ABATEV, Copy, TV, Hybrid Zone, and future apps should accept a Club SSO ticket or start a Club login redirect. They should not ask the user to create a second password account. The Club database remains the source of truth for Whop access and product entitlements.
