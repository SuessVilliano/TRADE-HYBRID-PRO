import { authService } from './auth-service';
const URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/,'');
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';
export type RewardEntry = {id:string;description:string;asset:'THC'|'USDC'|'credit'|'perk';amount:number;status:'pending'|'approved'|'paid'|'reversed';created_at:string;transaction_signature?:string};
export type RewardsSnapshot = {onboarding:boolean;lessons:number;quizzes:number;credentials:number;communityLearners:number;inviteCode:string|null;referrals:{id:string;status:string;created_at:string}[];ledger:RewardEntry[];campaigns:{id:string;title:string;goal:number;status:string;description:string;funded_usdc:number;funded_thc:number}[]};
export async function rewardsRpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
 const token=await authService.getAccessToken();if(!token)throw new Error('Sign in to view your rewards.');
 const response=await fetch(URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(response.status===401?'Your session expired. Please sign in again.':'Rewards are temporarily unavailable. Please retry.');
 return response.json();
}
export const getRewards=()=>rewardsRpc<RewardsSnapshot>('rewards_snapshot');
export const createInvite=()=>rewardsRpc<string>('rewards_invite_code');
export const acceptInvite=(code:string)=>rewardsRpc<string>('rewards_accept_invite',{invite_code:code});
export {rewardTotals} from '../rewards-model';
