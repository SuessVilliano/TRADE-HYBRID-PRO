export type ClubPlanKey = 'monthly' | 'yearly' | 'lifetime' | 'pro_lifetime';

export type ClubPlan = {
  key: ClubPlanKey;
  name: string;
  price: string;
  billing: string;
  checkout: string;
  description: string;
};

export type ClubProduct = {
  key: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  destination: string;
  public: boolean;
  plans: ClubPlanKey[];
  features: string[];
};

export const CLUB_PLANS: ClubPlan[] = [
  {
    key: 'monthly',
    name: 'Monthly',
    price: '$97',
    billing: 'per month',
    checkout: 'https://whop.com/checkout/1TIvb4zqrWODtRq69r-8xj0-51pd-UkLn-GwSXx18tPbZx/',
    description: 'Core Trade Hybrid Club access.',
  },
  {
    key: 'yearly',
    name: 'Yearly',
    price: '$597',
    billing: 'per year',
    checkout: 'https://whop.com/checkout/5sIJaH2cjV5tQsOoBX-eJnb-QHqG-OP9q-5z9KmBGnaxrB/',
    description: 'Adds the trader record and competition layer.',
  },
  {
    key: 'lifetime',
    name: 'Lifetime',
    price: '$1,497',
    billing: 'one time',
    checkout: 'https://whop.com/checkout/1SOuliJDFuPJPEFUPL-a4l7-4NwZ-nnVs-9Z8gADiIFnS0/',
    description: 'Adds execution-routing products without recurring Club dues.',
  },
  {
    key: 'pro_lifetime',
    name: 'Pro Lifetime',
    price: '$4,997',
    billing: 'one time',
    checkout: 'https://whop.com/checkout/plan_hcBFS8A0XQZBi/?d2c=true',
    description: 'Full ecosystem access including the advanced terminal layer.',
  },
];

