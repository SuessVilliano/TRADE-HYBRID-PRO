import React from 'react';
import { Brain, BookOpen, ChevronDown, Shield, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { AITradeAssistant } from '@/components/ai/AITradeAssistant';

const capabilities = [
  ['Plan Builder', 'Turn your WHY and goals into a practical trading game plan.', Target],
  ['Journal Context', 'Use your recorded trades, notes, alerts, and reviews as context.', BookOpen],
  ['Risk & Rules', 'Keep risk limits, prop rules, and your own guardrails visible.', Shield],
  ['Strategy Research', 'Work through setups, ideas, and research without chasing every signal.', TrendingUp],
  ['Mindset', 'Reflect on discipline, habits, and whether your decisions match the plan.', Brain],
  ['Community Support', 'Prepare questions, check-ins, and next steps for the people around you.', Users],
] as const;

function CapabilityList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-2 sm:grid-cols-2' : 'space-y-3'}>
      {capabilities.map(([title, text, Icon]) => (
        <div
          key={title}
          className={
            compact
              ? 'rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5'
              : 'rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur'
          }
        >
          <div className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${compact ? 'text-violet-600 dark:text-violet-300' : ''}`} />
            <div>
              <p className="font-black">{title}</p>
              <p className={`mt-1 text-xs leading-5 ${compact ? 'text-slate-600 dark:text-slate-300' : 'text-white/75'}`}>
                {text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketBuddyPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-3 py-3 text-slate-950 dark:bg-[#070b14] dark:text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1020] sm:rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-[.62fr_1.38fr]">
            <aside className="hidden bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-8 text-white lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Trade Hybrid AI
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em]">Market Buddy</h1>
              <p className="mt-3 text-sm leading-6 text-white/80">
                One persistent AI companion for your Trade Hybrid journey—not a collection of disconnected bots.
              </p>

              <div className="mt-7">
                <CapabilityList />
              </div>

              <p className="mt-6 text-[11px] leading-5 text-white/65">
                Market Buddy helps you think through your process and connected Trade Hybrid data. It does not guarantee outcomes or replace your own trading decisions.
              </p>
            </aside>

            <div className="p-2 sm:p-4 lg:p-6">
              <div className="mb-3 flex items-center gap-3 px-1 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">Trade Hybrid AI</p>
                  <h1 className="text-xl font-black">Market Buddy</h1>
                </div>
              </div>

              <details className="group mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">
                  About Market Buddy
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Your persistent Trade Hybrid companion for your WHY, game plan, Journal context, screen review, voice, and platform guidance.
                </p>
                <div className="mt-3">
                  <CapabilityList compact />
                </div>
              </details>

              <AITradeAssistant focusMode />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
