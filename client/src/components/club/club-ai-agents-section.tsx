import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  DollarSign,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

const capabilities = [
  {
    name: 'Mindset & Discipline',
    role: 'Stay aligned',
    description: 'Reflection, emotional-awareness, accountability, and process prompts that reconnect decisions to your actual plan.',
    icon: Brain,
    tone: 'from-cyan-400 to-sky-500',
  },
  {
    name: 'Strategy Research',
    role: 'Study the setup',
    description: 'Compare ideas, review setups, organize research, and reason through strategy logic without turning Market Buddy into a signal-chaser.',
    icon: Bot,
    tone: 'from-violet-500 to-fuchsia-500',
  },
  {
    name: 'Risk & Rules',
    role: 'Protect the process',
    description: 'Keep risk limits, prop constraints, battle rules, and your personal guardrails visible while reviewing a decision.',
    icon: Shield,
    tone: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'Trader Companion',
    role: 'Connect the dots',
    description: 'Tie day-to-day questions back to your Journal, alerts, habits, progress, and the plan you said you wanted to follow.',
    icon: Users,
    tone: 'from-violet-500 to-indigo-500',
  },
  {
    name: 'Plan Builder',
    role: 'Turn goals into action',
    description: 'Use your goals, available time, markets, experience, and current challenges to build a practical next-step plan.',
    icon: BarChart3,
    tone: 'from-cyan-400 to-teal-500',
  },
  {
    name: 'Community & Team Support',
    role: 'Use the network',
    description: 'Help you prepare questions, sessions, accountability check-ins, team workflows, and community participation around your journey.',
    icon: UserCheck,
    tone: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Performance & Ops',
    role: 'Summarize the work',
    description: 'Organize performance summaries, operating context, reports, and follow-up questions from your connected Trade Hybrid data.',
    icon: DollarSign,
    tone: 'from-cyan-400 to-emerald-500',
  },
];

export default function ClubAIAgentsSection() {
  return (
    <section id="ai-team" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-[0_20px_70px_rgba(76,29,149,.08)] dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/[0.08] dark:text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> One AI. More capability.
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
              Market Buddy is the face of Trade Hybrid AI.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Market Buddy is one persistent Trade Hybrid AI. Instead of making members learn seven different bots, the original specialist ideas now become capabilities Market Buddy can use when the situation calls for them.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/ai-market-analysis"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20"
              >
                Open Market Buddy <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/onboarding"
                className="rounded-2xl border border-violet-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-violet-50 dark:border-white/10 dark:bg-transparent dark:text-white"
              >
                Update my AI context
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-6 text-white shadow-2xl shadow-violet-500/20">
            <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/25 bg-white/15 backdrop-blur">
                <img
                  src="https://tradehybrid.co/trade-hybrid-logo.png"
                  alt="Trade Hybrid Market Buddy mascot"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Primary AI</p>
                <h3 className="mt-1 text-3xl font-black">Market Buddy</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  One companion that knows why you trade, what you are working on, which tools you have access to, and what your Journal says—not another generic chat box.
                </p>
              </div>
            </div>
            <div className="relative mt-6 grid grid-cols-3 gap-2 text-center">
              {['WHY + goals', 'Journal context', 'Club access'].map((label) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-black/10 px-3 py-3 text-xs font-bold backdrop-blur">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ name, role, description, icon: Icon, tone }) => (
            <article
              key={name}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-black/20 dark:hover:border-violet-300/30 dark:hover:bg-white/[0.04]"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">{name}</h3>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300">{role}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
