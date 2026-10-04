import React from 'react';
import { BrainCircuit, Network, Sparkles, Users } from 'lucide-react';

const pillars = [
  {
    title: 'Human first',
    text: 'Trading is still a human skill. Community, accountability, education, and personal judgment stay at the center.',
    icon: Users,
  },
  {
    title: 'AI that knows the journey',
    text: 'Market Buddy is designed to work from your WHY, goals, Journal context, alerts, and connected Trade Hybrid activity.',
    icon: BrainCircuit,
  },
  {
    title: 'Connected tools',
    text: 'Journal, alerts, terminal, copy, battles, community, funding, media, and events should feel like one ecosystem—not separate logins and dead ends.',
    icon: Network,
  },
] as const;

export default function ClubAboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/[0.08] dark:text-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> About Trade Hybrid
          </div>

          <h2 className="font-display mt-5 text-4xl font-medium tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            One trading ecosystem. Each product has a job.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            Trade Hybrid is building a connected environment around the trader’s actual journey: learn, plan, trade, review, improve, compete, connect, and grow. The Club is the front door that ties those experiences together under one identity.
          </p>

          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            We are not trying to force every feature into one giant screen. Hybrid Journal should own the record. Market Buddy should own the AI relationship. ABATEV should become the terminal. Trade House should own competition. Community should own connection. Hybrid Funding should remain a funding path. The value is how those pieces work together.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className="group rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 text-white transition group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