export const CLUB_PRODUCTS: ClubProduct[] = [
  {
    key: 'community',
    slug: 'community',
    name: 'Trade Hybrid Community',
    category: 'Community',
    summary: 'The member network for accountability, discussion, events, sessions and Club updates.',
    destination: '/community',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Member community', 'Live discussion', 'Events and accountability', 'Club announcements'],
  },
  {
    key: 'ai',
    slug: 'market-buddy',
    name: 'Market Buddy AI',
    category: 'AI',
    summary: 'One Trade Hybrid AI companion grounded in the member journey, goals, Journal context and connected activity.',
    destination: '/market-buddy',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Game-plan context', 'Mindset and planning', 'Strategy research', 'Risk and process support'],
  },
  {
    key: 'tv',
    slug: 'trade-hybrid-tv',
    name: 'Trade Hybrid TV',
    category: 'Media',
    summary: 'The white-labelled home for live Trade Hybrid programming, battles, weekly shows and on-demand content.',
    destination: '/tv',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Live channel', 'Weekly programming', 'Battle broadcasts', 'Member media hub'],
  },
  {
    key: 'academy',
    slug: 'academy',
    name: 'Trade Hybrid Academy',
    category: 'Education',
    summary: 'Structured learning paths that will grow into the complete way to learn the Trade Hybrid process.',
    destination: '/learning-center',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Learning paths', 'Member lessons', 'Live sessions', 'Practice and progress'],
  },
  {
    key: 'tools',
    slug: 'trading-tools',
    name: 'Trading Tools',
    category: 'Tools',
    summary: 'Member research surfaces, indicators, utilities and analysis tools.',
    destination: '/trading-tools',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Member utilities', 'Indicators and analysis', 'Research workspace', 'Connected Club access'],
  },
  {
    key: 'journal',
    slug: 'hybrid-journal',
    name: 'Hybrid Journal',
    category: 'Journal',
    summary: 'The source of truth for trades, notes, review, reports and the trader’s long-term record.',
    destination: 'https://hybridjournal.co',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Trade journaling', 'Performance review', 'Reports and notes', 'Connected alert history'],
  },
  {
    key: 'alerts',
    slug: 'hybrid-alerts',
    name: 'Hybrid Alerts',
    category: 'Signals',
    summary: 'Persistent alerts and signals feeding the Journal and reporting layer instead of disappearing in a browser tab.',
    destination: 'https://hybridjournal.co',
    public: false,
    plans: ['monthly','yearly','lifetime','pro_lifetime'],
    features: ['Persistent signal intake', 'Webhook alerts', 'History and reporting', 'Journal integration'],
  },
  {
    key: 'battles',
    slug: 'trade-house',
    name: 'Trade House Battles',
    category: 'Competition',
    summary: 'Practice battles, verified competition, live rooms, leaderboards, cameras and broadcast production.',
    destination: '/launch/tradehouse',
    public: false,
    plans: ['yearly','lifetime','pro_lifetime'],
    features: ['Practice rooms', 'Verified proof', 'LiveKit video and screen share', 'Producer + OBS tools'],
  },
  {
    key: 'copy',
    slug: 'hybrid-copy',
    name: 'Hybrid Copy',
    category: 'Execution',
    summary: 'The copy and routing layer for supported account relationships, risk controls and signal-to-execution workflows.',
    destination: 'https://copy.tradehybrid.co',
    public: false,
    plans: ['lifetime','pro_lifetime'],
    features: ['Copy relationships', 'Routing workflows', 'Risk controls', 'Execution logging'],
  },
  {
    key: 'zone',
    slug: 'hybrid-zone',
    name: 'Hybrid Zone',
    category: 'Automation',
    summary: 'The control layer connecting supported services and execution workflows across the ecosystem.',
    destination: 'https://hybridzone-v2.onrender.com',
    public: false,
    plans: ['lifetime','pro_lifetime'],
    features: ['Connected execution layer', 'Automation control', 'Service routing', 'Trade Hybrid integrations'],
  },
  {
    key: 'terminal',
    slug: 'abatev-terminal',
    name: 'ABATEV Terminal',
    category: 'Terminal',
    summary: 'The trading cockpit that can grow into Trade Hybrid’s broker-agnostic terminal and execution surface.',
    destination: 'https://abatev.tradehybrid.co',
    public: false,
    plans: ['pro_lifetime'],
    features: ['Trading cockpit', 'Connected market tools', 'Automation controls', 'Future broker-agnostic execution'],
  },
  {
    key: 'funding',
    slug: 'hybrid-funding',
    name: 'Hybrid Funding',
    category: 'Funding',
    summary: 'Funding products plus the verified public-dashboard proof source used by supported Trade House competitions.',
    destination: 'https://hybridfunding.co',
    public: true,
    plans: [],
    features: ['Funding products', 'Public dashboard proof', 'Trade House connection', 'Separate funding terms'],
  },
];

export function getClubProduct(slugOrKey: string | undefined) {
  return CLUB_PRODUCTS.find((product) => product.slug === slugOrKey || product.key === slugOrKey);
}

export function plansForProduct(product: ClubProduct) {
  return CLUB_PLANS.filter((plan) => product.plans.includes(plan.key));
}

const PLAN_RANK: Record<ClubPlanKey, number> = {
  monthly: 1,
  yearly: 2,
  lifetime: 3,
  pro_lifetime: 4,
};

function activePlanFromEntitlements(entitlements: any[]): ClubPlanKey | null {
  const keys = new Set(
    entitlements
      .filter((item: any) => item?.status === 'active' || !item?.status)
      .map((item: any) => String(item?.product_key || '')),
  );

  if (keys.has('plan_pro_lifetime')) return 'pro_lifetime';
  if (keys.has('plan_lifetime')) return 'lifetime';
  if (keys.has('plan_yearly')) return 'yearly';
  if (keys.has('plan_monthly') || keys.has('club_paid')) return 'monthly';
  return null;
}

export function userHasProductAccess(user: any, product: ClubProduct) {
  if (product.public) return true;
  if (!user) return false;
  if (user.isAdmin || user.membershipLevel === 'demo') return true;

  const active = Array.isArray(user.entitlements) ? user.entitlements : [];

  if (active.some((item: any) => item?.product_key === product.key && item?.status !== 'inactive')) {
    return true;
  }

  const plan = activePlanFromEntitlements(active);
  if (!plan) return false;

  return product.plans.some((allowedPlan) => PLAN_RANK[plan] >= PLAN_RANK[allowedPlan]);
}
