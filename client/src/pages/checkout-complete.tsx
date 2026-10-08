import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, Zap } from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';
import { useAuth } from '@/lib/context/AuthContext';

export default function CheckoutCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const rawStatus = (params.get('checkout_status') || params.get('status') || 'success').toLowerCase();
  const failed = ['error', 'failed', 'cancelled', 'canceled'].includes(rawStatus);

  useEffect(() => {
    if (failed) return;

    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        navigate(CLUB_LINKS.dashboard, { replace: true });
      } else {
        navigate('/login?purchase=success&next=/dashboard', { replace: true });
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [failed, isAuthenticated, navigate]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07090f] px-5 text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,.15),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
          <Zap className="h-7 w-7" />
        </span>

        {failed ? (
          <>
            <XCircle className="mx-auto mt-7 h-9 w-9 text-rose-300" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-rose-300">CHECKOUT NOT COMPLETED</p>
            <h1 className="mt-2 text-3xl font-black">No access change was made here.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Return to the membership options or sign in if you already have Trade Hybrid Club access.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href="https://tradehybrid.co/#pricing" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">
                View membership
              </a>
              <Link to={CLUB_LINKS.login} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-white">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto mt-7 h-9 w-9 text-emerald-300" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-emerald-300">PURCHASE COMPLETE</p>
            <h1 className="mt-2 text-3xl font-black">Welcome to Trade Hybrid Club.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Whop will update your membership entitlement through the Club webhook. We’re taking you to your Club access flow now.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Opening Club OS…
            </div>
          </>
        )}
      </section>
    </main>
  );
}
