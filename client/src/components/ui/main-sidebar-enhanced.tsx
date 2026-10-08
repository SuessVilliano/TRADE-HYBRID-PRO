import React, { createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Bot,
  CircleUserRound,
  Copy,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Home,
  LineChart,
  Music2,
  Network,
  Radio,
  Newspaper,
  Settings,
  Swords,
  Target,
  Users,
  WalletCards,
  X,
  Zap,
  Coins,
  PlugZap,
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
      ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20'
      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
  );

  const body = (
    <>
      <span className={cn(
        'grid h-8 w-8 place-items-center rounded-lg border transition',
        active
          ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-300'
          : 'border-white/[0.05] bg-white/[0.025] text-slate-500 group-hover:text-slate-200'
      )}>{icon}</span>
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="h-3.5 w-3.5 text-slate-600" />}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onNavItemClick}>
        {body}
      </a>
    );
  }

  return <Link to={href} className={className} onClick={onNavItemClick}>{body}</Link>;
};

function Group({ title, items, isActive }: {
  title: string;
  items: { label: string; href: string; icon: React.ReactNode }[];
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="mb-5">
      <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.24em] text-slate-600">{title}</p>
      <div className="space-y-1">
        {items.map(item => <NavItem key={item.label} {...item} active={isActive(item.href)} />)}
      </div>
    </div>
  );
}

export const MainSidebar: React.FC<{
  onClose?: () => void;
  mobile?: boolean;
  showClose?: boolean;
  className?: string;
  onNavItemClick?: () => void;
}> = ({ onClose, mobile = false, showClose = true, className = '', onNavItemClick }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const isActive = (href: string) =>
    !isExternalClubLink(href) &&
    (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  const groups = [
    {
      title: 'Home',
      items: [
        { label: 'Today', href: isAuthenticated ? CLUB_LINKS.dashboard : CLUB_LINKS.home, icon: <Home className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Trade',
      items: [
        { label: 'Hybrid Signals', href: CLUB_LINKS.signals, icon: <Target className="h-4 w-4" /> },
        { label: 'Terminal', href: CLUB_LINKS.terminal, icon: <Zap className="h-4 w-4" /> },
        { label: 'Hybrid Copy', href: CLUB_LINKS.copy, icon: <Copy className="h-4 w-4" /> },
        { label: 'Markets', href: CLUB_LINKS.markets, icon: <LineChart className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Track',
      items: [
        { label: 'Hybrid Journal', href: CLUB_LINKS.journal, icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Connections', href: CLUB_LINKS.connections, icon: <PlugZap className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Grow',
      items: [
        { label: 'Market Buddy', href: CLUB_LINKS.ai, icon: <Bot className="h-4 w-4" /> },
        { label: 'Academy', href: CLUB_LINKS.academy, icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Trade House', href: CLUB_LINKS.battles, icon: <Swords className="h-4 w-4" /> },
        { label: 'Hybrid Funding', href: CLUB_LINKS.funding, icon: <WalletCards className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Club',
      items: [
        { label: 'Community', href: CLUB_LINKS.community, icon: <Users className="h-4 w-4" /> },
        { label: 'TH TV', href: CLUB_LINKS.tv, icon: <Radio className="h-4 w-4" /> },
        { label: 'News', href: CLUB_LINKS.news, icon: <Newspaper className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Explore',
      items: [
        { label: 'Enter Hybrid Zone', href: CLUB_LINKS.zone, icon: <Network className="h-4 w-4" /> },
        { label: 'Trade Hybrid Coin', href: CLUB_LINKS.coin, icon: <Coins className="h-4 w-4" /> },
        { label: 'Hybrid Runner', href: CLUB_LINKS.runner, icon: <Gamepad2 className="h-4 w-4" /> },
        { label: 'Trade Hybrid Music', href: CLUB_LINKS.music, icon: <Music2 className="h-4 w-4" /> },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    onNavItemClick?.();
  };

  return (
    <NavItemContext.Provider value={{ onNavItemClick }}>
      <aside className={cn(
        'flex h-full flex-col border-r border-white/[0.06] bg-[#07090f] text-white',
        mobile ? 'w-full' : 'w-72',
        className,
      )}>
        <div className="px-4 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <Link to={CLUB_LINKS.home} className="flex items-center gap-3" onClick={onNavItemClick}>
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,.12)]">
                <Zap className="h-5 w-5 text-cyan-300" />
              </span>
              <span>
                <span className="block text-sm font-black tracking-[0.16em]">TRADE HYBRID</span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-400">Club OS</span>
              </span>
            </Link>
            {mobile && showClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <a
            href={CLUB_LINKS.zone}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-between rounded-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/10 to-cyan-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-200"
          >
            <span>◎ Zone Mode</span>
            <Network className="h-4 w-4 text-violet-300" />
          </a>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map(group => <Group key={group.title} {...group} isActive={isActive} />)}

          {isAuthenticated && (
            <Group
              title="Account"
              isActive={isActive}
              items={[
                { label: 'Profile', href: CLUB_LINKS.profile, icon: <CircleUserRound className="h-4 w-4" /> },
                { label: 'Settings', href: CLUB_LINKS.settings, icon: <Settings className="h-4 w-4" /> },
              ]}
            />
          )}
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="p-4">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{currentUser?.username || 'Club member'}</p>
                  <p className="truncate text-[11px] text-slate-500">{currentUser?.membershipLevel || 'member'} access</p>
                </div>
                <BarChart3 className="h-4 w-4 text-cyan-400" />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-lg border border-white/[0.07] px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/[0.04] hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link to={CLUB_LINKS.login} className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold">
                Log in
              </Link>
              <Link to={CLUB_LINKS.register} className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-[#051016]">
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

export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-[88%] max-w-sm">
        <MainSidebar onClose={onClose} mobile onNavItemClick={onClose} />
      </div>
    </div>
  );
};
