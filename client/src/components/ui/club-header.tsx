import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Network, Sun, UserRound, Wallet, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { Button } from './button';
import { MainSidebar } from './main-sidebar-enhanced';
import { CLUB_LINKS } from '@/lib/club-links';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/hooks/useTheme';

export function ClubHeader() {
  const [open, setOpen] = React.useState(false);
  const { currentUser } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="pro-theme-surface sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090f]/95 text-white backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Club menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pro-theme-surface w-[88vw] max-w-sm border-white/[0.06] bg-[#07090f] p-0">
              <MainSidebar mobile showClose={false} onClose={() => setOpen(false)} onNavItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to={CLUB_LINKS.dashboard} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] shadow-[0_0_28px_rgba(34,211,238,.1)]">
              <Zap className="h-4 w-4 text-cyan-300" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-black tracking-[0.18em]">TRADE HYBRID</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-400">Club OS</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={CLUB_LINKS.zone}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-400/[0.05] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-violet-200 sm:inline-flex"
          >
            <Network className="h-4 w-4" /> Zone Mode
          </a>

          <Link to="/wallet" className="flex items-center gap-2 rounded-xl border border-cyan-300/20 px-3 py-2 text-sm font-semibold" aria-label="Open Solana wallet"><Wallet className="h-4 w-4 text-cyan-600"/><span className="hidden sm:inline">Wallet</span></Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-white"
            title={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {resolvedTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link
            to={CLUB_LINKS.profile}
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            <UserRound className="h-4 w-4 text-cyan-300" />
            <span className="max-w-28 truncate">{currentUser?.username || 'Profile'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}