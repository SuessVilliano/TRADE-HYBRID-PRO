import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
const THC_MINT = new PublicKey('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
export function ClubWallet() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance,setBalance] = useState<string | null>(null);
  const [error,setError] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{let active=true;setBalance(null);setError('');if(publicKey) connection.getParsedTokenAccountsByOwner(publicKey,{mint:THC_MINT}).then(result=>{const total=result.value.reduce((sum,a)=>sum+BigInt(a.account.data.parsed.info.tokenAmount.amount),0n);const decimals=result.value[0]?.account.data.parsed.info.tokenAmount.decimals ?? 6;const unit=10n**BigInt(decimals);const text=String(total/unit)+'.'+String(total%unit).padStart(decimals,'0');if(active)setBalance(text.replace(/\.?0+$/,''));}).catch(()=>{if(active)setError('Balance unavailable. Retry when the Solana connection is available.');});return ()=>{active=false;};},[publicKey,connection,refresh]);
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-bold">Your Solana wallet</h2><p className="my-3 text-sm text-slate-500">Connect Phantom or an available Solana wallet to view your on-chain Trade Hybrid Coin balance.</p><WalletMultiButton/>{publicKey && <><p className="mt-4 break-all text-xs text-slate-500">{publicKey.toBase58()}</p><p className="mt-2 text-xl font-bold">{balance === null ? 'Checking balance…' : balance + ' THC'}</p><button className="mt-2 text-sm font-semibold text-violet-700 dark:text-violet-300" onClick={()=>setRefresh(x=>x+1)}>Refresh balance</button></>}{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<p className="mt-3 text-xs text-slate-500">Connecting a wallet does not change your Club login or request a transfer.</p></section>;
}
