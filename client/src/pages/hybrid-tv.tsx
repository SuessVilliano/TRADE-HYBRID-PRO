import React, { useEffect, useState } from 'react';
import { ExternalLink, Radio, RefreshCw } from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';
import memberJourneyService from '@/lib/services/member-journey-service';

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
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
              <Radio className="h-4 w-4" /> Trade Hybrid TV
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Live shows, battles, education, and market programming.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              This page loads the real white-labelled Trade Hybrid TV channel instead of the old Pro livestream placeholder.
            </p>
          </div>
          <a
            href={CLUB_LINKS.tvExternal}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            Open TV full screen <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <section className="relative min-h-[72vh] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm dark:border-white/10">
          {!loaded && (
            <div className="absolute inset-0 z-0 grid place-items-center text-white">
              <div className="text-center">
                <RefreshCw className="mx-auto h-9 w-9 animate-spin text-cyan-300" />
                <p className="mt-4 text-sm text-slate-300">Loading Trade Hybrid TV…</p>
              </div>
            </div>
          )}
          <iframe
            src={CLUB_LINKS.tvExternal}
            title="Trade Hybrid TV"
            className="relative z-10 h-[78vh] min-h-[620px] w-full border-0 bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        </section>
      </div>
    </main>
  );
}
