import React from 'react';
import {
  BellRing,
  BookOpen,
  Copy,
  GraduationCap,
  RadioTower,
  Repeat2,
  ShieldCheck,
  Swords,
  TerminalSquare,
  Users,
  WalletCards,
} from 'lucide-react';

const layers = [
  {
    stage: 'NOW',
    title: 'Club identity + journey',
    text: 'One account, onboarding, WHY, goals, access, Market Buddy context, and a dashboard that routes members into the real products.',
    icon: Users,
  },
  {
    stage: 'NOW → NEXT',
    title: 'Journal + alerts as the memory layer',
    text: 'Every trade, alert, signal, note, report, and battle result should feed one durable trading record instead of disappearing into separate apps.',
    icon: BookOpen,
  },
  {
    stage: 'NEXT',
    title: 'ABATEV becomes the terminal',
    text: 'A broker-agnostic cockpit that can connect to supported brokers and prop platforms headlessly, with the Journal receiving execution context automatically.',
    icon: TerminalSquare,
  },
  {
    stage: 'NEXT',
    title: 'Hybrid Copy becomes real execution routing',
    text: 'Copy relationships, allocation rules, risk controls, signal intake, and execution logs become a real system—not just a page that says copy trading.',
    icon: Copy,
  },
  {
    stage: 'NEXT',
    title: 'Alerts become a signal intelligence system',
    text: 'Persist signals and webhooks, cap abuse intelligently, tag outcomes, generate reports, and let Market Buddy learn from what actually fired and what happened next.',
    icon: BellRing,
  },
  {
    stage: 'GROWTH',
    title: 'Academy teaches the Trade Hybrid way',
    text: 'Structured pathways, quizzes, practice, Journal assignments, live sessions, and proof of progress—not a generic video library.',
    icon: GraduationCap,
  },
  {
    stage: 'GROWTH',
    title: 'Trade House becomes the competitive network',
    text: 'Practice battles, verified proof, live rooms, leaderboards, producer tools, broadcasts, leagues, records, prizes, and eventually the first destination people associate with trader competition.',
    icon: Swords,
  },
  {
    stage: 'GROWTH',
    title: 'Community → events → funding',
    text: 'The community and competition create the audience; events deepen the relationship; Hybrid Funding gives qualified traders somewhere to go next.',
    icon: WalletCards,
  },
  {
    stage: 'LONG TERM',
    title: 'Token utility becomes measurable',
    text: 'THC should only gain utility we can actually prove: access, rewards, holder status, transparent locking/treasury visibility, and—only after technical and legal design—possible staking-style utility.',
    icon: ShieldCheck,
  },
];

export default function ClubRoadmapSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-white/[0.025]">
        <div className="grid gap-0 lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-7 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Where this is going</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">One trading operating system.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80">
              Not nine disconnected apps. One trader identity moving through research, execution, review, learning, competition, community, funding, and rewards.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ['Terminal', TerminalSquare],
                ['Journal + Alerts', BellRing],
                ['Copy + Routing', Repeat2],
                ['Battles + Broadcast', RadioTower],
              ].map(([label, Icon]: any) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-black">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-px bg-violet-100 dark:bg-white/10 sm:grid-cols-2">
            {layers.map(({ stage, title, text, icon: Icon }) => (
              <article key={title} className="bg-white p-6 dark:bg-[#0b1020]">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-300/[0.08] dark:text-violet-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-violet-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-violet-600 dark:border-white/10 dark:text-violet-300">
                    {stage}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
