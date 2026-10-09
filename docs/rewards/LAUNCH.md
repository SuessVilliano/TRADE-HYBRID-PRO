# Member Rewards launch checklist

The foundation uses Club's existing Supabase identity. Rewards participation is not paid-gated. No token purchase is required. No automatic cash or token payout path is installed.

## Implemented
- /rewards: actual Club onboarding completion, Academy lesson completions, passed quizzes, issued credentials; achievement circle and milestone links.
- Community pilot: actual count of members with completed lessons; proposed 100-member goal; draft campaign with zero funded USDC/THC.
- /invite/:code: non-identifying random code; explicit acceptance after sign-in; direct referral attribution. One inviter per referred identity; self-referral rejected. A saved invite remains in sessionStorage until explicit acceptance. Existing authentication allows free account creation from the login form.
- Invite creation is idempotent. Referral acceptance is idempotent and does not award funds, change entitlements, or register a product purchase.
- Ledger keeps THC, USDC, credits, and perks separate; pending, approved, paid, reversed statuses. Token/cash paid entries require transaction evidence. Source event uniqueness prevents duplicate ingestion.
- Anonymous access denied. Members can read only their own private rows and cannot insert ledger rewards, qualify referrals, change campaign budgets, or mark payouts. Private aggregate helper publishes only the community count.

## Database
Supabase migration member_rewards_foundation applied to existing Club project. Source is schema.sql. security-tests.sql verifies ownership, self-referral denial, anonymous denial and restricted writes within a rolled-back transaction. No lasting test rewards or fake referrals are seeded.

## Before financial activation
1. Set actual campaign eligibility, caps, amounts, asset and treasury funding. A draft goal is not a payout commitment.
2. Link verified billing events to referred customers via trusted server processing; establish eligibility for genuine product demand, exclude self-dealing and duplicate identities, and wait for refund/chargeback clearance. Current rows stay awaiting_purchase until that processor exists.
3. Build atomic budget reservations and reversal events. Do not award from projected sales or unconfirmed deposits. Separate operating reserves, rewards treasury, Raydium liquidity, and Holdings capital.
4. Link a wallet using verified ownership signatures to canonical Club identity. Do not use a browser wallet connection alone as a payout destination assertion.
5. Add owner-reviewed distribution/claim execution with idempotency, transaction reconciliation and a kill switch. No service role in the browser.
6. Configure sponsor/community benefits and review promotion/referral terms before activating campaigns. No chance-based paid prize mechanism, downline, paid placement, or guaranteed returns.

## Verification and deployment
Production build, targeted TypeScript checks and three reward balance tests pass. Database isolation tests pass; all four reward tables have RLS. Advisor findings contain pre-existing trigger/auth warnings, none for the new rewards objects. Visual preview uses clearly labeled sample zero-state data; it is not an authenticated production screenshot.
Vercel deployment is blocked by the previously reported daily API deployment limit. Commit the complete source and deploy when quota permits; do not use alternative accounts or bypass limits. Database foundation is live; the new UI is not live until deployment succeeds.
