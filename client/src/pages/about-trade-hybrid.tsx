import React from 'react';
import { Bot, BookOpen, Copy, Network, Radio, Trophy, Users, WalletCards } from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';

const products = [
  ['Hybrid Journal', 'Your trading record, analytics, alerts, and review workflow.', CLUB_LINKS.journal, BookOpen],
  ['Hybrid Copy', 'The Base44 trade-copying and routing system for connected accounts and signals.', CLUB_LINKS.copy, Copy],
  ['ABATEV', 'The conversational trading and automation interface.', CLUB_LINKS.abatev, Bot],
  ['Hybrid Zone', 'The execution/control layer connecting the trading ecosystem.', CLUB_LINKS.zone, Network],
  ['Trade House', 'Live trader battles, public performance, and competition.', CLUB_LINKS.battles, Trophy],
  ['Hybrid Funding', 'The funding path inside the wider Trade Hybrid ecosystem.', CLUB_LINKS.funding, WalletCards],
  ['Trade Hybrid TV', 'Live programming, battles, shows, education, and market content.', CLUB_LINKS.tv, Radio],
  ['Community', 'Discussion, accountability, education, events, and member connection.', CLUB_LINKS.community, Users],
] as const;

export default function AboutTradeHybridPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#070b14] dark:text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">About Trade Hybrid</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
          One trading ecosystem. Each product has a job.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Trade Hybrid Club is the member hub that connects the tools, community, education, automation, competition, and funding paths around a trader’s actual game plan. The goal is not to trap members inside one giant app. It is to give them one identity and a clear path into the right product when they need it.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map(([title, desc, href, Icon]) => {
            const external = /^https?:/i.test(href);
            const body = (
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                <h2 className="mt-5 text-lg font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
              </div>
            );
            return external ? (
              <a key={title} href={href} target="_blank" rel="noreferrer">{body}</a>
            ) : (
              <a key={title} href={href}>{body}</a>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50 p-7 dark:border-cyan-400/20 dark:bg-cyan-400/10">
          <h2 className="text-2xl font-black">The Club should simplify the ecosystem—not duplicate it.</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-700 dark:text-slate-300">
            Journal owns the record. Copy owns routing. ABATEV owns conversational assistance. Hybrid Zone owns execution/control. Trade House owns competition. TV owns programming. Community owns connection. The Club ties those experiences together around one member journey.
          </p>
        </section>
      </div>
    </main>
  );
}
