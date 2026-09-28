import React, { createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  CircleUserRound,
  Copy,
  ExternalLink,
  Home,
  Radio,
  Settings,
  Trophy,
  Users,
  WalletCards,
  X,
  Zap,
  CalendarDays,
  Info,
  Network,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Separator } from './separator';
import { useAuth } from '@/lib/context/AuthContext';
import { CLUB_LINKS, isExternalClubLink } from '@/lib/club-links';

interface NavItemContextType {
  onNavItemClick?: () => void;
}

const NavItemContext = createContext<NavItemContextType>({});

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  external?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  active = false,
  external = isExternalClubLink(href),
}) => {
  const { onNavItemClick } = useContext(NavItemContext);
  const className = cn(
    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
    active
      ? 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200 dark:bg-cyan-300/10 dark:text-cyan-200 dark:ring-cyan-300/25'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
  );

  const body = (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-white/[0.05]">{icon}</span>
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="h-3.5 w-3.5 text-slate-500" />}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onNavItemClick}
      >
        {body}
      </a>
    );
  }

  return (
    <Link to={href} className={className} onClick={onNavItemClick}>
      {body}
    </Link>
  );
};

export const MainSidebar: React.FC<{
  onClose?: () => void;
  mobile?: boolean;
  className?: string;
  onNavItemClick?: () => void;
}> = ({
  onClose,
  mobile = false,
  className = '',
  onNavItemClick,
}) => {
  const { pathname } = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const isActive = (href: string) =>
    !isExternalClubLink(href) &&
    (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  const primary = [
    {
      label: isAuthenticated ? 'Club Dashboard' : 'Club Home',
      href: isAuthenticated ? CLUB_LINKS.dashboard : CLUB_LINKS.home,
      icon: <Home className="h-4 w-4" />,
    },
    { label: 'Hybrid Journal', href: CLUB_LINKS.journal, icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Community', href: CLUB_LINKS.community, icon: <Users className="h-4 w-4" /> },
    { label: 'Your Game Plan', href: CLUB_LINKS.onboarding, icon: <Zap className="h-4 w-4" /> },
    { label: 'Trade House Battles', href: CLUB_LINKS.battles, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Hybrid Funding', href: CLUB_LINKS.funding, icon: <WalletCards className="h-4 w-4" /> },
  ];

  const build = [
    { label: 'ABATEV', href: CLUB_LINKS.abatev, icon: <Bot className="h-4 w-4" /> },
    { label: 'Hybrid Copy', href: CLUB_LINKS.copy, icon: <Copy className="h-4 w-4" /> },
    { label: 'Hybrid Zone', href: CLUB_LINKS.zone, icon: <Network className="h-4 w-4" /> },
    { label: 'Hybrid TV', href: CLUB_LINKS.tv, icon: <Radio className="h-4 w-4" /> },
    { label: 'Academy', href: CLUB_LINKS.academy, icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Webhooks & Alerts', href: CLUB_LINKS.hooks, icon: <Workflow className="h-4 w-4" /> },
    { label: 'About Us', href: CLUB_LINKS.about, icon: <Info className="h-4 w-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    onNavItemClick?.();
  };

  return (
    <NavItemContext.Provider value={{ onNavItemClick }}>
      <aside
        className={cn(
          'flex h-full flex-col border-r border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#060a14] dark:text-white',
          mobile ? 'w-full' : 'w-72',
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <Link to={CLUB_LINKS.home} className="flex items-center gap-3" onClick={onNavItemClick}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
              <Zap className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.18em]">TRADE HYBRID</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Club</span>
            </span>
          </Link>
          {mobile && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 dark:text-slate-300">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Separator className="bg-slate-200 dark:bg-white/10" />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Club
          </p>
          <div className="space-y-1">
            {primary.map((item) => (
              <NavItem key={item.label} {...item} active={isActive(item.href)} />
            ))}
          </div>

          <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Tools & access
          </p>
          <div className="space-y-1">
            {build.map((item) => (
              <NavItem key={item.label} {...item} active={isActive(item.href)} />
            ))}
          </div>

          {isAuthenticated && (
            <>
              <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Account
              </p>
              <div className="space-y-1">
                <NavItem
                  label="Profile"
                  href={CLUB_LINKS.profile}
                  icon={<CircleUserRound className="h-4 w-4" />}
                  active={isActive(CLUB_LINKS.profile)}
                />
                <NavItem
                  label="Settings"
                  href={CLUB_LINKS.settings}
                  icon={<Settings className="h-4 w-4" />}
                  active={isActive(CLUB_LINKS.settings)}
                />
              </div>
            </>
          )}
        </div>

        <Separator className="bg-slate-200 dark:bg-white/10" />

        <div className="p-4">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="truncate text-sm font-bold">{currentUser?.username || 'Club member'}</p>
              <p className="truncate text-xs text-slate-500">{currentUser?.email || 'Trade Hybrid Club'}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                to={CLUB_LINKS.login}
                onClick={onNavItemClick}
                className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-800 dark:border-white/15 dark:text-white"
              >
                Log in
              </Link>
              <Link
                to={CLUB_LINKS.register}
                onClick={onNavItemClick}
                className="rounded-xl bg-gradient-to-r from-cyan-300 to-violet-500 px-4 py-3 text-center text-sm font-black text-slate-950"
              >
                Join the Club
              </Link>
            </div>
          )}
        </div>
      </aside>
    </NavItemContext.Provider>
  );
};

export const MobileSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button variant="ghost" size="icon" onClick={onClick} className="lg:hidden">
    <span className="sr-only">Open Club menu</span>
    <Zap className="h-5 w-5" />
  </Button>
);

export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-[86%] max-w-sm">
        <MainSidebar onClose={onClose} mobile />
      </div>
    </div>
  );
};
