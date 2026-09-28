import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, UserRound, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { Button } from './button';
import { MainSidebar } from './main-sidebar-enhanced';
import { CLUB_LINKS } from '@/lib/club-links';
import { useAuth } from '@/lib/context/AuthContext';

export function ClubHeader() {
  const [open, setOpen] = React.useState(false);
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060a14]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl border border-white/10 text-white hover:bg-white/5 hover:text-white"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Club menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm border-white/10 bg-[#060a14] p-0">
              <MainSidebar mobile onClose={() => setOpen(false)} onNavItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to={CLUB_LINKS.dashboard} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
              <Zap className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-black tracking-[0.18em]">TRADE HYBRID</span>
              <span className="block text-[9px] uppercase tracking-[0.24em] text-cyan-300">Club</span>
            </span>
          </Link>
        </div>

        <Link
          to={CLUB_LINKS.profile}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/[0.07]"
        >
          <UserRound className="h-4 w-4 text-cyan-200" />
          <span className="max-w-28 truncate">{currentUser?.username || 'Profile'}</span>
        </Link>
      </div>
    </header>
  );
}
