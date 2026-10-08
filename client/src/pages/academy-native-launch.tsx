import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth-service';
const SUPABASE_URL='https://uqtluroceakqtlvlzatt.supabase.co';
const SUPABASE_KEY='sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';
const allowed=new Set(['https://academy.tradehybrid.co','https://trade-hybrid-academy-native.vercel.app']);
export default function AcademyNativeLaunchPage(){
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;async function launch(){try{
  const params=new URLSearchParams(window.location.search);
  const returnOrigin=params.get('returnOrigin')||'';const challenge=params.get('challenge')||'';
  if(!allowed.has(returnOrigin)||!/^[A-Za-z0-9_-]{43}$/.test(challenge))throw new Error('Start the native Academy preview from its sign-in page.');
  const accessToken=await authService.getAccessToken();
  if(!accessToken){const next=window.location.pathname+window.location.search;window.location.replace('/login?next='+encodeURIComponent(next));return;}
  const response=await fetch(SUPABASE_URL+'/functions/v1/academy-sso',{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:'Bearer '+accessToken},body:JSON.stringify({action:'start',returnOrigin,challenge})});
  const body=await response.json();if(!response.ok||!body.code||body.returnTo!==returnOrigin+'/sso')throw new Error(body.error||'Academy membership could not be verified.');
  if(active)window.location.replace(body.returnTo+'#code='+encodeURIComponent(body.code));
 }catch(e){if(active)setError(e instanceof Error?e.message:'Academy did not open.');}}
 void launch();return()=>{active=false;};},[]);
 return <main className="fixed inset-0 z-50 grid place-items-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white"><section className="max-w-md rounded-3xl border border-violet-200 bg-white p-8 text-center dark:border-violet-800 dark:bg-slate-900"><h1 className="text-2xl font-bold">{error?'Academy could not open.':'Opening the native Academy…'}</h1><p className="mt-4 text-sm" role={error?'alert':'status'}>{error||'Your Club identity and Academy membership are being verified.'}</p><a className="mt-6 block text-sm text-violet-600" href="https://trade-hybrid-academy-native.vercel.app">Return to the native Academy</a><a className="mt-3 block text-sm" href="/dashboard">Back to Club</a></section></main>;
}
