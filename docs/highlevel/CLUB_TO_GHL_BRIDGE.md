# Trade Hybrid Club → HighLevel CRM Bridge

## Environment contract
These server-only variables are required when the Trade Hybrid HighLevel subaccount is authorized:

- GHL_TRADEHYBRID_PIT
- GHL_TRADEHYBRID_LOCATION_ID

Optional:
- GHL_TRADEHYBRID_FROM_EMAIL
- GHL_TRADEHYBRID_FROM_NAME
- GHL_TRADEHYBRID_PRIMARY_PHONE

Never expose a PIT in VITE_* variables or browser code.

## Required scopes
The Trade Hybrid HighLevel private integration must be allowed to:
- read/create/update contacts
- read/write contact tags
- read/write contact custom fields
- read/write opportunities if pipeline tracking is used
- conversations/messages for tracked SMS/email if needed
- workflows/campaign enrollment or workflow-trigger resource if supported by the installed HighLevel API version
- calendars/appointments for onboarding sessions

## Sync events from Club to CRM
The Club should sync facts, not timing logic.

Events:
- member.created
- member.login
- onboarding.updated
- onboarding.completed
- onboarding.session_requested
- entitlement.updated
- product.accessed
- access.issue
- battle.joined
- battle.completed
- academy.activity
- funding.interest
- event.registered

Each sync must:
1. upsert/find the HighLevel contact by email
2. set TH Club User ID
3. update only Trade Hybrid custom fields/tags
4. let native HighLevel workflows perform waits, email, SMS, tasks, pipeline moves

## Safety
- Do not use the GoHighLevel employer/company location for Trade Hybrid.
- Do not use the Affiliate Manager/company PIT for this business.
- Only deploy writes after the connected location is positively identified as the Trade Hybrid subaccount.
