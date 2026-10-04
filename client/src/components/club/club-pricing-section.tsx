import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Monthly',
    price: '$97',
    period: '/ month',
    description: 'A simple way into the connected Trade Hybrid Club.',
    features: ['Trade Hybrid Club', 'Community access', 'Market Buddy AI', 'Hybrid Journal + alerts', 'Member events & onboarding'],
    checkout: 'https://whop.com/checkout/1TIvb4zqrWODtRq69r-8xj0-51pd-UkLn-GwSXx18tPbZx/',
    icon: Zap,
    gradient: 'from-violet-600 to-purple-500',
  },
  {
    name: 'Yearly',
    price: '$597',
    period: '/ year',
    description: 'The core Club experience for members building over time.',
    features: ['Everything in Monthly', 'Annual member access', 'Academy learning paths', 'Practice Battle access', 'Expanded member perks'],
    checkout: 'https://whop.com/checkout/5sIJaH2cjV5tQsOoBX-eJnb-QHqG-OP9q-5z9KmBGnaxrB/',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    name: 'Lifetime',
    price: '$1,497',
    period: 'one time',
    description: 'Long-term Club access without another membership renewal.',
    features: ['Lifetime access to included Club features', 'Market Buddy AI', 'Hybrid Journal', 'Academy + Community', 'Trade House member features'],
    checkout: 'https://whop.com/checkout/1SOuliJDFuPJPEFUPL-a4l7-4NwZ-nnVs-9Z8gADiIFnS0/',
    icon: Crown,
    gradient: 'from-violet-600 via-blue-500 to-cyan-500',
  },
  {
    name: 'Pro Lifetime',
    price: '$4,997',
    period: 'one time',
    description: 'The premium ecosystem tier for members who want the deepest access.',
    features: ['Everything in Lifetime', 'Expanded AI specialist modes', 'Priority onboarding', 'Advanced automation access', 'Premium member experiences'],
    checkout: 'https://whop.com/checkout/plan_hcBFS8A0XQZBi/?d2c=true',
    icon: Crown,
    gradient: 'from-violet-600 to-fuchsia-500',
  },
];

export default function ClubPricingSection() {
  return (
    <section id="membership" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Membership</p>
        <h2 className="font-display mx-auto mt-3 max-w-3xl text-4xl font-medium tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          The original Trade Hybrid tiers, rebuilt around today’s ecosystem.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
          The four Whop checkout products remain the purchase layer. Included features shown here are being aligned to the new Club entitlement system; the Whop checkout remains the source for final purchase terms.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <article
              key={plan.name}
              className={`relative rounded-[1.75rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-[#0b1020] ${
                plan.popular
                  ? 'border-violet-400 shadow-[0_20px_60px_rgba(124,58,237,.14)]'
                  : 'border-violet-100 dark:border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                  Most popular
                </div>
              )}

              <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r ${plan.gradient} text-white shadow-lg`}>
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-medium tracking-tight text-slate-950 dark:text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-500">{plan.period}</span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm leading-5 text-slate-700 dark:text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.checkout}
                target="_blank"
                rel="noreferrer"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r ${plan.gradient} px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90`}
              >
                Choose {plan.name}
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
