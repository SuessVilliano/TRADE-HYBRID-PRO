import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Network, Sun, UserRound, Zap } from 'lucide-react';
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
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090f]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Club menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm border-white/[0.06] bg-[#07090f] p-0">
              <MainSidebar mobile onClose={() => setOpen(false)} onNavItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to={CLUB_LINKS.dashboard} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300 shadow-[0_0_26px_rgba(0,212,255,.08)]">
              <Zap className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-black tracking-[0.18em]">TRADE HYBRID</span>
              <span className="block text-[9px] uppercase tracking-[0.24em] text-cyan-300">Club OS</span>
            </span>
          </Link>

          <div className="ml-2 hidden items-center gap-2 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" />
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={CLUB_LINKS.zone}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.04] px-3 py-2 text-xs font-black text-violet-200 transition hover:bg-violet-300/[0.08] md:inline-flex"
          >
            <Network className="h-4 w-4" />
            Zone Mode
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:text-white"
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
            <span className="hidden max-w-28 truncate sm:inline">{currentUser?.username || 'Profile'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
