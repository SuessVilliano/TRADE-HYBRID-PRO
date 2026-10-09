import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rewardTotals} from '../client/src/lib/rewards-model';
import type {RewardEntry} from '../client/src/lib/services/rewards-service';
const entries=[{id:'1',description:'Lesson reward',asset:'THC',amount:10,status:'pending',created_at:'2026-10-08'},{id:'2',description:'Referral',asset:'USDC',amount:5,status:'approved',created_at:'2026-10-08'},{id:'3',description:'Reversed referral',asset:'USDC',amount:8,status:'reversed',created_at:'2026-10-08'},{id:'4',description:'Delivered reward',asset:'THC',amount:2,status:'paid',created_at:'2026-10-08'}] as RewardEntry[];
test('Pending rewards never count as approved or paid',()=>{assert.deepEqual(rewardTotals(entries,'pending'),{THC:10});assert.deepEqual(rewardTotals(entries,'approved'),{USDC:5});assert.deepEqual(rewardTotals(entries,'paid'),{THC:2});});
test('Distinct reward assets stay separate and reversed rewards are excluded',()=>{assert.deepEqual(rewardTotals([...entries,{...entries[1],asset:'THC',amount:4}],'approved'),{USDC:5,THC:4});});
test('Empty ledger has no invented balance',()=>assert.deepEqual(rewardTotals([],'paid'),{}));
