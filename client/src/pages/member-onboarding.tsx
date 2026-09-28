import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  Compass,
  Flag,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import memberJourneyService, { MemberOnboarding } from '@/lib/services/member-journey-service';

const MARKET_OPTIONS = ['Futures', 'Forex', 'Stocks / ETFs', 'Options', 'Crypto', 'Prediction Markets'];
const CHALLENGE_OPTIONS = [
  'Consistency',
  'Risk management',
  'Finding quality setups',
  'Following my plan',
  'Overtrading',
  'Trading psychology',
  'Passing a prop challenge',
  'Understanding the tools',
];
const LEARNING_OPTIONS = ['Watch and copy examples', 'Step-by-step lessons', 'Live sessions', 'AI coaching', 'Community accountability'];
const GOAL_OPTIONS = [
  'Build consistency',
  'Create a repeatable trading plan',
  'Pass or maintain a funded account',
  'Improve risk management',
  'Learn a new market',
  'Build a verified public track record',
];

type FormState = {
  why_text: string;
  primary_goal: string;
  goal_30_days: string;
  goal_90_days: string;
  goal_1_year: string;
  experience_level: string;
  preferred_markets: string[];
  current_challenges: string[];
  weekly_hours: number;
  preferred_learning_style: string;
  onboarding_session_requested: boolean;
};

const initialForm: FormState = {
  why_text: '',
  primary_goal: '',
  goal_30_days: '',
  goal_90_days: '',
  goal_1_year: '',
  experience_level: '',
  preferred_markets: [],
  current_challenges: [],
  weekly_hours: 5,
  preferred_learning_style: '',
  onboarding_session_requested: false,
};

function TogglePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-cyan-400 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800 shadow-sm dark:bg-cyan-400/10 dark:text-cyan-200'
          : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-cyan-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white'
      }
    >
      {active && <Check className="mr-1 inline h-4 w-4" />}
      {children}
    </button>
  );
}

function buildPlan(form: FormState) {
  const priorities = ['Hybrid Journal'];
  const goal = form.primary_goal.toLowerCase();
  if (goal.includes('funded') || goal.includes('prop')) priorities.push('Hybrid Funding', 'Academy');
  if (goal.includes('learn')) priorities.push('Academy', 'Community');
  if (goal.includes('track record')) priorities.push('Trade House Battles', 'Community');
  if (goal.includes('risk') || goal.includes('consistency') || goal.includes('plan')) {
    priorities.push('Trade Hybrid AI', 'Community');
  }

  return {
    why: form.why_text,
    primaryGoal: form.primary_goal,
    markets: form.preferred_markets,
    weeklyHours: form.weekly_hours,
    learningStyle: form.preferred_learning_style,
    priorities: Array.from(new Set(priorities)),
    checkpoints: {
      day3: 'Confirm access to every subscribed product and complete the first Journal entry.',
      day7: 'Review the first week, tighten the game plan, and join the Community.',
      day15: 'Check consistency against the plan and remove unused tools or friction.',
      day30: 'Complete a 30-day review and generate the next personalized plan.',
    },
  };
}

