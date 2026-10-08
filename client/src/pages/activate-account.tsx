import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react';

const CLUB_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const CLUB_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const code = useMemo(() => String(params.get('code') || '').trim(), [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activate = async (event: React.FormEvent) => {
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

    setLoading(true);
    try {
      const response = await fetch(`${CLUB_URL}/functions/v1/activate-club-account`, {
        method: 'POST',
        headers: {
          apikey: CLUB_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || 'Activation failed.');
      setEmail(result?.email || '');
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'We could not activate this account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080a10] px-5 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
          {done ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <KeyRound className="h-6 w-6 text-cyan-300" />}
        </div>

        {done ? (
          <>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Trade Hybrid Club Activated</p>
            <h1 className="mt-3 text-3xl font-black">Your Club identity is ready.</h1>
            <p className="mt-4 leading-7 text-slate-400">
              {email ? `Sign in as ${email}. ` : ''}Your purchase is attached to this account. Your first member session will open the Trade Hybrid onboarding journey before the dashboard.
            </p>
            <Link
              to="/login?next=/onboarding"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-[#061016]"
            >
              Sign in to Trade Hybrid Club
            </Link>
          </>
        ) : (
          <>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Trade Hybrid Club Activation</p>
            <h1 className="mt-3 text-3xl font-black">Finish setting up the account attached to your purchase.</h1>
            <p className="mt-4 leading-7 text-slate-400">
              Create the password for your Trade Hybrid Club identity. This link is purchase-issued and expires automatically.
            </p>

            <form onSubmit={activate} className="mt-7 space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Create password</span>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-3 outline-none ring-cyan-300 focus:ring-2"
                    placeholder="10+ characters"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Confirm password</span>
                <div className="relative mt-2">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-3 outline-none ring-cyan-300 focus:ring-2"
                    placeholder="Repeat password"
                  />
                </div>
              </label>

              {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">{error}</div>}

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-black text-[#061016] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Activating…' : 'Activate my Trade Hybrid account'}
              </button>
            </form>

            {!code && (
              <p className="mt-4 text-center text-xs text-amber-300">
                This page needs the secure activation code from your Trade Hybrid purchase email.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
