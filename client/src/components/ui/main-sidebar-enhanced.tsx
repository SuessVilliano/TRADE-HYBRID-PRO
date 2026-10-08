import React, { createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Bot,
  CircleUserRound,
  Copy,
  ExternalLink,
  Gamepad2,
  Headphones,
  Home,
  LineChart,
  Network,
  Radio,
  Settings,
  Swords,
  TerminalSquare,
  Trophy,
  Users,
  WalletCards,
  X,
  Zap,
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
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
    active
      ? 'bg-cyan-300/[0.08] text-cyan-200 ring-1 ring-cyan-300/15'
      : 'text-slate-400 hover:bg-white/[0.045] hover:text-white',
  );

  const body = (
    <>
      <span className={cn(
        'grid h-8 w-8 place-items-center rounded-lg border transition',
        active
          ? 'border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300'
          : 'border-white/[0.06] bg-white/[0.025] text-slate-400 group-hover:text-white',
      )}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />}
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

  const sections = [
    {
      label: 'Home',
      items: [
        { label: 'Today', href: CLUB_LINKS.dashboard, icon: <Home className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Trade',
      items: [
        { label: 'Hybrid Signals', href: CLUB_LINKS.signals, icon: <Activity className="h-4 w-4" /> },
        { label: 'ABATEV Terminal', href: CLUB_LINKS.terminal, icon: <TerminalSquare className="h-4 w-4" /> },
        { label: 'Hybrid Copy', href: CLUB_LINKS.copy, icon: <Copy className="h-4 w-4" /> },
        { label: 'Markets', href: CLUB_LINKS.markets, icon: <LineChart className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Track',
      items: [
        { label: 'Hybrid Journal', href: CLUB_LINKS.journal, icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Connections', href: CLUB_LINKS.connections, icon: <Zap className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Grow',
      items: [
        { label: 'Market Buddy', href: CLUB_LINKS.ai, icon: <Bot className="h-4 w-4" /> },
        { label: 'Academy', href: CLUB_LINKS.academy, icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Trade House', href: CLUB_LINKS.battles, icon: <Swords className="h-4 w-4" /> },
        { label: 'Hybrid Funding', href: CLUB_LINKS.funding, icon: <WalletCards className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Club',
      items: [
        { label: 'Community', href: CLUB_LINKS.community, icon: <Users className="h-4 w-4" /> },
        { label: 'Trade Hybrid TV', href: CLUB_LINKS.tv, icon: <Radio className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Explore',
      items: [
        { label: 'The Hybrid Zone', href: CLUB_LINKS.zone, icon: <Network className="h-4 w-4" /> },
        { label: 'Trade Hybrid Coin', href: CLUB_LINKS.coin, icon: <Trophy className="h-4 w-4" /> },
        { label: 'Hybrid Runner', href: CLUB_LINKS.runner, icon: <Gamepad2 className="h-4 w-4" /> },
        { label: 'Trade Hybrid Music', href: CLUB_LINKS.music, icon: <Headphones className="h-4 w-4" /> },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    onNavItemClick?.();
  };

  return (
    <NavItemContext.Provider value={{ onNavItemClick }}>
      <aside
        className={cn(
          'flex h-full flex-col border-r border-white/[0.06] bg-[#07090f] text-white',
          mobile ? 'w-full' : 'w-72',
          className,
        )}
      >
        <div className="relative overflow-hidden px-4 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,.13),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,.14),transparent_38%)]" />
          <div className="relative flex items-center justify-between">
            <Link to={CLUB_LINKS.dashboard} className="flex items-center gap-3" onClick={onNavItemClick}>
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-300 shadow-[0_0_30px_rgba(0,212,255,.09)]">
                <Zap className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-black tracking-[0.18em]">TRADE HYBRID</span>
                <span className="block text-[9px] uppercase tracking-[0.28em] text-cyan-300">Club OS</span>
              </span>
            </Link>
            {mobile && (
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.label}>
              {sectionIndex > 0 && <div className="h-4" />}
              <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.24em] text-slate-600">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.label} {...item} active={isActive(item.href)} />
                ))}
              </div>
            </React.Fragment>
          ))}

          {isAuthenticated && (
            <>
              <div className="h-4" />
              <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.24em] text-slate-600">
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

        <Separator className="bg-white/[0.06]" />

        <div className="p-4">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05]">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{currentUser?.username || 'Club member'}</p>
                  <p className="truncate text-[11px] text-slate-500">{currentUser?.membershipLevel || 'member'} access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                to={CLUB_LINKS.login}
                onClick={onNavItemClick}
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Log in
              </Link>
              <Link
                to={CLUB_LINKS.register}
                onClick={onNavItemClick}
                className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950"
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-[86%] max-w-sm">
        <MainSidebar onClose={onClose} mobile />
      </div>
    </div>
  );
};
