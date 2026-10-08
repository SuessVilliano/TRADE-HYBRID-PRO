import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Network, ShieldCheck, Zap } from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';
import { useAuth } from '@/lib/context/AuthContext';

export default function ClubHome() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={CLUB_LINKS.dashboard} replace />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080a10] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[150px]" />
      <div className="pointer-events-none absolute right-[-180px] bottom-[-120px] h-[520px] w-[520px] rounded-full bg-violet-500/[0.07] blur-[130px]" />

      <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.028] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10 lg:p-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300">
                <Zap className="h-3.5 w-3.5" /> Trade Hybrid Club OS
              </span>
              <span className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                Member access
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Your trading journey, <span className="text-slate-500">connected.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              One member identity across Hybrid Signals, Market Buddy, the trading terminal, Hybrid Journal, Copy, Academy, Trade House, Community, Hybrid Funding, and The Hybrid Zone.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-[#061016]"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://tradehybrid.co/#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-5 py-3 text-sm font-bold text-slate-200"
              >
                Join Trade Hybrid <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={CLUB_LINKS.zone}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-400/[0.05] px-5 py-3 text-sm font-bold text-violet-200"
              >
                Preview Hybrid Zone <Network className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-white/[0.06] bg-black/25 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm font-black">Already purchased?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Use the same email connected to your membership and open your Club OS.</p>
              </div>
            </div>
            <Link to="/login?next=/dashboard" className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-200">
              Member login <ArrowRight className="h-4 w-4 text-cyan-300" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-3 border-t border-white/[0.06] pt-7 sm:grid-cols-3">
          {[
            ['01', 'Discover → Decide', 'Signals + AI help you filter opportunity before risk.'],
            ['02', 'Execute → Record', 'Terminal + Journal turn decisions into a durable trading record.'],
            ['03', 'Improve → Scale', 'Academy, Trade House, Funding, and Copy build the trader over time.'],
          ].map(([n, title, text]) => (
            <div key={n} className="rounded-2xl border border-white/[0.05] bg-white/[0.018] p-4">
              <p className="text-[9px] font-black tracking-[0.2em] text-cyan-400/70">{n}</p>
              <p className="mt-3 text-sm font-black">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
