import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageCircle, Users, GraduationCap, CalendarDays, Trophy, Radio } from 'lucide-react';
import memberJourneyService from '@/lib/services/member-journey-service';

const TV_EMBED = 'https://player.viloud.tv/embed/channel/6b3e6d6696fb33d051c1ca4b341d21cf?autoplay=1&volume=1&controls=1&title=1&share=1&open_playlist=0&random=0';

export default function CommunityPage() {
  const communityUrl =
    import.meta.env.VITE_GHL_COMMUNITY_URL ||
    import.meta.env.VITE_COMMUNITY_URL ||
    'https://tradehybridclub.app.clientclub.net/communities/groups/trade-hybid-club/home';
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    memberJourneyService.markAccess('community', true).catch(() => null);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070b14] dark:text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
              Trade Hybrid Community
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Stay plugged into the people, not just the tools.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Discussion, learning, events, accountability, member wins, and the next things happening across Trade Hybrid.
            </p>
          </div>
          <a
            href={communityUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            Open full Community <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [MessageCircle, 'Discussion', 'Ask, share, and learn'],
            [GraduationCap, 'Learning', 'Courses and playbooks'],
            [CalendarDays, 'Events', 'Live sessions and onboarding'],
            [Trophy, 'Leaderboard', 'Progress and competition'],
            [Users, 'Members', 'Build your trading circle'],
          ].map(([Icon, title, text]: any) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              <p className="mt-3 font-black">{title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>

        <section className="mb-5 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm dark:border-violet-300/15 dark:bg-[#0c1322]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Live inside the Club</p>
                <p className="font-black">Trade Hybrid TV + Community</p>
              </div>
            </div>
            <a href="/access/trade-hybrid-tv" className="text-sm font-black text-violet-600 dark:text-violet-300">Open full TV</a>
          </div>
          <div className="aspect-video max-h-[520px] bg-black">
            <iframe
              src={TV_EMBED}
              title="Trade Hybrid TV inside Community"
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="relative min-h-[70vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c1322]">
          {!loaded && (
            <div className="absolute inset-0 z-0 grid place-items-center bg-white dark:bg-[#0c1322]">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500 dark:border-white/10 dark:border-t-cyan-300" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Opening the Trade Hybrid Community…</p>
              </div>
            </div>
          )}
          <iframe
            src={communityUrl}
            title="Trade Hybrid Community"
            className="relative z-10 h-[78vh] min-h-[650px] w-full border-0 bg-white"
            allow="clipboard-read; clipboard-write; fullscreen"
            onLoad={() => setLoaded(true)}
          />
        </section>

        <p className="mt-3 text-center text-xs text-slate-400">
          If HighLevel blocks embedded viewing for your group domain, use “Open full Community” above. The Club route stays the member’s home either way.
        </p>
      </div>
    </main>
  );
}
