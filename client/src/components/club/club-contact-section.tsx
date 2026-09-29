import React, { useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Send, Users } from 'lucide-react';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';

export default function ClubContactSection() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General question',
    message: '',
    website: '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState('sending');
    setError('');

    try {
      const response = await fetch(SUPABASE_URL + '/functions/v1/club-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || 'We could not save your message.');

      setState('sent');
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General question',
        message: '',
        website: '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not save your message.');
      setState('error');
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_20px_70px_rgba(76,29,149,.08)] dark:border-white/10 dark:bg-[#0b1020] lg:grid-cols-[.8fr_1.2fr]">
        <div className="bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Contact Trade Hybrid</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">Questions, access issues, or partnership ideas?</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-white/80">
            Send the team a message, reach support directly, or get plugged into the community if your question is better answered with other traders around you.
          </p>

          <div className="mt-8 space-y-3">
            <a href="mailto:support@tradehybrid.club" className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <Mail className="h-5 w-5" />
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-cyan-100">Support email</span>
                <span className="mt-1 block font-bold">support@tradehybrid.club</span>
              </span>
            </a>
            <a href="/community" className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <Users className="h-5 w-5" />
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-cyan-100">Community</span>
                <span className="mt-1 block font-bold">Ask, learn, and connect</span>
              </span>
            </a>
            <a href="/login" className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <MessageCircle className="h-5 w-5" />
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-cyan-100">Existing member</span>
                <span className="mt-1 block font-bold">Sign in to your Club</span>
              </span>
            </a>
          </div>
        </div>

        <div className="p-7 sm:p-10">
          {state === 'sent' ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-black">Message received.</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your message is now in the Trade Hybrid contact queue.
                </p>
                <button type="button" onClick={() => setState('idle')} className="mt-6 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-black text-violet-700 dark:border-white/10 dark:text-white">
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white">Send us a message</h3>
              <p className="mt-2 text-sm text-slate-500">We’ll store it securely in the Club support queue.</p>

              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  First name
                  <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04]" />
                </label>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Last name
                  <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04]" />
                </label>
              </div>

              <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email
                <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04]" />
              </label>

              <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Subject
                <select value={form.subject} onChange={(e) => update('subject', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#0b1020]">
                  <option>General question</option>
                  <option>Account or access</option>
                  <option>Technical support</option>
                  <option>Partnership</option>
                  <option>Trade House / Battles</option>
                  <option>Hybrid Funding</option>
                  <option>Membership / billing</option>
                </select>
              </label>

              <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Message
                <textarea required minLength={8} rows={6} value={form.message} onChange={(e) => update('message', e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04]" />
              </label>

              {state === 'error' && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}

              <button type="submit" disabled={state === 'sending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/15 disabled:opacity-50">
                <Send className="h-4 w-4" />
                {state === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