export default function MemberOnboardingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [existing, setExisting] = useState<MemberOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const bookingUrl =
    import.meta.env.VITE_ONBOARDING_BOOKING_URL || 'https://speakwith.us/jamaurjohnson';

  const entitlements = ((currentUser as any)?.entitlements || []) as Array<{
    product_key: string;
    status: string;
  }>;

  useEffect(() => {
    let active = true;
    memberJourneyService
      .getOnboarding()
      .then((record) => {
        if (!active || !record) return;
        setExisting(record);
        setForm({
          why_text: record.why_text || '',
          primary_goal: record.primary_goal || '',
          goal_30_days: record.goal_30_days || '',
          goal_90_days: record.goal_90_days || '',
          goal_1_year: record.goal_1_year || '',
          experience_level: record.experience_level || '',
          preferred_markets: record.preferred_markets || [],
          current_challenges: record.current_challenges || [],
          weekly_hours: record.weekly_hours || 5,
          preferred_learning_style: record.preferred_learning_style || '',
          onboarding_session_requested: record.onboarding_session_requested || false,
        });
      })
      .catch((e) => setError(e?.message || 'Could not load onboarding.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const steps = [
    { label: 'Your Why', icon: Compass },
    { label: 'Your Goals', icon: Target },
    { label: 'Your Trading Profile', icon: Flag },
    { label: 'Your Access', icon: Check },
    { label: 'Your Game Plan', icon: Brain },
  ];

  const canContinue = useMemo(() => {
    if (step === 0) return form.why_text.trim().length >= 10;
    if (step === 1) return !!form.primary_goal && !!form.goal_30_days.trim();
    if (step === 2) return !!form.experience_level && form.preferred_markets.length > 0;
    return true;
  }, [step, form]);

  const toggleArray = (key: 'preferred_markets' | 'current_challenges', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const saveProgress = async (patch: Partial<FormState> = {}) => {
    setSaving(true);
    setError('');
    try {
      const next = { ...form, ...patch };
      const saved = await memberJourneyService.saveOnboarding(next);
      setExisting(saved);
      return saved;
    } catch (e: any) {
      setError(e?.message || 'Could not save your journey.');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!canContinue || saving) return;
    try {
      await saveProgress();
      setStep((value) => Math.min(4, value + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const completedAt = new Date().toISOString();
      await memberJourneyService.saveOnboarding({
        ...form,
        plan_summary: buildPlan(form),
        completed_at: completedAt,
        current_stage: '72h',
      });
      await memberJourneyService.markAccess('club', true).catch(() => null);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Could not finish onboarding.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-6 py-20 text-center text-slate-600 dark:bg-[#070b14] dark:text-slate-300">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500 dark:border-white/10 dark:border-t-cyan-300" />
        <p className="mt-4">Preparing your Trade Hybrid journey…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#070b14] dark:text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            <Sparkles className="h-4 w-4" /> Build your Trade Hybrid game plan
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            We should know what you are trying to build.
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
            Your answers become the context for your Club journey, product checklist, follow-ups,
            and eventually your personal Trade Hybrid AI.
          </p>

          <div className="mt-7 grid grid-cols-5 gap-2">
            {steps.map(({ label, icon: Icon }, index) => (
              <div key={label} className="min-w-0">
                <div
                  className={
                    index <= step
                      ? 'h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500'
                      : 'h-1.5 rounded-full bg-slate-200 dark:bg-white/10'
                  }
                />
                <div className="mt-2 hidden items-center gap-1 text-[11px] font-semibold text-slate-500 sm:flex">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1322] sm:p-8">
          {step === 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Step 1 · Your Why</p>
              <h2 className="mt-2 text-2xl font-black">Why does trading matter to you?</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Not a slogan. Tell us what changes if you actually become the trader you are trying to become.
              </p>
              <textarea
                value={form.why_text}
                onChange={(e) => setForm((prev) => ({ ...prev, why_text: e.target.value }))}
                rows={6}
                placeholder="Example: I want a repeatable income skill that gives me more control of my time, lets me provide for my family, and proves I can follow a process instead of chasing trades."
                className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none ring-cyan-400 focus:ring-2 dark:border-white/10 dark:bg-black/20"
              />
              <p className="mt-2 text-xs text-slate-400">{form.why_text.trim().length}/10 minimum characters</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Step 2 · Your Goals</p>
              <h2 className="mt-2 text-2xl font-black">What are we helping you accomplish?</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <TogglePill
                    key={goal}
                    active={form.primary_goal === goal}
                    onClick={() => setForm((prev) => ({ ...prev, primary_goal: goal }))}
                  >
                    {goal}
                  </TogglePill>
                ))}
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {[
                  ['goal_30_days', '30 days', 'What needs to be true in 30 days?'],
                  ['goal_90_days', '90 days', 'Where should your process be in 90 days?'],
                  ['goal_1_year', '1 year', 'What does winning a year from now look like?'],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-bold">{label}</span>
                    <textarea
                      value={(form as any)[key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      rows={5}
                      placeholder={placeholder}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none ring-cyan-400 focus:ring-2 dark:border-white/10 dark:bg-black/20"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Step 3 · Your Trading Profile</p>
              <h2 className="mt-2 text-2xl font-black">Build the context your AI should know.</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-bold">Experience level</p>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Developing', 'Consistent', 'Advanced'].map((level) => (
                      <TogglePill
                        key={level}
                        active={form.experience_level === level}
                        onClick={() => setForm((prev) => ({ ...prev, experience_level: level }))}
                      >
                        {level}
                      </TogglePill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">Hours you can realistically commit each week</p>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={form.weekly_hours}
                    onChange={(e) => setForm((prev) => ({ ...prev, weekly_hours: Number(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                  <p className="mt-1 text-sm text-slate-500">{form.weekly_hours} hours / week</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="mb-2 text-sm font-bold">Markets you care about</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKET_OPTIONS.map((market) => (
                      <TogglePill
                        key={market}
                        active={form.preferred_markets.includes(market)}
                        onClick={() => toggleArray('preferred_markets', market)}
                      >
                        {market}
                      </TogglePill>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="mb-2 text-sm font-bold">What gets in your way right now?</p>
                  <div className="flex flex-wrap gap-2">
                    {CHALLENGE_OPTIONS.map((challenge) => (
                      <TogglePill
                        key={challenge}
                        active={form.current_challenges.includes(challenge)}
                        onClick={() => toggleArray('current_challenges', challenge)}
                      >
                        {challenge}
                      </TogglePill>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="mb-2 text-sm font-bold">How do you learn best?</p>
                  <div className="flex flex-wrap gap-2">
                    {LEARNING_OPTIONS.map((style) => (
                      <TogglePill
                        key={style}
                        active={form.preferred_learning_style === style}
                        onClick={() => setForm((prev) => ({ ...prev, preferred_learning_style: style }))}
                      >
                        {style}
                      </TogglePill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Step 4 · Access Check</p>
              <h2 className="mt-2 text-2xl font-black">Make sure you can reach what you paid for.</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Our 72-hour follow-up will revisit this checklist so nobody buys access and then gets lost.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Club identity</p>
                  <p className="mt-1 font-bold">Trade Hybrid Club</p>
                  <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/70">Confirmed — you are signed in.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Current entitlements</p>
                  <p className="mt-1 font-bold">{entitlements.length ? entitlements.map((e) => e.product_key).join(', ') : 'Club Free'}</p>
                  <p className="mt-1 text-sm text-slate-500">Your checklist expands automatically as subscriptions unlock.</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-400/20 dark:bg-violet-400/10">
                <div className="flex gap-3">
                  <CalendarDays className="mt-1 h-5 w-5 text-violet-600 dark:text-violet-300" />
                  <div className="flex-1">
                    <p className="font-black">Want a live onboarding session?</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Book time to confirm your access, goals, and first-week game plan.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setForm((prev) => ({ ...prev, onboarding_session_requested: true }))}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white hover:bg-violet-700"
                      >
                        Book onboarding
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, onboarding_session_requested: false }))}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/15"
                      >
                        I’ll explore first
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Step 5 · Your Game Plan</p>
              <h2 className="mt-2 text-2xl font-black">This becomes the starting context for your journey.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-400/20 dark:bg-cyan-400/10">
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Your why</p>
                  <p className="mt-2 leading-7 text-slate-700 dark:text-slate-200">{form.why_text}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Primary goal</p>
                  <p className="mt-2 text-lg font-black">{form.primary_goal}</p>
                  <p className="mt-1 text-sm text-slate-500">{form.weekly_hours} hours/week · {form.experience_level}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <p className="font-black">Your first 30 days</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {[
                    ['Today', 'Complete onboarding and confirm your Club access.'],
                    ['72 hours', 'Verify every subscribed feature and make your first Journal entry.'],
                    ['7–15 days', 'Review what you are actually using and adjust your game plan.'],
                    ['30 days', 'Run a full progress review and generate the next personalized plan.'],
                  ].map(([when, text]) => (
                    <div key={when} className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                      <p className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-300">{when}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0 || saving}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canContinue || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950"
              >
                {saving ? 'Saving…' : 'Continue'} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
              >
                {saving ? 'Building your journey…' : 'Start my journey'} <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {existing?.completed_at && (
          <p className="mt-5 text-center text-xs text-slate-400">
            You completed onboarding previously. Saving here updates the context used for your future journey.
          </p>
        )}
      </div>
    </main>
  );
}
