import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Network, ShieldCheck, Zap } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuth } from '@/lib/context/AuthContext';
import { CLUB_LINKS } from '@/lib/club-links';

function safeNext(search: string) {
  const raw = new URLSearchParams(search).get('next') || CLUB_LINKS.dashboard;
  if (!raw.startsWith('/') || raw.startsWith('//')) return CLUB_LINKS.dashboard;
  return raw;
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const auth = useAuth();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const purchaseComplete = ['success', 'complete', 'paid'].includes(
    (params.get('purchase') || params.get('status') || '').toLowerCase(),
  );
  const next = safeNext(location.search);

  const [mode, setMode] = useState<'login' | 'register'>(() => {
    return ['/register', '/signup'].includes(window.location.pathname) ? 'register' : 'login';
  });

  if (auth.isAuthenticated) {
    return <Navigate to={next} replace />;
  }

  const handleAuthSuccess = async (userData: any) => {
    await auth.getCurrentUser();
    login(userData);
    navigate(next, { replace: true });
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090f] px-4 py-10 text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_30%_0%,rgba(0,212,255,.16),transparent_36%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,.17),transparent_34%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.75fr]">
        <section className="hidden lg:block">
          <a href={CLUB_LINKS.publicSite} className="inline-flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300 shadow-[0_0_35px_rgba(0,212,255,.1)]">
              <Zap className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.2em]">TRADE HYBRID</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-cyan-300">Club OS</span>
            </span>
          </a>

          <p className="mt-12 text-xs font-black uppercase tracking-[0.28em] text-violet-300">ONE MEMBER IDENTITY</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black tracking-tight xl:text-6xl">
            Your trading journey, connected.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Signals, Market Buddy, execution, Journal, Copy, Trade House, Community, Funding and The Hybrid Zone now route through one Club operating layer.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {[
              ['One login', 'Your Club identity is the source of truth for member access.'],
              ['One daily home', 'Start with Today instead of hunting through disconnected apps.'],
              ['Specialist products', 'Journal, Copy and Terminal keep doing the jobs they do best.'],
              ['Zone Mode', 'Enter the immersive Hybrid Zone whenever you want the full ecosystem experience.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 font-black">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
              </div>
            ))}
          </div>

          <a
            href={CLUB_LINKS.zone}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-sm font-black text-violet-300 hover:text-violet-200"
          >
            <Network className="h-4 w-4" /> Preview The Hybrid Zone
          </a>
        </section>

        <section>
          <div className="mx-auto w-full max-w-md">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                <Zap className="h-5 w-5" />
              </span>
              <span className="text-sm font-black tracking-[0.18em]">TRADE HYBRID CLUB</span>
            </div>

            {purchaseComplete && (
              <div className="mb-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4 text-sm">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-300" />
                  <div>
                    <p className="font-black text-emerald-200">Purchase received.</p>
                    <p className="mt-1 leading-6 text-slate-400">
                      Sign in with your Trade Hybrid Club account to continue. Your Whop membership event controls the access attached to your account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035] p-1 shadow-2xl shadow-black/30 backdrop-blur-xl">
              {mode === 'login' ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={handleSwitchMode}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={handleSwitchMode}
                />
              )}
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-600">
              Member access is determined by your Trade Hybrid Club account and current Whop entitlement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
