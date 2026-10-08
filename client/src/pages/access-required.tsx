import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LockKeyhole, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AccessRequiredPage() {
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080a10] px-5 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
          <LockKeyhole className="h-6 w-6 text-amber-300" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Trade Hybrid Club Access</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Your account is real. Member access is not active yet.</h1>
        <p className="mt-4 leading-7 text-slate-400">
          Signing up creates your Trade Hybrid identity, but it does not unlock the paid platform. An active Trade Hybrid membership is required before Signals, Journal, Academy, Market Buddy, and the rest of the member OS open.
        </p>
        <div className="mt-6 space-y-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-sm text-slate-300">
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> Already purchased? Sign in with the same email used at checkout so your entitlement can attach automatically.</p>
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> New member? Complete checkout first, then return here to activate your Club journey.</p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a href="https://tradehybrid.co/#pricing" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-[#061016]">
            Choose membership <ArrowRight className="h-4 w-4" />
          </a>
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200">
            I already purchased
          </Link>
        </div>
      </div>
    </main>
  );
}
