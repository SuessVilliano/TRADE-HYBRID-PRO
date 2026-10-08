import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BookOpen,
  BrainCircuit,
  Copy,
  ExternalLink,
  Gamepad2,
  Headphones,
  LineChart,
  Network,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  TerminalSquare,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { CLUB_LINKS, isExternalClubLink } from '@/lib/club-links';
import memberJourneyService from '@/lib/services/member-journey-service';
import { useAuth } from '@/lib/context/AuthContext';

type IconType = React.ComponentType<{ className?: string }>;

type SignalLike = {
  id?: string | number;
  symbol?: string;
  ticker?: string;
  side?: string;
  direction?: string;
  provider?: string;
  Provider?: string;
  timeframe?: string;
  entry?: string | number;
  entryPrice?: string | number;
  stopLoss?: string | number;
  takeProfit?: string | number;
  status?: string;
};

type Destination = {
  key: string;
  title: string;
  label: string;
  description: string;
  href: string;
  icon: IconType;
  accent: string;
};

const primaryDestinations: Destination[] = [
  {
    key: 'signals',
    title: 'Hybrid Signals',
    label: 'DISCOVER',
    description: 'Live Trade Hybrid, Solaris, Paradox, webhook and market intelligence in one signal layer.',
    href: CLUB_LINKS.signals,
    icon: Activity,
    accent: 'cyan',
  },
  {
    key: 'ai',
    title: 'Market Buddy',
    label: 'DECIDE',
    description: 'Use your WHY, game plan and Journal context to decide what actually deserves your attention.',
    href: CLUB_LINKS.ai,
    icon: BrainCircuit,
    accent: 'violet',
  },
  {
    key: 'terminal',
    title: 'ABATEV Terminal',
    label: 'EXECUTE',
    description: 'The trading cockpit for AI-assisted execution, connected accounts and broker routing.',
    href: CLUB_LINKS.terminal,
    icon: TerminalSquare,
    accent: 'emerald',
  },
  {
    key: 'journal',
    title: 'Hybrid Journal',
    label: 'RECORD',
    description: 'Your permanent trading memory: trades, alerts, notes, analytics, reviews and performance.',
    href: CLUB_LINKS.journal,
    icon: BookOpen,
    accent: 'amber',
  },
  {
    key: 'copy',
    title: 'Hybrid Copy',
    label: 'SCALE',
    description: 'Copy relationships, allocation rules, account connections and signal-to-execution routing.',
    href: CLUB_LINKS.copy,
    icon: Copy,
    accent: 'fuchsia',
  },
  {
    key: 'battles',
    title: 'Trade House',
    label: 'PROVE',
    description: 'Compete, build public proof and turn consistent execution into a visible trading record.',
    href: CLUB_LINKS.battles,
    icon: Swords,
    accent: 'rose',
  },
];

const ecosystemDestinations: Destination[] = [
  {
    key: 'academy',
    title: 'Academy',
    label: 'IMPROVE',
    description: 'Structured learning that reinforces the gaps your trading process exposes.',
    href: CLUB_LINKS.academy,
    icon: BookOpen,
    accent: 'amber',
  },
  {
    key: 'funding',
    title: 'Hybrid Funding',
    label: 'GET CAPITAL',
    description: 'The funding path for traders ready to prove their edge under defined account rules.',
    href: CLUB_LINKS.funding,
    icon: WalletCards,
    accent: 'emerald',
  },
  {
    key: 'community',
    title: 'Community',
    label: 'BELONG',
    description: 'Accountability, conversation, events, members and the human layer around the ecosystem.',
    href: CLUB_LINKS.community,
    icon: Users,
    accent: 'cyan',
  },
  {
    key: 'zone',
    title: 'The Hybrid Zone',
    label: 'EXPLORE',
    description: 'Enter the immersive Trade Hybrid world and move through the ecosystem as a connected experience.',
    href: CLUB_LINKS.zone,
    icon: Network,
    accent: 'violet',
  },
  {
    key: 'tv',
    title: 'Trade Hybrid TV',
    label: 'WATCH',
    description: 'Programming, market content, battles, education and the Trade Hybrid media layer.',
    href: CLUB_LINKS.tv,
    icon: Radio,
    accent: 'rose',
  },
];

const cultureDestinations: Destination[] = [
  {
    key: 'coin',
    title: 'Trade Hybrid Coin',
    label: 'PARTICIPATE',
    description: 'The Solana utility layer for ecosystem access, staking, governance and participation.',
    href: CLUB_LINKS.coin,
    icon: Sparkles,
    accent: 'amber',
  },
  {
    key: 'runner',
    title: 'Hybrid Runner',
    label: 'PLAY',
    description: 'The arcade front door into Trade Hybrid.',
    href: CLUB_LINKS.runner,
    icon: Gamepad2,
    accent: 'rose',
  },
  {
    key: 'music',
    title: 'Trade Hybrid Music',
    label: 'LISTEN',
    description: 'Trade Zone and focus music built around the trading lifestyle.',
    href: CLUB_LINKS.music,
    icon: Headphones,
    accent: 'fuchsia',
  },
];

