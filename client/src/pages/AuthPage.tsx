import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuth } from '@/lib/context/AuthContext';

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    return ['/register', '/signup'].includes(window.location.pathname) ? 'register' : 'login';
  });
  const { login } = useAuthStore();
  const auth = useAuth();
  const navigate = useNavigate();

  const destination = useMemo(() => safeNext(searchParams.get('next')), [searchParams]);
  const purchaseComplete =
    searchParams.get('purchase') === 'success' ||
    searchParams.get('status') === 'success' ||
    searchParams.get('checkout_status') === 'success';

  if (auth.isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleAuthSuccess = async (userData: any) => {
    await auth.getCurrentUser();
    login(userData);
    navigate(destination, { replace: true });
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080a10] p-4 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[140px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Trade Hybrid Club OS</p>
          <h1 className="mt-3 text-3xl font-black">{mode === 'login' ? 'Welcome back.' : 'Create your Club identity.'}</h1>
          <p className="mt-2 text-sm text-slate-400">
            One login for your Journal, Signals, Copy, Market Buddy, Trade House, Academy, Zone Mode, and funding path.
          </p>
        </div>

        {purchaseComplete && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.06] p-4 text-left">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-black text-emerald-200">Purchase received.</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Sign in with the email connected to your purchase. Your membership entitlement will be applied by the Whop webhook and your Club OS will open next.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {mode === 'login' ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={handleSwitchMode} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={handleSwitchMode} />
          )}
        </div>
      </div>
    </div>
  );
}
