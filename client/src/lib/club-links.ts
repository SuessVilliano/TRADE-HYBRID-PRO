export type ClubLink = {
  label: string;
  href: string;
  external?: boolean;
};

const env = import.meta.env;

export const CLUB_LINKS = {
  home: '/',
  dashboard: '/dashboard',

  // Real Trade Hybrid products — do not fall back to legacy Pro pages.
  journal: env.VITE_JOURNAL_URL || 'https://hybridjournal.co',
  alerts: env.VITE_ALERTS_URL || 'https://hybridjournal.co',
  copy: env.VITE_COPY_URL || 'https://copy.tradehybrid.co',
  abatev: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  terminal: env.VITE_ABATEV_URL || 'https://abatev.tradehybrid.co',
  ai: '/market-buddy',
  zone: env.VITE_ZONE_URL || 'https://thehybridzone.club',
  battles: '/launch/tradehouse',
  tradehouseArena: '/launch/tradehouse',
  battlesProof: 'https://hybridfunding.co/tradehouse',
  funding: env.VITE_FUNDING_URL || 'https://hybridfunding.co',

  // Keep TV inside the Club shell, but source the real white-labelled channel.
  tv: '/tv',
  tvExternal: env.VITE_TV_URL || 'https://tv.tradehybrid.club',

  academy: env.VITE_ACADEMY_URL || '/learning-center',
  community: '/community',
  events: '/community',
  onboarding: '/onboarding',
  about: '/#about',
  profile: '/profile',
  settings: '/settings',
  hooks: '/settings?section=hooks',
  help: '/knowledge',
  login: '/login',
  register: '/register',
} as const;

export const isExternalClubLink = (href: string) => /^https?:\/\//i.test(href);
