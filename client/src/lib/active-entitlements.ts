type Entitlement = { status: string; starts_at?: string | null; ends_at?: string | null };

// Display gating only: product APIs must enforce access on the server too.
export function activeEntitlements<T extends Entitlement>(items: T[], now = Date.now()): T[] {
  return items.filter(item => {
    if (!['active', 'trialing'].includes(item.status)) return false;
    const starts = item.starts_at == null ? -Infinity : Date.parse(item.starts_at);
    const ends = item.ends_at == null ? Infinity : Date.parse(item.ends_at);
    return starts <= now && now < ends;
  });
}
