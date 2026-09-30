import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';

export default function ActivateClubAccountPage() {
  const [params] = useSearchParams();
  const code = String(params.get('code') || '').trim();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<'idle'|'saving'|'done'|'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^[a-f0-9]{64}$/i.test(code)) {
      setError('This activation link is invalid or incomplete.');
      return;
    }

    if (password.length < 10) {
      setError('Use at least 10 characters for your password.');
      return;
    }

    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }

    setState('saving');

    try {
      const response = await fetch(SUPABASE_URL + '/functions/v1/activate-club-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ code, password }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error || 'We could not activate this account.');
      }

      setState('done');
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'We could not activate this account.');
    }
  };

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl place-items-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-[0_30px_100px_rgba(76,29,149,.12)] lg:grid-cols-[.85fr_1.15fr]">
          <aside className="bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-8 text-white sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] backdrop-blur">
              <ShieldCheck className="h-4 w-4" /> Trade Hybrid Club
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Your access is ready.</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/80">
              Your purchase created your Trade Hybrid Club account and unlocked the products included with your plan. Set your password once, then use the same identity across the Club and Trade House.
            </p>
            <div className="mt-8 space-y-3 text-sm font-bold text-white/90">
              {['One Club login', 'Plan-based product access', 'Trade House identity', 'Onboarding + Market Buddy context'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-cyan-100" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <section className="p-7 sm:p-10">
            {state === 'done' ? (
              <div className="grid min-h-[460px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 text-3xl font-black">Account activated.</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    Your password is set. Sign in with the email address used at checkout, then complete onboarding so your dashboard and Market Buddy can personalize the journey.
                  </p>
                  <div className="mt-7 grid gap-2 sm:grid-cols-2">
                    <a href="/login?next=/onboarding" className="rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-5 py-3 text-sm font-black text-white">
                      Sign in + onboard
                    </a>
                    <a href="/products" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">
                      Explore products
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-3xl font-black">Create your Club password</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use at least 10 characters. This activation link works once and expires after seven days.
                </p>

                <label className="mt-7 block text-sm font-black text-slate-700">
                  New password
                  <div className="relative mt-2">
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-violet-400"
                    />
                    <button type="button" onClick={() => setShow((value) => !value)} className="absolute inset-y-0 right-3 grid place-items-center text-slate-400">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <label className="mt-4 block text-sm font-black text-slate-700">
                  Confirm password
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400"
                  />
                </label>

                {error && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === 'saving'}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/15 disabled:opacity-50"
                >
                  {state === 'saving' ? 'Activating…' : 'Activate my Trade Hybrid account'}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  If this link expired, contact Trade Hybrid support and we can issue a fresh activation.
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
