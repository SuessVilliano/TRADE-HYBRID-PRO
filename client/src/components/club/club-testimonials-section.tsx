import React from 'react';
import { Quote, Star } from 'lucide-react';

const feedback = [
  {
    name: 'Jacob S.',
    quote: 'Trade Hybrid made it so simple to understand and helped me to get my trade plan together.',
  },
  {
    name: 'Jessica P.',
    quote: "It's like having an entire team of experts working alongside me.",
  },
  {
    name: 'Dany M.',
    quote: 'As a novice trader, I was overwhelmed by the complexities of the market. Trade Hybrid changed that for me.',
  },
];

export default function ClubTestimonialsSection() {
  return (
    <section id="members" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Member feedback</p>
        <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          What members are saying.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
          Feedback carried forward from the original Trade Hybrid community as the ecosystem grows into the new Club experience.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {feedback.map(({ name, quote }) => (
          <article
            key={name}
            className="rounded-[1.5rem] border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
          >
            <div className="flex items-center justify-between">
              <Quote className="h-8 w-8 text-violet-500" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current text-amber-400" />
                ))}
              </div>
            </div>
            <p className="font-display mt-6 text-lg leading-7 text-slate-700 dark:text-slate-300">“{quote}”</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white">
                {name.split(' ').map((part) => part[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-slate-950 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500">Trade Hybrid member</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
