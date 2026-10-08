export type ClubLink = {
  label: string;
  href: string;
  external?: boolean;
};

const env = import.meta.env;

export const CLUB_LINKS = {
  home: '/',
  dashboard: '/dashboard',

  // Daily operating system
  signals: env.VITE_SIGNALS_URL || '/signals',
  markets: '/trading-tools',
  ai: '/market-buddy',
  onboarding: '/onboarding',
  community: '/community',
  academy: env.VITE_ACADEMY_URL || '/learning-center',
  battles: '/launch/tradehouse',
  tradehouseArena: '/launch/tradehouse',
  battlesProof: 'https://hybridfunding.co/tradehouse',
  funding: env.VITE_FUNDING_URL || 'https://hybridfunding.co',

  // Specialist Trade Hybrid products. The Club routes into these instead of
  // duplicating their functionality inside Pro.
  journal: env.VITE_JOURNAL_URL || 'https://hybridjournal.co',
  alerts: env.VITE_ALERTS_URL || 'https://hybridjournal.co',
  copy: env.VITE_COPY_URL || 'https://copy.tradehybrid.co',
  abatev: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  terminal: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  zone: '/launch/zone',
  zoneDirect: env.VITE_ZONE_URL || 'https://thehybridzone.club',

  // Culture / acquisition products
  publicSite: 'https://tradehybrid.co',
  coin: 'https://tradehybrid.co/coin',
  runner: 'https://tradehybrid.co/runner',
  music: 'https://tradehybrid.co/music',

  // Keep TV inside the Club shell, sourcing the real channel.
  tv: '/tv',
  tvExternal: env.VITE_TV_URL || 'https://tv.tradehybrid.club',

  events: '/community',
  about: 'https://tradehybrid.co/#about',
  profile: '/profile',
  settings: '/settings',
  hooks: '/settings?section=hooks',
  connections: '/connections',
  help: '/knowledge',
  login: '/login',
  register: '/register',
  checkoutComplete: '/checkout/complete',
} as const;

export const isExternalClubLink = (href: string) => /^https?:\/\//i.test(href);
