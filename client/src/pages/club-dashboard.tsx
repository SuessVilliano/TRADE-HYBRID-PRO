import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  Circle,
  Copy,
  GraduationCap,
  LineChart,
  Network,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { CLUB_LINKS, isExternalClubLink } from '@/lib/club-links';
import memberJourneyService from '@/lib/services/member-journey-service';
import { useAuth } from '@/lib/context/AuthContext';

type ActionCard = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  cta: string;
};

function SmartLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  if (isExternalClubLink(href)) {
    return <a href={href} target="_blank" rel="noreferrer" className={className}>{children}</a>;
  }
  return <Link to={href} className={className}>{children}</Link>;
}

function ActionTile({ item }: { item: ActionCard }) {
  const Icon = item.icon;
  return (
    <SmartLink
      href={item.href}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.055]"
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${item.accent} to-transparent opacity-80`} />
      <div className="mb-8 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-black/25">
          <Icon className="h-5 w-5 text-cyan-300" />
        </span>
        <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400/80">{item.eyebrow}</p>
      <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{item.description}</p>
      <span className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.12em] text-slate-300">{item.cta}</span>
    </SmartLink>
  );
}

export default function ClubDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [journeyReady, setJourneyReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    let active = true;
    memberJourneyService
      .getOnboarding()
      .then((journey) => {
        if (!active) return;
        const complete = Boolean(journey?.completed_at);
        setOnboardingComplete(complete);
        if (!complete) {
          navigate(CLUB_LINKS.onboarding, { replace: true });
          return;
        }
        setJourneyReady(true);
      })
      .catch(() => {
        if (active) setJourneyReady(true);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const firstName = useMemo(() => {
    const source = currentUser?.username || 'Trader';
    return source.split(/[\s_-]/)[0] || 'Trader';
  }, [currentUser?.username]);

  const coreActions: ActionCard[] = [
    {
      title: 'Hybrid Signals',
      eyebrow: 'Discover',
      description: 'Start with the live opportunity feed. Review the setup before you decide what deserves risk.',
      href: CLUB_LINKS.signals,
      icon: Target,
      accent: 'via-cyan-300',
      cta: 'Open signal desk',
    },
    {
      title: 'Market Buddy',
      eyebrow: 'Decide',
      description: 'Pressure-test the setup against your WHY, game plan, journal history, and current priorities.',
      href: CLUB_LINKS.ai,
      icon: Bot,
      accent: 'via-violet-400',
      cta: 'Ask Market Buddy',
    },
    {
      title: 'Trading Terminal',
      eyebrow: 'Execute',
      description: 'Move from idea to action through the execution cockpit instead of bouncing between disconnected tools.',
      href: CLUB_LINKS.terminal,
      icon: Zap,
      accent: 'via-blue-400',
      cta: 'Open terminal',
    },
    {
      title: 'Hybrid Journal',
      eyebrow: 'Record',
      description: 'Your source of truth for trades, alerts, notes, analytics, review, and the record of how you actually trade.',
      href: CLUB_LINKS.journal,
      icon: BookOpen,
      accent: 'via-emerald-400',
      cta: 'Open journal',
    },
  ];

  const scaleActions: ActionCard[] = [
    {
      title: 'Hybrid Copy',
      eyebrow: 'Scale',
      description: 'Manage copy relationships, risk rules, connected accounts, and signal-to-execution routing.',
      href: CLUB_LINKS.copy,
      icon: Copy,
      accent: 'via-fuchsia-400',
      cta: 'Manage copy',
    },
    {
      title: 'Trade House',
      eyebrow: 'Prove',
      description: 'Compete, build a public track record, and turn disciplined performance into visible proof.',
      href: CLUB_LINKS.battles,
      icon: Swords,
      accent: 'via-orange-400',
      cta: 'Enter arena',
    },
    {
      title: 'Hybrid Funding',
      eyebrow: 'Get capital',
      description: 'When your process is ready, move into the funding path without treating funding as the starting point.',
      href: CLUB_LINKS.funding,
      icon: WalletCards,
      accent: 'via-green-400',
      cta: 'Explore funding',
    },
    {
      title: 'Academy',
      eyebrow: 'Improve',
      description: 'Close specific skill gaps with structured learning instead of consuming random trading content.',
      href: CLUB_LINKS.academy,
      icon: GraduationCap,
      accent: 'via-yellow-300',
      cta: 'Continue learning',
    },
  ];

  if (!journeyReady) {
    return (
      <main className="grid min-h-[76vh] place-items-center bg-[#080a10] text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border border-white/10 border-t-cyan-300" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Loading your Trade Hybrid OS</p>
        </div>
      </main>
    );
  }

  const stages = [
    ['DISCOVER', 'Signals'],
    ['DECIDE', 'AI'],
    ['EXECUTE', 'Terminal'],
    ['RECORD', 'Journal'],
    ['IMPROVE', 'Academy'],
    ['SCALE', 'Copy'],
  ];

  return (
    <main className="pro-theme-surface relative min-h-screen overflow-hidden bg-[#080a10] px-4 pb-20 pt-8 text-white sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.045] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[260px] h-[420px] w-[420px] rounded-full bg-violet-500/[0.055] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        <section className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                Trade Hybrid OS
              </span>
              <span className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                {currentUser?.membershipLevel || 'member'} access
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
              Good evening, {firstName}. <span className="text-slate-500">Run the process.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              One identity across signals, AI, execution, journaling, learning, competition, community, and funding.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SmartLink
              href={CLUB_LINKS.ai}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#061016]"
            >
              <Bot className="h-4 w-4" /> Ask Market Buddy
            </SmartLink>
            <SmartLink
              href={CLUB_LINKS.zone}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-violet-200"
            >
              <Network className="h-4 w-4" /> Enter Zone Mode
            </SmartLink>
          </div>
        </section>

        <section className="mb-7 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20 p-3">
          <div className="grid min-w-[760px] grid-cols-6 gap-2">
            {stages.map(([stage, label], index) => (
              <div key={stage} className="relative rounded-xl border border-white/[0.045] bg-white/[0.02] px-3 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400/70">{String(index + 1).padStart(2, '0')}</span>
                  {index === 0 ? <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" /> : <Circle className="h-3.5 w-3.5 text-slate-700" />}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.19em] text-slate-500">{stage}</p>
                <p className="mt-1 text-xs font-bold text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-7 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-3xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.065] via-white/[0.025] to-violet-400/[0.045] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">Today’s command center</p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">Plan first. Trade second.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Your dashboard is intentionally organized around the trading workflow—not around the number of products Trade Hybrid owns.
                </p>
              </div>
              <ShieldCheck className="h-7 w-7 text-cyan-300/70" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SmartLink href={CLUB_LINKS.onboarding} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 hover:border-cyan-300/20">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Game plan</p>
                <p className="mt-2 text-sm font-bold text-white">Review WHY + goals</p>
                <p className="mt-1 text-xs text-slate-500">{onboardingComplete ? 'Profile is active' : 'Needs attention'}</p>
              </SmartLink>
              <SmartLink href={CLUB_LINKS.signals} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 hover:border-cyan-300/20">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Opportunity desk</p>
                <p className="mt-2 text-sm font-bold text-white">Review live signals</p>
                <p className="mt-1 text-xs text-slate-500">Hybrid · Solaris · Paradox</p>
              </SmartLink>
              <SmartLink href={CLUB_LINKS.journal} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 hover:border-cyan-300/20">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Memory layer</p>
                <p className="mt-2 text-sm font-bold text-white">Open Hybrid Journal</p>
                <p className="mt-1 text-xs text-slate-500">Trades · alerts · review</p>
              </SmartLink>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-300/10 bg-violet-400/[0.045] p-6">
            <Sparkles className="h-5 w-5 text-violet-300" />
            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">Your next move</p>
            <h2 className="mt-2 text-xl font-black">Use AI as the decision layer.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Signals tell you what is happening. Market Buddy should help determine whether it belongs in your plan.
            </p>
            <SmartLink href={CLUB_LINKS.ai} className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-violet-200">
              Open Market Buddy <ArrowRight className="h-4 w-4" />
            </SmartLink>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-600">Daily workflow</p>
              <h2 className="mt-1 text-2xl font-black">Discover → Decide → Execute → Record</h2>
            </div>
            <SmartLink href={CLUB_LINKS.markets} className="hidden items-center gap-2 text-xs font-bold text-slate-500 hover:text-white sm:inline-flex">
              <LineChart className="h-4 w-4" /> Markets
            </SmartLink>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {coreActions.map(item => <ActionTile key={item.title} item={item} />)}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-600">Build the trader</p>
            <h2 className="mt-1 text-2xl font-black">Improve → Prove → Fund → Scale</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scaleActions.map(item => <ActionTile key={item.title} item={item} />)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400/70">Club layer</p>
            <h2 className="mt-2 text-xl font-black">Trading is the work. Community is the glue.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Community, TV, events, and the Hybrid Zone keep the ecosystem connected without cluttering your trading cockpit.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                [CLUB_LINKS.community, 'Community', Users],
                [CLUB_LINKS.tv, 'Hybrid TV', Radio],
                [CLUB_LINKS.zone, 'Hybrid Zone', Network],
              ].map(([href, label, Icon]: any) => (
                <SmartLink key={label} href={href} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2 text-xs font-bold text-slate-300 hover:border-white/[0.14]">
                  <Icon className="h-4 w-4 text-cyan-300" /> {label}
                </SmartLink>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-black/25 p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">One identity</p>
            <h2 className="mt-2 text-xl font-black">The apps can stay specialized.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Club OS is the member home. Journal owns the record. Copy owns routing. Terminal owns execution. Zone Mode owns exploration.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Connected product architecture
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}