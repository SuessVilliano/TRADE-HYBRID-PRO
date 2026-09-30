import React, { useEffect, useState } from 'react';
import { CalendarDays, ExternalLink, Radio, RefreshCw, Trophy, Tv2, Video } from 'lucide-react';
import memberJourneyService from '@/lib/services/member-journey-service';

const TV_EMBED = 'https://player.viloud.tv/embed/channel/6b3e6d6696fb33d051c1ca4b341d21cf?autoplay=1&volume=1&controls=1&title=1&share=1&open_playlist=0&random=0';

const programming = [
  ['Sunday', 'Hybrid Picks', 'Predictions, picks, matchup board and recap', Trophy],
  ['Monday', 'Market Watch Mondays', 'Weekly context, watchlist, levels and setups', CalendarDays],
  ['Wednesday', 'Wednesday Live', 'Live trading, screen share and member session', Video],
  ['Saturday', 'Super Saturdays', 'Club, Funding, Academy and affiliate presentations', Tv2],
] as const;

export default function HybridTVPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    memberJourneyService.markAccess('tv', true).catch(() => null);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070b14] dark:text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
              <Radio className="h-4 w-4" /> Trade Hybrid TV
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">One channel for the Trade Hybrid network.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Battles, market programming, education, presentations and the recurring shows that keep the Club active throughout the week.
            </p>
          </div>
          <a
            href={TV_EMBED}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-black text-white"
          >
            Open TV full screen <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-black shadow-xl dark:border-white/10">
          {!loaded && (
            <div className="absolute inset-0 z-0 grid place-items-center text-white">
              <div className="text-center">
                <RefreshCw className="mx-auto h-9 w-9 animate-spin text-cyan-300" />
                <p className="mt-4 text-sm text-slate-300">Loading Trade Hybrid TV…</p>
              </div>
            </div>
          )}
          <div className="relative z-10 aspect-video w-full">
            <iframe
              src={TV_EMBED}
              title="Trade Hybrid TV"
              className="absolute inset-0 h-full w-full border-0 bg-black"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Weekly programming</p>
              <h2 className="mt-1 text-2xl font-black">The Trade Hybrid rhythm</h2>
            </div>
            <a href="/access/trade-house" className="hidden text-sm font-black text-violet-600 dark:text-violet-300 sm:inline-flex">Enter Trade House</a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {programming.map(([day,title,text,Icon]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">{day}</p>
                <h3 className="mt-1 font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
