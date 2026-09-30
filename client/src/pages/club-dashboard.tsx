import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bot,
  BookOpen,
  Clapperboard,
  Gift,
  LineChart,
  Network,
  Radio,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';
import memberJourneyService from '@/lib/services/member-journey-service';
import ClubRoadmapSection from '@/components/club/club-roadmap-section';

type IconType = React.ComponentType<{ className?: string }>;
type Product = {
  key: string;
  title: string;
  desc: string;
  href: string;
  icon: IconType;
  state: string;
};

const products: Product[] = [
  {
    key: 'journal',
    title: 'Hybrid Journal',
    desc: 'Track every trade and receive connected webhook alerts in the same workflow.',
    href: CLUB_LINKS.journal,
    icon: BookOpen,
    state: 'Journal + Alerts',
  },
  {
    key: 'ai',
    title: 'Market Buddy AI',
    desc: 'Your Trade Hybrid AI companion for goals, Journal context, review, planning, and your next move.',
    href: CLUB_LINKS.ai,
    icon: Bot,
    state: 'Trade Hybrid AI',
  },
  {
    key: 'battles',
    title: 'Trade House Battles',
    desc: 'Launch the standalone Arena with your Club identity, practice, compete with verified Hybrid Funding proof, and build a public record.',
    href: CLUB_LINKS.battles,
    icon: Trophy,
    state: 'Standalone Arena',
  },
  {
    key: 'community',
    title: 'Community',
    desc: 'Discussion, learning, events, accountability, members, and Club updates.',
    href: CLUB_LINKS.community,
    icon: Users,
    state: 'Stay plugged in',
  },
];

const exploreProducts: Product[] = [
  { key: 'terminal', title: 'ABATEV Terminal', desc: 'Trading cockpit and future broker-agnostic execution surface', href: CLUB_LINKS.terminal, icon: Bot, state: 'Terminal' },
  { key: 'battle-proof', title: 'Trade House Proof & Rules', desc: 'Open the Hybrid Funding Trade House page for verified public-dashboard proof, funding context, and rules.', href: CLUB_LINKS.battlesProof, icon: Trophy, state: 'Hybrid Funding' },
  { key: 'copy', title: 'Hybrid Copy', desc: 'Base44 copy trading and signal routing', href: CLUB_LINKS.copy, icon: LineChart, state: 'Live product' },
  { key: 'zone', title: 'Hybrid Zone', desc: 'Execution and control layer', href: CLUB_LINKS.zone, icon: Network, state: 'Live product' },
  { key: 'tv', title: 'Hybrid TV', desc: 'Shows, battles, and market content', href: CLUB_LINKS.tv, icon: Radio, state: 'Live channel' },
  { key: 'funding', title: 'Hybrid Funding', desc: 'Explore funding', href: CLUB_LINKS.funding, icon: WalletCards, state: 'Open' },
  { key: 'academy', title: 'Academy', desc: 'Build your process', href: CLUB_LINKS.academy, icon: BookOpen, state: 'Member' },
];

const quick = [
  { title: 'Your Game Plan', desc: 'Update your WHY and goals', href: CLUB_LINKS.onboarding, icon: Zap },
  { title: 'Academy', desc: 'Build your process', href: CLUB_LINKS.academy, icon: BookOpen },
  { title: 'Community', desc: 'Get plugged in', href: CLUB_LINKS.community, icon: Users },
  { title: 'Help Center', desc: 'Find product and account answers', href: CLUB_LINKS.help, icon: Gift },
];

