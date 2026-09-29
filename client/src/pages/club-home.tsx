import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Copy,
  Moon,
  Network,
  Radio,
  Sparkles,
  Sun,
  TerminalSquare,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';
import { useTheme } from '@/lib/hooks/useTheme';
import ClubAIAgentsSection from '@/components/club/club-ai-agents-section';
import ClubPricingSection from '@/components/club/club-pricing-section';
import ClubTestimonialsSection from '@/components/club/club-testimonials-section';
import ClubContactSection from '@/components/club/club-contact-section';
import ClubFooter from '@/components/club/club-footer';

const ecosystem = [
  {
    title: 'Hybrid Journal',
    label: 'Memory layer',
    text: 'Trades, notes, reports, alerts, review, and the long-term record of how you actually trade.',
    icon: BookOpen,
    href: CLUB_LINKS.journal,
    tone: 'from-violet-600 to-purple-500',
  },
  {
    title: 'Market Buddy AI',
    label: 'Trade Hybrid AI',
    text: 'Your primary AI companion, grounded in your WHY, goals, Club journey, Journal, and access.',
    icon: Bot,
    href: CLUB_LINKS.ai,
    tone: 'from-violet-600 via-blue-500 to-cyan-500',
  },
  {
    title: 'ABATEV Terminal',
    label: 'Trading cockpit',
    text: 'The terminal/control surface that can grow into broker-agnostic execution, routing, and connected market tools.',
    icon: TerminalSquare,
    href: CLUB_LINKS.terminal,
    tone: 'from-slate-700 via-blue-600 to-cyan-500',
  },
  {
    title: 'Trade House',
    label: 'Compete',
    text: 'Practice battles, verified Hybrid Funding proof, live rooms, producer tools, leaderboards, and broadcast.',
    icon: Trophy,
    href: CLUB_LINKS.battles,
    tone: 'from-fuchsia-500 to-violet-600',
  },
  {
    title: 'Hybrid Copy',
    label: 'Copy + routing',
    text: 'Copy relationships, broker connections, risk rules, and signal-to-execution workflows.',
    icon: Copy,
    href: CLUB_LINKS.copy,
    tone: 'from-blue-600 to-cyan-500',
  },
  {
    title: 'Hybrid Zone',
    label: 'Control layer',
    text: 'The execution and control layer connecting services across the Trade Hybrid ecosystem.',
    icon: Network,
    href: CLUB_LINKS.zone,
    tone: 'from-cyan-500 to-emerald-500',
  },
  {
    title: 'Hybrid Funding',
    label: 'Funding',
    text: 'Funding paths plus the verified public-dashboard proof that powers Trade House competition.',
    icon: WalletCards,
    href: CLUB_LINKS.funding,
    tone: 'from-violet-600 to-blue-500',
  },
  {
    title: 'Community + TV',
    label: 'People + media',
    text: 'Community, education, live sessions, events, shows, battles, and the content layer around the traders.',
    icon: Radio,
    href: CLUB_LINKS.community,
    tone: 'from-purple-600 to-cyan-500',
  },
];

function OpenLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return /^https?:/i.test(href) ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export default function ClubHome() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-[#070a12] dark:text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#070a12]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <img
                src="https://tradehybrid.co/trade-hybrid-logo.png"
                alt="Trade Hybrid mascot"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.18em]">TRADE HYBRID</p>
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Club</p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <a href="#ecosystem" className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">Ecosystem</a>
            <a href="#ai-team" className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">Market Buddy</a>
            <a href="#members" className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">Members</a>
            <a href="#membership" className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">Membership</a>
            <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-300">Contact</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl border border-violet-100 bg-white text-slate-700 shadow-sm hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              to={CLUB_LINKS.login}
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-white/5 sm:block"
            >
              Log in
            </Link>

            <Link
              to={CLUB_LINKS.register}
              className="rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-violet-500/15"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative border-b border-slate-100 dark:border-white/10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 lg:block" />

        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 px-5 py-16 sm:px-8 sm:py-24 lg:py-32 lg:pr-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/[0.08] dark:text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> One connected trading ecosystem
            </div>

            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-7xl">
              Trade Hybrid,
              <span className="block bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                made connected.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              One identity for your Journal, Market Buddy AI, terminal, alerts, copy tools, Academy, Trade House, community, funding, media, and the trader you are building into.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={CLUB_LINKS.register}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-6 py-3 font-black text-white shadow-xl shadow-violet-500/20"
              >
                Start your journey <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#membership"
                className="rounded-xl border border-violet-200 bg-white px-6 py-3 font-black text-violet-700 hover:bg-violet-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
              >
                View membership
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span><strong className="text-slate-950 dark:text-white">1</strong> Club identity</span>
              <span><strong className="text-slate-950 dark:text-white">1</strong> trader journey</span>
              <span><strong className="text-slate-950 dark:text-white">Many</strong> connected products</span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 px-5 py-14 text-white sm:px-8 lg:min-h-full lg:px-12 lg:py-20">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />

            <div className="relative mx-auto max-w-xl">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/25 bg-white/15 backdrop-blur-xl">
                  <img
                    src="https://tradehybrid.co/trade-hybrid-logo.png"
                    alt="Trade Hybrid Market Buddy mascot"
                    className="h-16 w-16 object-contain"
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Meet your AI</p>
                  <h2 className="mt-1 text-3xl font-black">Market Buddy</h2>
                  <p className="mt-1 text-sm text-white/75">The face of Trade Hybrid AI.</p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  ['WHY', 'Your reason'],
                  ['PLAN', 'Your path'],
                  ['DATA', 'Your Journal'],
                  ['ACCESS', 'Your tools'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="mt-1 text-sm text-white/75">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/20 bg-black/10 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Humans + robots + automation</p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  The original Trade Hybrid idea still works. Community wisdom, AI assistance, and automated systems should work together—and the Club gives those pieces one member journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">The ecosystem</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Everything has a job.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            The Club should not duplicate every product. It should make every product easier to discover, access, and use together.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ecosystem.map(({ title, label, text, icon: Icon, href, tone }) => (
            <OpenLink key={title} href={href}>
              <article className="group h-full rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-violet-300/30">
                <div className="flex items-center justify-between">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-violet-600 dark:group-hover:text-violet-300" />
                </div>

                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.17em] text-violet-600 dark:text-violet-300">{label}</p>
                <h3 className="mt-2 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
              </article>
            </OpenLink>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-4 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 p-7 text-white shadow-2xl shadow-violet-500/15 sm:p-10">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">The original idea, upgraded</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Humans. Robots. Automations.</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
              Community gives the human edge. Market Buddy and specialist AI modes help interpret the journey. Automation connects the tools so the trader spends less time moving data and more time improving.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['HUMANS', 'Community, coaches, traders, teams, live sessions, battles, and events.', Users],
              ['ROBOTS', 'Market Buddy plus focused AI modes that use shared Club context.', Bot],
              ['AUTOMATIONS', 'Journal sync, alerts, copy routing, execution context, onboarding, and reporting.', Network],
            ].map(([title, text, Icon]: any) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <Icon className="h-5 w-5" />
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ClubAIAgentsSection />
      <ClubTestimonialsSection />
      <ClubPricingSection />
      <ClubContactSection />
      <ClubFooter />
    </main>
  );
}
