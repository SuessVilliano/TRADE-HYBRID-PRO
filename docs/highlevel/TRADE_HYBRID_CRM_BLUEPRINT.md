# Trade Hybrid — HighLevel CRM Automation Blueprint

## Ownership rule
HighLevel owns all member-facing automation:
- branded email
- SMS
- workflow timing
- pipeline stages
- reminders
- reactivation
- event follow-up
- Battle follow-up
- Academy nurture
- Funding follow-up
- reply tracking
- opens/clicks/replies
- appointment/onboarding reminders

Trade Hybrid Club/Supabase owns:
- authentication
- product entitlements
- onboarding answers
- WHY + goals
- product-access checklist
- Journal/Alerts/Trade House application data

The Club syncs facts into HighLevel; HighLevel decides what communication to send.

## Required HighLevel sender
Preferred:
- From name: Trade Hybrid Club
- From email: contact@tradehybrid.co

Fallback if this is the verified LC Email domain:
- contact@tradehybrid.club

Reply-to should be the same tracked HighLevel inbox.

Do not send lifecycle messages from a personal Gmail account.

## Custom fields
Create these in the Trade Hybrid subaccount:
- TH Club User ID
- TH Membership Tier
- TH Whop Membership ID
- TH Whop Plan ID
- TH WHY
- TH Primary Goal
- TH Markets
- TH Experience Level
- TH Onboarding Stage
- TH Onboarding Completed
- TH Onboarding Session Requested
- TH Product Access
- TH Journal Accessed
- TH Market Buddy Accessed
- TH Community Accessed
- TH Trade House Accessed
- TH Academy Accessed
- TH Funding Accessed
- TH Last Product Access
- TH Last Club Login
- TH Lifecycle Milestone
- TH Access Issue
- TH Battle Room ID
- TH Battle Last Result
- TH Funding Status

## Core tags
- TH | New Member
- TH | Paid Member
- TH | Free Member
- TH | Onboarding Incomplete
- TH | Onboarding Complete
- TH | Onboarding Requested
- TH | Access Issue
- TH | Activated
- TH | Engaged
- TH | At Risk
- TH | Battle Participant
- TH | Academy Active
- TH | Funding Interest
- TH | Event Attendee
- TH | Needs Human Follow-up

## Pipeline
Pipeline: Trade Hybrid Member Journey

Stages:
1. New Member
2. Access Setup
3. Onboarding Needed
4. Onboarding Scheduled
5. Activated
6. Engaged
7. Needs Attention
8. Retention / Expansion

## Workflow 1 — TH Club Member Lifecycle
Trigger:
- Tag added: TH | New Member
OR
- TH Club User ID becomes known

Actions:
1. Add to pipeline: New Member.
2. Send branded Welcome email immediately.
3. If phone is present and SMS consent/DND allows:
   Send Welcome SMS.
4. Set TH Lifecycle Milestone = Welcome.
5. Wait until 72 hours after membership start.
6. If onboarding incomplete OR any entitled product not accessed:
   - stage = Access Setup
   - send 72-hour checklist email
   - send access-check SMS
   - if TH Access Issue = true, create internal task for human follow-up.
7. Wait until Day 7.
8. Send Day-7 game-plan email.
9. If onboarding incomplete:
   - tag TH | Onboarding Incomplete
   - stage = Onboarding Needed.
10. Wait until Day 15.
11. Send Day-15 system-check email.
12. If low engagement:
   - tag TH | At Risk
   - create internal follow-up task.
13. Wait until Day 30.
14. Send Day-30 review email.
15. If engaged:
   - stage = Engaged
   - tag TH | Activated
16. If not engaged:
   - stage = Needs Attention
   - create human follow-up task.

## Workflow 2 — TH Access Rescue
Trigger:
- TH Access Issue = true
OR
- tag TH | Access Issue

Actions:
- create high-priority internal task
- send "we're fixing your access" email
- send SMS if allowed
- wait 1 business day
- if issue still true, escalate task
- remove tag when resolved

## Workflow 3 — TH Onboarding Session
Trigger:
- TH Onboarding Session Requested = true

Actions:
- send booking confirmation
- send appointment reminder 24h before
- send SMS reminder 2h before
- after appointment, set onboarding stage and send recap CTA

## Workflow 4 — TH Trade House Battles
Trigger:
- tag TH | Battle Participant
OR
- TH Battle Room ID updated

Actions:
- send Battle room instructions
- remind before scheduled Battle
- after Battle, send recap link and Journal reflection CTA
- update member journey based on participation
- if user is interested in funding, hand off to Funding workflow

## Workflow 5 — TH Academy
Trigger:
- Academy access granted
OR
- tag TH | Academy Active

Actions:
- welcome to learning path
- Day 3 first-module reminder if no activity
- weekly progress check
- Journal assignment reminder
- community/live-session CTA
- completion celebration

## Workflow 6 — TH Events
Trigger:
- event registration

Actions:
- confirmation email
- calendar/attendance instructions
- 24h email reminder
- 2h SMS reminder
- post-event recap
- route to relevant product/community follow-up

## Workflow 7 — TH Funding Interest
Trigger:
- tag TH | Funding Interest
OR
- TH Funding Status updated

Actions:
- send Hybrid Funding orientation
- direct to current public rules/products
- do not promise payouts or passing
- follow up on application/account status
- feed verified public-dashboard link into Trade House proof workflow when available

## Workflow 8 — TH Re-engagement
Trigger:
- no meaningful Club/product access for 14+ days

Actions:
- send "what are you trying to accomplish right now?" email
- SMS only if consent allows
- point back to WHY/game plan
- surface one relevant product, not the whole catalog
- after 30+ days inactive, create retention task

## SMS copy

### Welcome
Welcome to Trade Hybrid, {{contact.first_name}}. Your Club is ready: https://pro.tradehybrid.co/dashboard — start with your WHY/game plan, then confirm your Journal + Community access. Reply here if anything is missing.

### 72 hours
Quick Trade Hybrid access check: can you log in, open your subscribed tools, Journal, and Community? If anything is missing, reply ACCESS and we’ll get it fixed.

### Day 7
One week in: is Trade Hybrid helping your actual game plan yet? Review your Journal + plan here: https://pro.tradehybrid.co/dashboard

### Day 15
Day 15 check: tighten what you already have before adding more. Review your plan, Journal, alerts, and product access: https://pro.tradehybrid.co/dashboard

### Day 30
30 days in Trade Hybrid. What helped most, what are you not using, and what should your next 30 days focus on? Open your Club review: https://pro.tradehybrid.co/dashboard

## Branded email visual system
Use:
- background: #07101D
- card: #0B1424
- purple: #7C3AED
- blue: #2563EB
- cyan: #06B6D4
- text: #EAF2FF / #B9C9DC
- image/logo: https://tradehybrid.co/trade-hybrid-logo.png

Header structure:
- Trade Hybrid logo/image
- "TRADE HYBRID CLUB" eyebrow
- gradient purple → blue → cyan
- one clear headline
- one primary CTA
- checklist or member-context card
- tracked reply-to company inbox

## Tracking
HighLevel is the communication system of record:
- delivery
- open
- click
- reply
- SMS response
- appointment
- workflow stage
- internal task
- DND/consent

Supabase should store product/application state only and sync the relevant state to HighLevel.
