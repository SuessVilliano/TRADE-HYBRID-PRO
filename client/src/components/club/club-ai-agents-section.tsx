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

const agents = [
  {
    name: 'Market Buddy',
    role: 'Trade Hybrid AI',
    description: 'Your primary Trade Hybrid companion. It uses your WHY, game plan, Journal context, alerts, and Club journey to help you think through the next move.',
    icon: TrendingUp,
    tone: 'from-violet-500 to-cyan-400',
    primary: true,
  },
  {
    name: 'Psyche Master',
    role: 'Mindset Coach',
    description: 'Reflection, discipline, emotional-awareness, and process prompts designed to help you stay aligned with your plan.',
    icon: Brain,
    tone: 'from-cyan-400 to-sky-500',
  },
  {
    name: 'Algo Visionary',
    role: 'Strategy Research',
    description: 'A research-focused mode for testing ideas, comparing setups, and understanding quantitative strategy logic.',
    icon: Bot,
    tone: 'from-violet-500 to-fuchsia-500',
  },
  {
    name: 'RegGuard',
    role: 'Risk & Rules',
    description: 'Keeps risk limits, battle rules, prop constraints, and the trader’s own guardrails visible when reviewing decisions.',
    icon: Shield,
    tone: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'TradeSense',
    role: 'Trader Companion',
    description: 'Connects your day-to-day questions back to your Journal, habits, progress, and personal trading plan.',
    icon: Users,
    tone: 'from-violet-500 to-indigo-500',
  },
  {
    name: 'VantagePro',
    role: 'Plan Builder',
    description: 'Turns goals, available time, market focus, and current challenges into a practical trading game plan.',
    icon: BarChart3,
    tone: 'from-cyan-400 to-teal-500',
  },
  {
    name: 'ClientSphere',
    role: 'Relationship Mode',
    description: 'A specialist mode for members using Trade Hybrid around clients, communities, partnerships, or trader teams.',
    icon: UserCheck,
    tone: 'from-violet-500 to-purple-500',
  },
  {
    name: 'FinPulse',
    role: 'Financial Ops',
    description: 'Organizes performance summaries, operating context, and financial reporting questions without replacing your source-of-truth systems.',
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
              <Sparkles className="h-3.5 w-3.5" /> The AI team is back
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
              Market Buddy is the face of Trade Hybrid AI.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              The original specialist-agent idea still makes sense. The difference now is that Market Buddy becomes the member’s front door, while the other personalities act as focused modes that share the same Club context instead of feeling like eight disconnected bots.
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
          {agents.slice(1).map(({ name, role, description, icon: Icon, tone }) => (
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