const accentClasses: Record<string, string> = {
  cyan: 'border-cyan-300/15 bg-cyan-300/[0.045] text-cyan-300',
  violet: 'border-violet-300/15 bg-violet-300/[0.045] text-violet-300',
  emerald: 'border-emerald-300/15 bg-emerald-300/[0.045] text-emerald-300',
  amber: 'border-amber-300/15 bg-amber-300/[0.045] text-amber-300',
  fuchsia: 'border-fuchsia-300/15 bg-fuchsia-300/[0.045] text-fuchsia-300',
  rose: 'border-rose-300/15 bg-rose-300/[0.045] text-rose-300',
};

function DestinationLink({
  destination,
  children,
  className,
}: {
  destination: Destination;
  children: React.ReactNode;
  className?: string;
}) {
  const onClick = () => {
    memberJourneyService.markAccess(destination.key, true).catch(() => null);
  };

  if (isExternalClubLink(destination.href)) {
    return (
      <a href={destination.href} target="_blank" rel="noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={destination.href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

function SignalPreview({ signal }: { signal: SignalLike }) {
  const symbol = signal.symbol || signal.ticker || 'MARKET';
  const side = signal.side || signal.direction || 'SETUP';
  const provider = signal.provider || signal.Provider || 'Trade Hybrid';
  const entry = signal.entryPrice ?? signal.entry;
  const stop = signal.stopLoss;
  const target = signal.takeProfit;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{provider}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-black text-white">{symbol}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase text-slate-300">
              {side}
            </span>
          </div>
        </div>
        {signal.timeframe && <span className="text-xs font-bold text-slate-500">{signal.timeframe}</span>}
      </div>

      {(entry !== undefined || stop !== undefined || target !== undefined) && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-white/[0.035] p-2">
            <p className="text-slate-500">Entry</p>
            <p className="mt-1 font-bold text-white">{entry ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-white/[0.035] p-2">
            <p className="text-slate-500">Stop</p>
            <p className="mt-1 font-bold text-white">{stop ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-white/[0.035] p-2">
            <p className="text-slate-500">Target</p>
            <p className="mt-1 font-bold text-white">{target ?? '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClubDashboard() {
  const navigate = useNavigate();
  const { currentUser, membershipLevel } = useAuth();
  const [journeyReady, setJourneyReady] = useState(false);
  const [signals, setSignals] = useState<SignalLike[]>([]);
  const [signalsLoaded, setSignalsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    memberJourneyService
      .getOnboarding()
      .then((journey) => {
        if (!active) return;
        if (!journey?.completed_at) {
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

  useEffect(() => {
    let active = true;

    fetch('/api/signals')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('signals unavailable'))))
      .then((payload) => {
        if (!active) return;
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.signals)
            ? payload.signals
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
        setSignals(raw.slice(0, 3));
      })
      .catch(() => {
        if (active) setSignals([]);
      })
      .finally(() => {
        if (active) setSignalsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = currentUser?.username || currentUser?.email?.split('@')[0] || 'Trader';

  if (!journeyReady) {
    return (
      <main className="grid min-h-[78vh] place-items-center bg-[#07090f] text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
          <p className="mt-4 text-sm">Preparing your Trade Hybrid OS…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090f] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,.14),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(139,92,246,.13),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1500px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" />
                  Club OS Live
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {membershipLevel || 'member'}
                </span>
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">TODAY</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {greeting}, {displayName}.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
                Discover opportunities, decide with context, execute with intent, record everything, improve the process, and scale only what proves itself.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={CLUB_LINKS.ai}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_0_35px_rgba(0,212,255,.18)] transition hover:-translate-y-0.5"
              >
                <Bot className="h-4 w-4" /> Ask Market Buddy
              </Link>
              <a
                href={CLUB_LINKS.zone}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/[0.06] px-4 py-3 text-sm font-black text-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-300/[0.1]"
              >
                <Network className="h-4 w-4" /> Enter The Hybrid Zone
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Signals now</p>
              <p className="mt-2 text-3xl font-black">{signalsLoaded ? signals.length : '—'}</p>
              <Link to={CLUB_LINKS.signals} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
                Open intelligence <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Trading record</p>
              <p className="mt-2 text-lg font-black">Hybrid Journal</p>
              <a href={CLUB_LINKS.journal} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                Review performance <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Execution</p>
              <p className="mt-2 text-lg font-black">ABATEV + Copy</p>
              <a href={CLUB_LINKS.terminal} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                Open cockpit <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Your game plan</p>
              <p className="mt-2 text-lg font-black">WHY → Process</p>
              <Link to={CLUB_LINKS.onboarding} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-300">
                Review plan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
          <div className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">LIVE INTELLIGENCE</p>
                <h2 className="mt-2 text-2xl font-black">Hybrid Signals</h2>
                <p className="mt-2 text-sm text-slate-500">Start with the opportunity. Then decide whether it belongs in your plan.</p>
              </div>
              <Link to={CLUB_LINKS.signals} className="hidden items-center gap-1 text-sm font-black text-cyan-300 sm:inline-flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {signals.length > 0 ? (
                signals.map((signal, index) => <SignalPreview key={signal.id || index} signal={signal} />)
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/10 p-7">
                  <Activity className="h-7 w-7 text-cyan-300" />
                  <h3 className="mt-4 text-lg font-black">Your signal feed is the front of the workflow.</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Open Hybrid Signals for the full feed. From there, the operating model is Analyze → Trade → Copy → Watch → Pass, with the Journal retaining the outcome.
                  </p>
                  <Link to={CLUB_LINKS.signals} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2 text-sm font-black text-cyan-300">
                    Open Hybrid Signals <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-violet-300/15 bg-violet-300/[0.045] p-5 backdrop-blur-xl sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">MARKET BUDDY</p>
            <h2 className="mt-2 text-2xl font-black">Decision layer, not another chatbot.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Market Buddy should use your WHY, goals, markets, Journal history and current plan to tell you what deserves attention—and what does not.
            </p>
            <div className="mt-6 grid gap-3">
              <Link to={CLUB_LINKS.ai} className="flex items-center justify-between rounded-2xl border border-violet-300/15 bg-black/20 p-4 transition hover:bg-black/30">
                <span className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-violet-300" />
                  <span>
                    <span className="block text-sm font-black">Analyze a setup</span>
                    <span className="block text-xs text-slate-500">Does this fit my actual plan?</span>
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-violet-300" />
              </Link>
              <a href={CLUB_LINKS.journal} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:bg-black/30">
                <span className="flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-amber-300" />
                  <span>
                    <span className="block text-sm font-black">Review my edge</span>
                    <span className="block text-xs text-slate-500">Let the Journal expose the leak.</span>
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>
              <Link to={CLUB_LINKS.academy} className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:bg-black/30">
                <span className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-cyan-300" />
                  <span>
                    <span className="block text-sm font-black">Fix the gap</span>
                    <span className="block text-xs text-slate-500">Learn only what the process says you need.</span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">YOUR OPERATING LOOP</p>
            <h2 className="mt-2 text-2xl font-black">One ecosystem. Each product has a job.</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {primaryDestinations.map((destination) => {
              const Icon = destination.icon;
              return (
                <DestinationLink key={destination.key} destination={destination} className="group">
                  <article className={"h-full rounded-2xl border p-5 transition hover:-translate-y-1 " + accentClasses[destination.accent]}>
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6" />
                      {isExternalClubLink(destination.href) ? <ExternalLink className="h-4 w-4 opacity-40" /> : <ArrowUpRight className="h-4 w-4 opacity-40" />}
                    </div>
                    <p className="mt-8 text-[10px] font-black uppercase tracking-[0.24em]">{destination.label}</p>
                    <h3 className="mt-2 text-xl font-black text-white">{destination.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{destination.description}</p>
                  </article>
                </DestinationLink>
              );
            })}
          </div>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">THE PATH</p>
                <h2 className="text-2xl font-black">Improve → Prove → Fund → Scale</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ecosystemDestinations.map((destination) => {
                const Icon = destination.icon;
                return (
                  <DestinationLink key={destination.key} destination={destination} className="group">
                    <div className="h-full rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-cyan-300/20 hover:bg-black/30">
                      <Icon className="h-5 w-5 text-cyan-300" />
                      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{destination.label}</p>
                      <p className="mt-1 font-black text-white">{destination.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{destination.description}</p>
                    </div>
                  </DestinationLink>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-violet-300/15 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,.18),transparent_38%),rgba(255,255,255,.025)] p-6">
            <Network className="h-8 w-8 text-violet-300" />
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">ZONE MODE</p>
            <h2 className="mt-2 text-3xl font-black">Your ecosystem should feel like a world.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Dashboard Mode is for speed. The Hybrid Zone is for immersion. Same Trade Hybrid journey, two ways to experience it.
            </p>
            <a
              href={CLUB_LINKS.zone}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-3 text-sm font-black text-slate-950"
            >
              Enter The Hybrid Zone <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mt-7 rounded-[1.75rem] border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300">CULTURE</p>
              <h2 className="mt-2 text-2xl font-black">Trade Hybrid is bigger than a dashboard.</h2>
            </div>
            <a href={CLUB_LINKS.publicSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-slate-400 hover:text-white">
              Visit tradehybrid.co <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {cultureDestinations.map((destination) => {
              const Icon = destination.icon;
              return (
                <DestinationLink key={destination.key} destination={destination} className="group">
                  <div className="h-full rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:-translate-y-1 hover:border-fuchsia-300/20">
                    <Icon className="h-5 w-5 text-fuchsia-300" />
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{destination.label}</p>
                    <p className="mt-1 font-black">{destination.title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{destination.description}</p>
                  </div>
                </DestinationLink>
              );
            })}
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-5 py-4 text-xs text-slate-500">
          <span>Trade Hybrid Club is the identity and operating layer. Specialist products keep doing the jobs they do best.</span>
          <div className="flex items-center gap-4">
            <Link to={CLUB_LINKS.connections} className="font-bold text-slate-300 hover:text-white">Connections</Link>
            <Link to={CLUB_LINKS.settings} className="font-bold text-slate-300 hover:text-white">Settings</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
