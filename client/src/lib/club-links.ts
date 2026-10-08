export type ClubLink = {
  label: string;
  href: string;
  external?: boolean;
};

const env = import.meta.env;

export const CLUB_LINKS = {
  home: '/',
  dashboard: '/dashboard',
  publicSite: env.VITE_PUBLIC_SITE_URL || 'https://tradehybrid.co',

  // Daily Trade Hybrid OS flow.
  signals: env.VITE_SIGNALS_URL || '/signals',
  markets: '/trading-tools',
  journal: env.VITE_JOURNAL_URL || 'https://hybridjournal.co',
  alerts: env.VITE_ALERTS_URL || 'https://alerts.tradehybrid.co',
  copy: env.VITE_COPY_URL || 'https://copy.tradehybrid.co',
  abatev: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  terminal: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  ai: '/market-buddy',

  // Immersive world and growth paths.
  zone: env.VITE_ZONE_URL || 'https://thehybridzone.club',
  battles: '/launch/tradehouse',
  tradehouseArena: '/launch/tradehouse',
  battlesProof: 'https://hybridfunding.co/tradehouse',
  funding: env.VITE_FUNDING_URL || 'https://hybridfunding.co',
  academy: env.VITE_ACADEMY_URL || 'https://academy.tradehybrid.co',
  community: '/community',
  events: '/community',

  // Culture / acquisition products.
  coin: 'https://tradehybrid.co/coin',
  runner: 'https://sqr.co/HybridRunnerGame/',
  music: 'https://tradehybrid.co/music',

  // Keep TV inside the Club shell, but source the real white-labelled channel.
  tv: '/tv',
  news: 'https://news.tradehybrid.co',
  tvExternal: env.VITE_TV_URL || 'https://tv.tradehybrid.club',

  onboarding: '/onboarding',
  about: '/#about',
  profile: '/profile',
  settings: '/settings',
  connections: '/connections',
  hooks: '/connections',
  help: '/knowledge',
  login: '/login',
  register: '/register',
} as const;

export const isExternalClubLink = (href: string) => /^https?:\/\//i.test(href);
