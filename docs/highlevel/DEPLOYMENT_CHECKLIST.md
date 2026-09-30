# Trade Hybrid HighLevel Deployment Checklist

## Blocker
Current ChatGPT HighLevel connector returns IAM/scope 401 for both linked HighLevel authorizations. Do not use the employer/affiliate company location as a workaround.

## When Trade Hybrid subaccount access is restored
1. Confirm location name is Trade Hybrid.
2. Confirm verified LC Email sending domain:
   - tradehybrid.co OR
   - tradehybrid.club
3. Create tracked company inbox:
   - contact@verified-domain
4. Create custom fields from TRADE_HYBRID_CRM_BLUEPRINT.md.
5. Create tags.
6. Create Trade Hybrid Member Journey pipeline.
7. Build the 8 native workflows.
8. Paste the 5 branded email HTML templates.
9. Add the SMS actions.
10. Connect onboarding calendar.
11. Verify DND/consent branching before SMS.
12. Create internal tasks for Access Issue / At Risk.
13. Add Club→HighLevel sync credentials:
   - GHL_TRADEHYBRID_PIT
   - GHL_TRADEHYBRID_LOCATION_ID
14. Test with one internal member.
15. Confirm email delivery, click, reply, SMS response, pipeline movement, and task creation.
16. Only then enable the production triggers.

## Do not use
- personal Gmail for production lifecycle automation
- GoHighLevel employer/affiliate location
- a generic/shared PIT whose location cannot be positively identified
