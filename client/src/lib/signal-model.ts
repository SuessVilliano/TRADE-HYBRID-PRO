export function signalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function normalizeSignal(raw: any) {
  const status = String(raw.status || 'UNKNOWN').toUpperCase();
  const group = ['SL_HIT', 'TP3_HIT', 'CLOSED'].includes(status) ? 'closed'
    : ['INVALID', 'CANCELLED', 'CANCELED'].includes(status) ? 'cancelled'
    : status === 'PENDING' ? 'pending' : ['ACTIVE', 'ACTIVATED', 'TP1_HIT', 'TP2_HIT'].includes(status) ? 'active' : 'unknown';
  return { ...raw, id: String(raw.id), status, group,
    direction: String(raw.direction || '').toUpperCase(),
    entryPrice: signalNumber(raw.entryPrice), stopLoss: signalNumber(raw.stopLoss),
    targets: [raw.tp1 ?? raw.takeProfit, raw.tp2, raw.tp3].map(signalNumber),
    exitPrice: signalNumber(raw.exitPrice), rValue: signalNumber(raw.rValue), pnlPct: signalNumber(raw.pnlPct),
    lastPrice: signalNumber(raw.lastPrice),
    entryTime: raw.entryTime || null };
}
export function signalTimestamp(value: unknown, timeZone?: string) {
  if (!value || !Number.isFinite(Date.parse(String(value)))) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long', timeZone }).format(new Date(String(value)));
}
export const signalStatusLabel = (status: string) => ({ PENDING: 'Pending entry', ACTIVE: 'Active', ACTIVATED: 'Active', TP1_HIT: 'TP1 hit', TP2_HIT: 'TP2 hit', TP3_HIT: 'TP3 hit', SL_HIT: 'Stop loss hit', CLOSED: 'Closed', INVALID: 'Invalid', CANCELLED: 'Cancelled', CANCELED: 'Cancelled' }[status] || status);
