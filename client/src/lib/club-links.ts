export type ClubLink = {
  label: string;
  href: string;
  external?: boolean;
};

const env = import.meta.env;

export const CLUB_LINKS = {
  home: '/',
  dashboard: '/dashboard',
  journal: env.VITE_JOURNAL_URL || '/journal',
  alerts: env.VITE_ALERTS_URL || '/journal',
  battles: env.VITE_BATTLES_URL || 'https://battles.tradehybrid.co',
  funding: env.VITE_FUNDING_URL || 'https://hybridfunding.co',
  ai: env.VITE_ABATEV_URL || '/ai-assistant',
  academy: env.VITE_ACADEMY_URL || '/learning-center',
  copy: env.VITE_COPY_URL || '/copy-trading',
  tv: env.VITE_TV_URL || '/live-stream',
  events: env.VITE_EVENTS_URL || '/events',
  profile: '/profile',
  settings: '/settings',
  help: '/knowledge',
  login: '/login',
  register: '/register',
} as const;

export const isExternalClubLink = (href: string) => /^https?:\/\//i.test(href);
