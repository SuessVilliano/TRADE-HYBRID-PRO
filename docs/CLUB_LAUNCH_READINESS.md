# Trade Hybrid Club — Launch Readiness Gate

Owner: Trade Hybrid Club. Tracking: #26. This checklist is an implementation contract, **not proof of a successful live test**.

## Release hold
**HOLD:** Do not activate public live checkout, pre-signup marketing, or unrestricted free coupon redemption until separately approved. Build and test non-public flows now. Do not issue a real coupon or send messages to customers without authorization.

## Architecture source of truth
- Club: identity, entitlements, member profile, onboarding, product registry.
- Whop: payment and active membership events; signed webhook `/api/billing/whop/webhook`.
- HighLevel: lifecycle communication **only in Trade Hybrid-owned subaccount**, not employer account.
- Existing products retain independent deployments during integration: community, Journal, Academy, TV, Hybrid Zone, Coin, Hybrid Copy, Battles, ABATEV.
- No second password; SSO uses single-use, audience-bound, 120-second ticket exchange.
- Base44 migration follows `docs/BASE44_EXIT_PLAN.md`; do not replace backend before parity and rollback.
- Never grant trading/broker execution privileges through membership SSO alone.

## Non-public E2E test matrix
| Scenario | Expected | Status |
|---|---|---|
| Homepage → offer → checkout link | Correct plan and return URL | NOT TESTED |
| 100%-off restricted test purchase | Valid active membership; no charge | NOT TESTED |
| Whop signed activation webhook | Idempotent entitlement update | NOT TESTED |
| Invalid webhook signature | Rejected; no entitlement | NOT TESTED |
| First sign-in | Club session, no duplicate account | NOT TESTED |
| Welcome video + onboarding | Progress persists server-side | NOT TESTED |
| Community launch | Access according to entitlements | NOT TESTED |
| Journal launch | Single sign-on and correct user data | NOT TESTED |
| Academy launch | Progress preserved | NOT TESTED |
| TV/Zone/Coin launch | Correct navigation and access | NOT TESTED |
| Hybrid Copy launch | Feature gating; paper mode only | NOT TESTED |
| Expired/cancelled membership | Access revoked promptly | NOT TESTED |
| CRM welcome email | Correct Trade Hybrid test contact and delivery | NOT TESTED |
| iPhone Safari + desktop | Responsive; no blank page | NOT TESTED |
| Light theme default | Works; preference persists; reduced motion | NOT TESTED |

## Operational rules
1. Discover the real deployment, plan IDs, and domain routes; never guess URLs or coupon codes.
2. Verify environment variables by **presence only**, never print secrets.
3. Use isolated test members and email inboxes. Keep test records labeled.
4. Every verified row needs timestamp, URL, test account identifier (redacted), screenshot/log link, and result.
5. For each failure create a reproducible issue, a focused PR, and rollback instructions.
6. Treat inaccessible services as BLOCKED, never PASS.
7. No customer blast, production entitlement migration, or live trading execution in this phase.

## Next implementation sequence
1. Vercel domain/project inventory and build/deploy health.
2. Club routes, theme, onboarding and product registry audit.
3. Whop API/event verification and non-public test offer feasibility.
4. Product-by-product SSO contract tests.
5. HighLevel subaccount verification and test-contact automation.
6. Automated smoke suite, screenshots, and go/no-go report.
