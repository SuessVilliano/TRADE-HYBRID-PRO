import React, { useEffect, useRef, useState } from 'react';
import { Copy, RefreshCw, Signal } from 'lucide-react';
import { notificationService } from '@/lib/notifications';
import { authService } from '@/lib/services/auth-service';
import { CLUB_LINKS } from '@/lib/club-links';
import { normalizeSignal, signalTimestamp, signalStatusLabel } from '@/lib/signal-model';
const FEED = import.meta.env.VITE_SIGNALS_FEED_URL || 'https://szcnpugeztcawwjcopob.supabase.co/functions/v1/club-signals-feed';
type FeedSignal = ReturnType<typeof normalizeSignal>;
export function TradingSignals() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [provider, setProvider] = useState('all');
  const [status, setStatus] = useState('all');
  const [asOf, setAsOf] = useState<string | null>(null);
  const active = useRef(true);
  const busy = useRef(false);
  const seen = useRef<Set<string> | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    try {
      const token = await authService.getAccessToken();
      if (!token) throw new Error('Sign in to Trade Hybrid Club to view signals.');
      const [response, resultsResponse] = await Promise.all([
        fetch(FEED + '?limit=250', { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(15000) }),
        fetch(FEED + '?limit=100&status=results', { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(15000) })
      ]);
      const body = await response.json();
      if (!response.ok) {
        if ([401,403].includes(response.status) && active.current) setSignals([]);
        throw new Error(response.status === 403 ? 'An active membership is required to view signals.' : body.error || 'Signal feed unavailable.');
      }
      if (!resultsResponse.ok) throw new Error('Outcome history is unavailable. Please retry.');
      const results = await resultsResponse.json();
      const merged = Array.from(new Map([...(body.signals || []), ...(results.signals || [])].map(s => [s.id,s])).values()).sort((a:any,b:any)=>Date.parse(b.entryTime || '')-Date.parse(a.entryTime || ''));
      const normalized = merged.map(normalizeSignal);
      if (active.current && seen.current) normalized.filter(s => !seen.current!.has(s.id) && s.group !== 'closed' && s.entryPrice !== null && s.entryTime && Date.now() - Date.parse(s.entryTime) < 120000).forEach(s => notificationService.showSignalNotification({id:s.id,symbol:s.symbol,type:s.direction==='SHORT'?'sell':'buy',entry:s.entryPrice!,source:s.provider,timestamp:s.entryTime}));
      seen.current = new Set(normalized.map(s => s.id));
      if (active.current) { setSignals(normalized); setAsOf(new Date().toISOString()); setError(''); }
    } catch (e) { if (active.current) setError(e instanceof Error ? e.message : 'Unable to refresh signals.'); }
    finally { busy.current = false; if (active.current) { setLoading(false); setRefreshing(false); } }
  }
  useEffect(() => { active.current = true; refresh(); const timer = setInterval(refresh, 30000); return () => { active.current = false; clearInterval(timer); }; }, []);
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setFeedback(label + ' copied'); }
    catch { setFeedback('Clipboard unavailable. Select the price and copy it manually.'); }
  }
  function price(signal: FeedSignal, label: string, value: number | null, hit = false) {
    return <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}{hit && <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">Hit</span>}</div>
      <div className="mt-1 flex items-center justify-between gap-2"><span className="font-semibold tabular-nums">{value ?? 'Not supplied'}</span>{value !== null && <button type="button" aria-label={'Copy ' + label + ' for ' + signal.symbol} title={'Copy ' + label} onClick={() => copy(String(value), label)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-slate-800"><Copy size={15}/></button>}</div>
    </div>;
  }
  const visible = signals.filter(s => (provider === 'all' || s.provider === provider) && (status === 'all' || s.group === status));
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-950 dark:bg-[#070b14] dark:text-white sm:p-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6"><div className="flex items-center gap-3"><Signal className="text-cyan-600"/><h1 className="text-3xl font-black">Hybrid Signals</h1></div><p className="mt-2 text-slate-500 dark:text-slate-400">Canonical provider signals and reported outcomes. Updates every 30 seconds.</p></header>
    <div className="mb-4 flex flex-wrap items-center gap-3"><label>Provider <select aria-label="Signal provider" value={provider} onChange={e => setProvider(e.target.value)} className="ml-2 rounded-lg border bg-white p-2 dark:bg-slate-900"><option value="all">All providers</option>{Array.from(new Set(signals.map(s => s.provider).filter(Boolean))).map(p => <option key={p} value={p}>{p}</option>)}</select></label><label>Status <select aria-label="Signal status" value={status} onChange={e => setStatus(e.target.value)} className="ml-2 rounded-lg border bg-white p-2 dark:bg-slate-900">{['all','pending','active','closed','cancelled','unknown'].map(s => <option key={s} value={s}>{s === 'all' ? 'All signals' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></label><button type="button" disabled={refreshing} onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''}/>Refresh</button></div>
    <p className="mb-4 text-xs text-slate-500">Times shown in {timezone}, with UTC below each signal. {asOf && 'Last refresh: ' + signalTimestamp(asOf)}</p>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error} {signals.length > 0 && 'Showing the last successful feed; results may be stale.'}</p>}
    <p role="status" aria-live="polite" className="mb-3 min-h-5 text-sm text-violet-700 dark:text-violet-300">{feedback}</p>
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Loaded',signals.length],['Pending',signals.filter(s=>s.group==='pending').length],['Active',signals.filter(s=>s.group==='active').length],['Results',signals.filter(s=>s.group==='closed').length]].map(([label,count])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-2xl font-bold">{count}</p><p className="text-sm text-slate-500">{label}</p></div>)}</div>
    {loading ? <p>Loading signals…</p> : !visible.length ? <p className="rounded-xl border p-6">No signals match this filter.</p> : <div className="grid gap-5 lg:grid-cols-2">{visible.map(s => <article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{s.symbol} <span className={s.direction === 'SHORT' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>{s.direction === 'SHORT' ? 'SELL' : s.direction === 'LONG' ? 'BUY' : s.direction}</span></h2><p className="mt-1 text-sm text-slate-500">{s.provider} · {s.timeframe || 'Timeframe unavailable'}</p></div><span className={'rounded-full px-3 py-1 text-xs font-bold ' + (s.group === 'closed' ? 'bg-violet-100 text-violet-800' : s.group === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700')}>{signalStatusLabel(s.status)}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2">{price(s,'Entry',s.entryPrice)}{price(s,'Stop loss',s.stopLoss,s.status==='SL_HIT')}{s.targets.map((v: number | null,i: number)=> price(s,'Take profit ' + (i+1),v, /^TP[123]_HIT$/.test(s.status) && Number(s.status[2]) >= i+1))}</div>
      <p className="mt-4 text-sm text-slate-500">{s.strategyName || s.assetClass}</p>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800"><strong>Reported result: </strong>{s.group === 'closed' ? <>{s.closeReason || signalStatusLabel(s.status)}{s.exitPrice !== null && ' · Exit ' + s.exitPrice}{s.rValue !== null && ' · ' + s.rValue + 'R'}{s.pnlPct !== null && ' · ' + s.pnlPct + '%'}</> : s.status.startsWith('TP') ? signalStatusLabel(s.status) : 'Awaiting an outcome update'}{s.lastPrice !== null && <p className="mt-1">Last price: {s.lastPrice} · {signalTimestamp(s.lastPriceAt)}</p>}{s.closedAt && <p className="mt-1">Closed: {signalTimestamp(s.closedAt)}</p>}</div>
      <div className="mt-4 text-xs leading-5 text-slate-500"><p>Signal: {signalTimestamp(s.entryTime)} · {timezone}</p><p>{signalTimestamp(s.entryTime,'UTC')} (UTC)</p></div>
      <div className="mt-4 flex gap-3"><button type="button" className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 font-bold text-white" onClick={() => copy([s.direction + ' ' + s.symbol,'Entry: ' + (s.entryPrice ?? 'Not supplied'),'Stop loss: ' + (s.stopLoss ?? 'Not supplied'),...s.targets.map((v: number | null,i: number) => 'TP' + (i+1) + ': ' + (v ?? 'Not supplied')),signalStatusLabel(s.status),'Signal: ' + signalTimestamp(s.entryTime,'UTC')].join('\n'),'Signal')}>Copy signal</button><a href={CLUB_LINKS.abatev} target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-2 font-bold">Open ABATEV ↗</a></div>
    </article>)}</div>}
  </div></main>;
}
