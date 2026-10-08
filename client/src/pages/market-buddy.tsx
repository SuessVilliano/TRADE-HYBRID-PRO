import React from 'react';
import { Brain, BookOpen, Shield, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { AITradeAssistant } from '@/components/ai/AITradeAssistant';

const capabilities = [
  ['Plan Builder', 'Turn your WHY and goals into a practical trading game plan.', Target],
  ['Journal Context', 'Bring trade notes and reviews into this conversation.', BookOpen],
  ['Risk & Rules', 'Keep risk limits, prop rules, and your own guardrails visible.', Shield],
  ['Strategy Research', 'Work through setups, ideas, and research without chasing every signal.', TrendingUp],
  ['Mindset', 'Reflect on discipline, habits, and whether your decisions match the plan.', Brain],
  ['Community Support', 'Prepare questions, check-ins, and next steps for the people around you.', Users],
] as const;

export default function MarketBuddyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#070b14] dark:text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1020]">
          <div className="grid gap-0 lg:grid-cols-[.72fr_1.28fr]">
            <aside className="bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 p-6 text-white sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Trade Hybrid AI
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em]">Market Buddy</h1>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Your Trade Hybrid trading companion, grounded in your Club game plan.
              </p>

              <div className="mt-7 space-y-3">
                {capabilities.map(([title, text, Icon]) => (
                  <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="font-black">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/75">{text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] leading-5 text-white/65">
                Market Buddy is designed to help you think through your process and connected Trade Hybrid data. It does not guarantee outcomes or replace your own trading decisions.
              </p>
            </aside>

            <div className="p-4 sm:p-6 lg:p-8">
              <AITradeAssistant />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
