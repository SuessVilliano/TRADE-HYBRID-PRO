import React from 'react';
import { TradingViewMarketOverview } from '@/components/ui/tradingview-market-overview';
import { TradingViewEconomicCalendar } from '@/components/ui/tradingview-economic-calendar';
import { useTheme } from '@/lib/hooks/useTheme';
import { CLUB_LINKS } from '@/lib/club-links';
export default function TradingToolsPage() {
  const { resolvedTheme } = useTheme();
  return <main className="pro-theme-surface min-h-screen bg-slate-50 p-4 text-slate-950 dark:bg-[#070b14] dark:text-white sm:p-8"><div className="mx-auto max-w-7xl"><h1 className="text-3xl font-black">Markets</h1><p className="mt-2 mb-6 text-slate-500">Follow indices, forex, crypto, and upcoming economic releases. Quotes are supplied by TradingView and may be delayed.</p><div className="grid gap-6 lg:grid-cols-2"><section className="overflow-hidden rounded-2xl border bg-white dark:bg-slate-900"><TradingViewMarketOverview colorTheme={resolvedTheme} height={600}/></section><section className="overflow-hidden rounded-2xl border bg-white dark:bg-slate-900"><TradingViewEconomicCalendar colorTheme={resolvedTheme} height={600}/></section></div><a className="mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 font-bold text-white" href={CLUB_LINKS.news} target="_blank" rel="noreferrer">Read Trade Hybrid News ↗</a></div></main>;
}
