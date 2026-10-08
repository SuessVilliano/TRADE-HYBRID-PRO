import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeSignal, signalTimestamp } from '../client/src/lib/signal-model';
test('provider pending state never becomes an active signal',()=>{assert.equal(normalizeSignal({id:'a',status:'PENDING'}).group,'pending');});
test('all targets and reported outcome survive normalization',()=>{const s=normalizeSignal({id:'a',status:'TP2_HIT',tp1:'10.25',tp2:11,tp3:12,rValue:0,pnlPct:0});assert.deepEqual(s.targets,[10.25,11,12]);assert.equal(s.status,'TP2_HIT');assert.equal(s.group,'active');assert.equal(s.rValue,0);assert.equal(s.pnlPct,0);});
test('missing prices and timestamps never become zero or current time',()=>{const s=normalizeSignal({id:'a'});assert.equal(s.entryPrice,null);assert.deepEqual(s.targets,[null,null,null]);assert.equal(s.entryTime,null);assert.equal(signalTimestamp(null),'Time unavailable');});
test('closed outcomes and invalid signals are distinguished',()=>{assert.equal(normalizeSignal({id:'a',status:'SL_HIT'}).group,'closed');assert.equal(normalizeSignal({id:'b',status:'INVALID'}).group,'cancelled');});
test('timestamps retain exact instant and explicit timezone',()=>{assert.match(signalTimestamp('2026-10-08T11:35:17Z','UTC'),/11:35:17.*UTC/);assert.equal(signalTimestamp('invalid'),'Time unavailable');});
