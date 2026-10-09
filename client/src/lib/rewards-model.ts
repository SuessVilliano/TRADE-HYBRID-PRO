import type {RewardEntry} from './services/rewards-service';
export function rewardTotals(entries:RewardEntry[],status:RewardEntry['status']) {
 return entries.filter(e=>e.status===status).reduce<Record<string,number>>((totals,e)=>{totals[e.asset]=(totals[e.asset]||0)+Number(e.amount);return totals;},{});
}
