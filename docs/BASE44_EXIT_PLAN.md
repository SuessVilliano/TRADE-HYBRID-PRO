# Trade Hybrid Base44 Exit Plan

## Objective

Keep the current Base44 applications live and usable while making Base44 replaceable.

The end state is:

- Trade Hybrid Club owns identity, membership, onboarding, and entitlements.
- GitHub is the canonical source-code backup for every product.
- Vercel is the portable web runtime.
- Supabase is the target shared data/auth/platform backend.
- Product domains and user-facing URLs do not have to change when a backend is replaced.
- No product requires a second Trade Hybrid password.

## Current application map

| Product | Base44 app ID | GitHub | Vercel shadow | Base44 backend footprint |
| --- | --- | --- | --- | ---: |
| Hybrid Journal | 69187cf652b563bcf02c499f | SuessVilliano/hybrid-journal | hybrid-journal | 48 entities, 69 functions, 10 workflows, 8 agents |
| Trade Hybrid Academy | 68eaff43139bc40398953c99 | SuessVilliano/trade-hybrid-academy | trade-hybrid-academy | 13 entities, 1 function |
| ABATEV | 691f85151d178990d90d5b5c | SuessVilliano/abatev2 | abatev | 12 entities, 9 functions, 2 workflows, 1 agent |
| Hybrid Copy | 69752c73c03ae9bc99eb8b6c | SuessVilliano/HybridCopy | hybrid-copy | 23 entities, 44 functions, 6 workflows, 2 agents |

The Base44 source and GitHub mirrors were spot-checked on the live apps and match for the primary app, auth, and package files.

## Architecture during transition

```text
Trade Hybrid Club
  ├─ identity / paid entitlement / onboarding
  ├─ product registry
  └─ app launch / SSO

GitHub
  └─ canonical product source backup

Vercel shadow runtimes
  ├─ Journal
  ├─ Academy
  ├─ ABATEV
  └─ Hybrid Copy

Base44 (temporary backend)
  ├─ entities
  ├─ functions
  ├─ workflows
  └─ agents

Supabase (target backend)
  ├─ shared identity + entitlement source
  ├─ Postgres / RLS
  ├─ edge/server functions
  └─ cross-product event/data layer
```

## Migration rules

1. Trade Hybrid Club is the identity authority. Do not add another standalone product password system.
2. Keep product URLs stable. Hosting and backend swaps should happen behind the existing product registry.
3. New UI code should call product/platform adapters instead of calling Base44 directly when practical.
4. Never pass long-lived auth credentials in query parameters.
5. Keep secrets server-side.
6. Migrate one backend capability at a time and verify parity before routing production traffic to it.
7. For trading/execution features, use paper/simulation verification before any live-routing cutover.
8. Preserve a rollback path until the Base44 version has been unused and stable for an agreed observation period.

## Recommended migration order

### Phase 0 — Portability foundation

- Keep Base44 production live.
- Keep GitHub mirrors current.
- Keep Vercel shadows buildable.
- Give each shadow deployment its Base44 app ID so it can temporarily use the existing backend.
- Make Trade Hybrid Club the central app registry and identity/entitlement gate.

### Phase 1 — Academy

Academy has the smallest backend footprint. Move its single Base44 function and 13 entities to Supabase first. Replace Base44 auth with Club identity. Validate lesson progress, certificates, XP, and admin functions.

### Phase 2 — ABATEV

Move the 12 entities and 9 server functions. Preserve execution boundaries and paper-test every order path. Keep broker/execution credentials server-side.

### Phase 3 — Hybrid Copy

Move the 23 entities and 44 functions in capability groups: connections, routing, risk controls, execution jobs, journal event delivery, then operational agents/workflows.

### Phase 4 — Hybrid Journal

Journal is the largest Base44 dependency and should move last. Migrate by bounded domains: user/profile/settings, journal/trades, signals, broker connections, plans, analytics/AI, event ingestion, then automation/agents.

## Cutover definition for each app

An app is ready to leave Base44 only when:

- GitHub main builds cleanly on Vercel.
- Club login opens the app without another password.
- Required data has been migrated or safely synchronized.
- Feature parity is verified against the Base44 version.
- Webhooks and cross-product events reach the new backend.
- Observability and rollback are available.
- The existing public domain can be pointed to the Vercel/Supabase implementation without changing user bookmarks.

## Cost strategy

Do not cancel Base44 globally. Retire it per app.

The first meaningful Base44 cost reduction should come after Academy is fully native. Then retire ABATEV, then Hybrid Copy, and keep Journal until its heavier backend has been migrated and verified.
