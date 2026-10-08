import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellOff,
  Clock,
  Copy,
  ExternalLink,
  Signal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { notificationService, type SignalNotification } from '../lib/notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/services/auth-service';

const SIGNAL_FEED_URL =
  import.meta.env.VITE_SIGNALS_FEED_URL ||
  'https://szcnpugeztcawwjcopob.supabase.co/functions/v1/club-signals-feed';

type DisplayStatus = 'pending' | 'active' | 'closed' | 'cancelled';

interface TradingSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number | null;
  stopLoss: number | null;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  timestamp: string;
  source: string;
  risk: number | null;
  assetClass: string;
  timeframe: string;
  canonicalStatus: string;
  strategyName: string | null;
  status: DisplayStatus;
}

const providerTimeframe = (provider: string) => {
  const normalized = provider.toLowerCase();
  if (normalized.includes('solaris')) return '5m';
  if (normalized.includes('hybrid')) return '10m';
  if (normalized.includes('paradox')) return '30m';
  return 'Live';
};

const displayStatus = (rawStatus: string): DisplayStatus => {
  if (rawStatus === 'PENDING') return 'pending';
  if (rawStatus === 'INVALID') return 'cancelled';
  if (['SL_HIT', 'TP3_HIT', 'CLOSED'].includes(rawStatus)) return 'closed';
  return 'active';
};

const formatStatus = (status: string) => status.replaceAll('_', ' ');

const numberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (value: number | null) => {
  if (value === null) return '—';
  if (Math.abs(value) < 10) return value.toFixed(5).replace(/0+$/, '').replace(/.$/, '');
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

export function TradingSignals() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [previousSignals, setPreviousSignals] = useState<TradingSignal[]>([]);

  const providers = useMemo(
    () => ['all', ...Array.from(new Set(signals.map((signal) => signal.source).filter(Boolean))).sort()],
    [signals],
  );

  const statusOptions = ['active', 'pending', 'all', 'closed', 'cancelled'];

  const fetchSignals = async () => {
    try {
      const accessToken = await authService.getAccessToken();
      if (!accessToken) {
        setSignals([]);
        setError('Sign in to Trade Hybrid Club to view signals.');
        return;
      }

      const response = await fetch(`${SIGNAL_FEED_URL}?limit=150`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 403) {
        setSignals([]);
        setError('An active Trade Hybrid membership is required to view live signals.');
        return;
      }
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch canonical signals');
      }

      const transformedSignals: TradingSignal[] = (data.signals || []).map((apiSignal: any) => {
        const canonicalStatus = String(apiSignal.status || 'PENDING').toUpperCase();
        const source = String(apiSignal.provider || 'Unknown');
        const tp1 = numberOrNull(apiSignal.tp1 ?? apiSignal.takeProfit);

        return {
          id: String(apiSignal.id),
          symbol: String(apiSignal.symbol || 'UNKNOWN'),
          type: String(apiSignal.direction || 'LONG').toUpperCase() === 'SHORT' ? 'sell' : 'buy',
          entry: numberOrNull(apiSignal.entryPrice),
          stopLoss: numberOrNull(apiSignal.stopLoss),
          tp1,
          tp2: numberOrNull(apiSignal.tp2),
          tp3: numberOrNull(apiSignal.tp3),
          timestamp: apiSignal.entryTime || new Date().toISOString(),
          source,
          risk: numberOrNull(apiSignal.riskDistance),
          assetClass: String(apiSignal.assetClass || 'OTHER').toUpperCase(),
          timeframe: String(apiSignal.timeframe || providerTimeframe(source)),
          canonicalStatus,
          strategyName: apiSignal.strategyName ? String(apiSignal.strategyName) : null,
          status: displayStatus(canonicalStatus),
        };
      });

      setSignals(transformedSignals);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching canonical signals:', err);
      setError(err?.message || 'Failed to load trading signals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    setNotificationsEnabled(notificationService.isEnabled());
    const interval = window.setInterval(fetchSignals, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (previousSignals.length > 0 && signals.length > 0) {
      const newSignals = signals.filter(
        (signal) => !previousSignals.some((previous) => previous.id === signal.id),
      );

      newSignals.forEach((signal) => {
        const notification: SignalNotification = {
          id: signal.id,
          symbol: signal.symbol,
          type: signal.type,
          entry: signal.entry ?? 0,
          source: signal.source,
          timestamp: signal.timestamp,
        };
        notificationService.showSignalNotification(notification);
      });
    }

    if (signals.length > 0) setPreviousSignals(signals);
  }, [signals, previousSignals]);

  const filteredSignals = useMemo(
    () =>
      signals.filter((signal) => {
        const providerMatch = selectedProvider === 'all' || signal.source === selectedProvider;
        const statusMatch = selectedStatus === 'all' || signal.status === selectedStatus;
        return providerMatch && statusMatch;
      }),
    [signals, selectedProvider, selectedStatus],
  );

  const copySignalToClipboard = async (signal: TradingSignal) => {
    const targets = [
      signal.tp1 !== null ? `TP1: ${formatPrice(signal.tp1)}` : null,
      signal.tp2 !== null ? `TP2: ${formatPrice(signal.tp2)}` : null,
      signal.tp3 !== null ? `TP3: ${formatPrice(signal.tp3)}` : null,
    ].filter(Boolean);

    const signalText = `${signal.type.toUpperCase()} ${signal.symbol}
Provider: ${signal.source}
Asset: ${signal.assetClass}
Timeframe: ${signal.timeframe}
Entry: ${formatPrice(signal.entry)}
Stop Loss: ${formatPrice(signal.stopLoss)}
${targets.join('\n')}
Status: ${formatStatus(signal.canonicalStatus)}
${signal.strategyName ? `Strategy: ${signal.strategyName}\n` : ''}Time: ${new Date(signal.timestamp).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(signalText);
    } catch (err) {
      console.error('Failed to copy signal:', err);
    }
  };

  const openInTradingPlatform = (signal: TradingSignal, platform: string) => {
    const platforms = {
      dxtrade: 'https://demo.dx.trade',
      matchtrader: 'https://www.matchtrader.com',
      ctrader: 'https://ctrader.com',
      rithmic: 'https://rithmic.com',
    };

    const url = platforms[platform as keyof typeof platforms];
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    copySignalToClipboard(signal);
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) notificationService.muteAll();
    else notificationService.unmuteAll();
    setNotificationsEnabled((enabled) => !enabled);
  };

  const signalColor = (type: 'buy' | 'sell') =>
    type === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  const statusClass = (status: DisplayStatus) => {
    const classes: Record<DisplayStatus, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
      active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
      closed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
      cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
    };
    return classes[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-[#070b14] dark:text-white">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-b-blue-500 dark:border-white/10 dark:border-b-blue-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading canonical signals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-3 text-slate-950 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 dark:text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="flex items-center justify-center gap-3 text-3xl font-black sm:text-4xl">
            <Signal className="h-8 w-8 text-blue-500 sm:h-10 sm:w-10" />
            Live Trading Signals
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-blue-200 sm:text-lg">
            Canonical Trade Hybrid Signals Network
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-rose-200 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-rose-700 dark:text-rose-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
          <label className="min-w-[145px] flex-1 sm:flex-none">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Provider</span>
            <select
              value={selectedProvider}
              onChange={(event) => setSelectedProvider(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-[135px] flex-1 sm:flex-none">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={fetchSignals} variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-400 dark:text-blue-300">
            Refresh
          </Button>

          <Button
            onClick={toggleNotifications}
            variant="outline"
            className={notificationsEnabled ? 'border-emerald-300 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300' : ''}
          >
            {notificationsEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
            {notificationsEnabled ? 'Alerts on' : 'Alerts off'}
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 md:grid-cols-4">
          {[
            ['Total', signals.length],
            ['Active', signals.filter((signal) => signal.status === 'active').length],
            ['Pending', signals.filter((signal) => signal.status === 'pending').length],
            ['Closed', signals.filter((signal) => signal.status === 'closed').length],
          ].map(([label, value]) => (
            <Card key={String(label)} className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredSignals.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Signal className="mx-auto mb-4 h-14 w-14 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-bold text-slate-600 dark:text-slate-300">No signals match these filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This screen reads the same canonical signal source used by the Hybrid Wall.
              </p>
            </div>
          ) : (
            filteredSignals.map((signal) => {
              const SignalIcon = signal.type === 'buy' ? TrendingUp : TrendingDown;
              const targets = [
                ['TP1', signal.tp1],
                ['TP2', signal.tp2],
                ['TP3', signal.tp3],
              ].filter(([, value]) => value !== null) as Array<[string, number]>;

              return (
                <Card key={signal.id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <SignalIcon className={`h-5 w-5 shrink-0 ${signalColor(signal.type)}`} />
                        <CardTitle className="truncate text-xl">{signal.symbol}</CardTitle>
                      </div>
                      <Badge className={statusClass(signal.status)}>{formatStatus(signal.canonicalStatus)}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-400 dark:text-blue-300">
                        {signal.source}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {signal.assetClass} · {signal.timeframe}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Action</p>
                        <p className={`font-black ${signalColor(signal.type)}`}>{signal.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Entry</p>
                        <p className="font-bold">{formatPrice(signal.entry)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Stop Loss</p>
                        <p className="font-bold text-rose-600 dark:text-rose-400">{formatPrice(signal.stopLoss)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Risk distance</p>
                        <p className="font-bold">{signal.risk === null ? '—' : formatPrice(signal.risk)}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Targets</p>
                      {targets.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {targets.map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-emerald-50 px-2 py-2 dark:bg-emerald-500/10">
                              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{label}</p>
                              <p className="truncate text-sm font-black text-emerald-700 dark:text-emerald-300">{formatPrice(value)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No target supplied.</p>
                      )}
                    </div>

                    <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                      <p className="text-sm font-semibold">
                        {signal.strategyName || `${signal.source} signal`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(signal.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => copySignalToClipboard(signal)} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        Copy
                      </Button>

                      <div className="group relative">
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          Trade
                        </Button>
                        <div className="absolute bottom-full right-0 z-20 mb-2 hidden min-w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-xl group-hover:block dark:border-white/10 dark:bg-slate-900">
                          {[
                            ['DX Trade', 'dxtrade'],
                            ['Match Trader', 'matchtrader'],
                            ['cTrader', 'ctrader'],
                          ].map(([label, platform]) => (
                            <button
                              key={platform}
                              onClick={() => openInTradingPlatform(signal, platform)}
                              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card className="mt-8 border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <CardHeader>
            <CardTitle>Signal source of truth</CardTitle>
            <CardDescription>
              Provider, asset class, status, entry, stop and all available targets come from the canonical Trade Hybrid Signals Network.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
