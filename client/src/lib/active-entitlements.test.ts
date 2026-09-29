import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeEntitlements } from './active-entitlements';

test('access excludes expired, future, cancelled, and invalid periods', () => {
  const now = Date.parse('2026-09-29T12:00:00Z');
  const rows = [
    { status: 'active', id: 'lifetime' },
    { status: 'trialing', id: 'trial', ends_at: '2026-09-30T00:00:00Z' },
    { status: 'active', id: 'expired', ends_at: '2026-09-29T12:00:00Z' },
    { status: 'active', id: 'future', starts_at: '2026-09-30T00:00:00Z' },
    { status: 'cancelled', id: 'cancelled' },
    { status: 'active', id: 'invalid', ends_at: 'not-a-date' },
  ];
  assert.deepEqual(activeEntitlements(rows, now).map(row => row.id), ['lifetime', 'trial']);
});