function ProductLink({ product, children }: { product: Product; children: React.ReactNode }) {
  const handleClick = () => {
    memberJourneyService.markAccess(product.key, true).catch(() => null);
  };

  return /^https?:/i.test(product.href) ? (
    <a href={product.href} target="_blank" rel="noreferrer" onClick={handleClick}>
      {children}
    </a>
  ) : (
    <Link to={product.href} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default function ClubDashboard() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [journeyReady, setJourneyReady] = useState(false);
  const [dashboardStyle, setDashboardStyle] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('club-dashboard-style') || 'flat' : 'flat'
  );
  const isFuturistic = dashboardStyle === 'futuristic';

  useEffect(() => {
    const handleStyle = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      if (next) setDashboardStyle(next);
    };
    window.addEventListener('club-dashboard-style-change', handleStyle);
    return () => window.removeEventListener('club-dashboard-style-change', handleStyle);
  }, []);

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
        // Never trap an existing member if the journey service is temporarily unavailable.
        if (active) setJourneyReady(true);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (!journeyReady) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 text-slate-600 dark:bg-[#070b14] dark:text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500 dark:border-white/10 dark:border-t-cyan-300" />
          <p className="mt-4 text-sm">Preparing your Club journey…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-4 pb-16 pt-8 sm:px-8 lg:px-12 ${
        isFuturistic
          ? 'bg-[radial-gradient(circle_at_top,_#e0f7ff_0%,_#f7f7ff_34%,_#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top,_#10243c_0%,_#070b14_42%,_#03050a_100%)] dark:text-white'
          : 'bg-slate-50 text-slate-950 dark:bg-[#070b14] dark:text-white'
      }`}
      style={isFuturistic ? { perspective: '1200px' } : undefined}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Trade Hybrid Club</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Your trading journey, connected.</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              One place to learn, track, connect, compete, and use the tools that fit your actual game plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={CLUB_LINKS.ai}
              onClick={() => memberJourneyService.markAccess('ai', true).catch(() => null)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-5 py-3 font-black text-white shadow-lg shadow-violet-500/15"
            >
              <Bot className="h-5 w-5" /> Ask Market Buddy
            </Link>
            <a
              href={CLUB_LINKS.terminal}
              target="_blank"
              rel="noreferrer"
              onClick={() => memberJourneyService.markAccess('terminal', true).catch(() => null)}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-black text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              Open Terminal
            </a>
          </div>
        </div>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_.8fr_.8fr]">
          <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-6 shadow-sm dark:border-cyan-300/20 dark:from-cyan-400/15 dark:via-[#111a2a] dark:to-violet-500/10">
            <p className="text-sm font-bold text-cyan-700 dark:text-cyan-200">Your next move</p>
            <h2 className="mt-3 text-2xl font-black">Follow your game plan—not every market move.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Keep your WHY current, make the Journal your source of truth, and use Community + AI to stay accountable to the process.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={CLUB_LINKS.onboarding} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-black text-white">
                Review my game plan
              </Link>
              <Link
                to={CLUB_LINKS.community}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white"
              >
                Enter Community
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Club progress</p>
            <p className="mt-5 text-4xl font-black">1 / 5</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">journey checkpoints started</p>
            <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-2 w-1/5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm dark:border-violet-300/15 dark:bg-violet-400/[0.06]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">Club rewards</p>
            <p className="mt-5 text-4xl font-black">0</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">points available</p>
            <Link to="/affiliate-dashboard" className="mt-5 inline-flex items-center gap-1 text-sm font-black text-violet-700 dark:text-violet-200">
              View rewards <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Your toolkit</p>
              <h2 className="mt-1 text-2xl font-black">Choose where to go</h2>
            </div>
            <Link to="/trading-tools" className="text-sm font-black text-cyan-700 dark:text-cyan-300">View all tools</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => {
              const Icon = product.icon;
              const tones = [
                'border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:border-cyan-400/20 dark:from-cyan-500/20 dark:to-blue-500/5',
                'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-400/20 dark:from-emerald-500/15 dark:to-cyan-500/5',
                'border-violet-200 bg-gradient-to-br from-violet-50 to-white dark:border-violet-400/20 dark:from-violet-500/20 dark:to-fuchsia-500/5',
                'border-rose-200 bg-gradient-to-br from-rose-50 to-white dark:border-rose-400/20 dark:from-rose-500/20 dark:to-orange-500/5',
              ];

              return (
                <ProductLink key={product.title} product={product}>
                  <div className={`group h-full rounded-2xl border ${tones[index]} p-5 transition ${
                    isFuturistic
                      ? 'shadow-[0_18px_50px_rgba(15,23,42,.14)] hover:-translate-y-2 hover:rotate-[0.35deg] hover:shadow-[0_24px_70px_rgba(14,165,233,.20)]'
                      : 'shadow-sm hover:-translate-y-1 hover:shadow-md'
                  }`}>
                    <div className="mb-8 flex items-center justify-between">
                      <Icon className="h-6 w-6 text-cyan-700 dark:text-cyan-200" />
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-900 dark:group-hover:text-white" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-cyan-700 dark:text-cyan-200">{product.state}</p>
                    <h3 className="mt-2 text-xl font-black">{product.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.desc}</p>
                  </div>
                </ProductLink>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Explore the ecosystem</p>
              <h2 className="mt-1 text-xl font-black">Everything Trade Hybrid offers</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your subscriptions decide what unlocks; your game plan decides what deserves your attention.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-800 dark:border-cyan-300/30 dark:bg-transparent dark:text-cyan-200"
            >
              {showAll ? 'Show less' : 'Show all products'}
            </button>
          </div>

          {showAll && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {exploreProducts.map((product) => {
                const Icon = product.icon;
                return (
                  <ProductLink key={product.title} product={product}>
                    <div className="group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-cyan-300 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:border-cyan-300/30">
                      <Icon className="mb-5 h-5 w-5 text-violet-600 dark:text-violet-300" />
                      <p className="font-bold">{product.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.desc}</p>
                      <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-transparent dark:text-slate-400">
                        {product.state}
                      </span>
                    </div>
                  </ProductLink>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Your path</p>
                <h2 className="mt-1 text-xl font-black">First 30 days</h2>
              </div>
              <Link to={CLUB_LINKS.onboarding} className="text-xs font-black text-cyan-700 dark:text-cyan-300">Edit game plan</Link>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-5">
              {['Why + Plan', 'Journal', 'Community', 'Practice', 'Review'].map((step, index) => (
                <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-white/10 dark:bg-black/20">
                  <div className={`mx-auto mb-2 h-2 w-2 rounded-full ${index === 0 ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-white/20'}`} />
                  <p className="text-xs font-bold">{step}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{index === 0 ? 'Complete' : 'Next'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-300/15 dark:bg-violet-400/[0.05]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700 dark:text-violet-200">Your AI context</p>
            <h2 className="mt-2 text-xl font-black">Your AI should know your WHY.</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your onboarding profile is the base context for Market Buddy, so your AI can work from your WHY, goals, and journey instead of treating every member the same.
            </p>
            <div className="mt-4 flex gap-3">
              <Link to={CLUB_LINKS.ai} className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-3 py-2 text-sm font-black text-white">Open Market Buddy</Link>
              <Link to={CLUB_LINKS.onboarding} className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-bold text-violet-800 dark:border-white/15 dark:bg-transparent dark:text-white">Update context</Link>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <ClubRoadmapSection />
        </section>

        <section className="mt-10">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Keep moving</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quick.map(({ title, desc, href, icon: Icon }) => (
              <Link key={title} to={href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.03]">
                <Icon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="text-xs text-slate-500">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
