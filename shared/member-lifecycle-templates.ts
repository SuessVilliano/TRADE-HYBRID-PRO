export type LifecycleTemplateContext = {
  firstName?: string;
  username?: string;
  loginUrl?: string;
  onboardingUrl?: string;
  dashboardUrl?: string;
  journalUrl?: string;
  communityUrl?: string;
  bookingUrl?: string;
  entitledProducts?: string[];
  whyText?: string;
  primaryGoal?: string;
};

const fallback = {
  loginUrl: 'https://pro.tradehybrid.co/login',
  onboardingUrl: 'https://pro.tradehybrid.co/onboarding',
  dashboardUrl: 'https://pro.tradehybrid.co/dashboard',
  journalUrl: 'https://pro.tradehybrid.co/journal',
  communityUrl: 'https://pro.tradehybrid.co/community',
};

function hello(ctx: LifecycleTemplateContext) {
  return ctx.firstName || ctx.username || 'Trader';
}

function products(ctx: LifecycleTemplateContext) {
  const items = ctx.entitledProducts?.length ? ctx.entitledProducts : ['Trade Hybrid Club'];
  return items.map((item) => `• ${item}`).join('\n');
}

export const MEMBER_LIFECYCLE_TEMPLATES = {
  club_welcome: (ctx: LifecycleTemplateContext) => ({
    subject: 'Welcome to Trade Hybrid Club — your access is ready',
    text: `Hey ${hello(ctx)},

Welcome to Trade Hybrid Club.

Your login is the front door for your Trade Hybrid access:
${ctx.loginUrl || fallback.loginUrl}

Your current access:
${products(ctx)}

Start here:
1. Sign in and make sure your account opens correctly.
2. Complete your personal onboarding so we understand your WHY, goals, markets, and game plan:
${ctx.onboardingUrl || fallback.onboardingUrl}
3. Open your Journal and confirm your workspace:
${ctx.journalUrl || fallback.journalUrl}
4. Enter the Community:
${ctx.communityUrl || fallback.communityUrl}

If you want help getting everything connected, schedule an onboarding session:
${ctx.bookingUrl || 'Book from your onboarding checklist inside the Club.'}

The goal is not to give you more tabs. It is to make sure the tools you have actually support the trader you are trying to become.

— Trade Hybrid Club`,
  }),

  club_72h_checklist: (ctx: LifecycleTemplateContext) => ({
    subject: '72-hour check: can you access everything you joined for?',
    text: `Hey ${hello(ctx)},

You are about 72 hours into Trade Hybrid Club. This check is simple: make sure nothing you subscribed to is sitting unused because access was confusing.

Open your dashboard:
${ctx.dashboardUrl || fallback.dashboardUrl}

72-hour checklist:
□ You can sign in without issues
□ Your subscribed products show up
□ You opened Hybrid Journal
□ Your connected alerts are reaching the Journal workflow
□ You entered the Community
□ You completed your WHY + game plan
□ You know where to get help
□ You booked an onboarding session if you want one

Your current access:
${products(ctx)}

If anything is missing, reply to this email or use the Club help path. We would rather fix access now than find out in 30 days that you never got plugged in.

— Trade Hybrid Club`,
  }),

  club_7d_followup: (ctx: LifecycleTemplateContext) => ({
    subject: 'Your first week: are the tools actually helping your plan?',
    text: `Hey ${hello(ctx)},

One week in, we care less about whether you clicked every button and more about whether Trade Hybrid is helping your actual plan.

Your WHY:
${ctx.whyText || 'Open your onboarding profile and write this down.'}

Your primary goal:
${ctx.primaryGoal || 'Open your onboarding profile and choose the main outcome you are working toward.'}

This week:
• Make at least one meaningful Journal entry.
• Review which alerts or setups deserve your attention.
• Ask one question in the Community.
• Use your AI around your actual plan—not random market noise.
• Remove friction from anything you keep avoiding.

Open your dashboard:
${ctx.dashboardUrl || fallback.dashboardUrl}

If your plan changed, update it. Your journey should change with you.

— Trade Hybrid Club`,
  }),

  club_15d_followup: (ctx: LifecycleTemplateContext) => ({
    subject: 'Day 15: tighten the system before adding more',
    text: `Hey ${hello(ctx)},

You are halfway through your first 30 days.

Before adding another strategy, market, tool, or subscription, check what is already working.

Ask yourself:
• What am I using consistently?
• What am I paying for but not using?
• Is my Journal showing a repeatable pattern?
• Are alerts helping me wait for setups—or making me react more?
• Have I connected with the Community?
• Is my weekly schedule realistic?

Return to your game plan:
${ctx.onboardingUrl || fallback.onboardingUrl}

Then use Trade Hybrid AI with that context to decide the next best move.

— Trade Hybrid Club`,
  }),

  club_30d_followup: (ctx: LifecycleTemplateContext) => ({
    subject: '30-day review: build your next Trade Hybrid game plan',
    text: `Hey ${hello(ctx)},

You made it through your first 30 days.

Now the Club should be able to answer a better question than “what features do we have?”

It should answer: “what should YOU do next?”

Run your 30-day review:
1. Re-read your WHY.
2. Compare your 30-day goal with what actually happened.
3. Review your Journal and access history.
4. Identify the products you use most.
5. Identify what you still have not activated.
6. Update your 90-day target.
7. Ask your AI to turn that into the next practical plan.

Dashboard:
${ctx.dashboardUrl || fallback.dashboardUrl}

Community:
${ctx.communityUrl || fallback.communityUrl}

The goal is for your second month to be more focused than your first—not busier.

— Trade Hybrid Club`,
  }),
} as const;

export type MemberLifecycleTemplateKey = keyof typeof MEMBER_LIFECYCLE_TEMPLATES;
