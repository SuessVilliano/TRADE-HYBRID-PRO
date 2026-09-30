import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLUB_PRODUCTS } from '@/lib/product-catalog';

export default function ClubProductsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-slate-950 dark:bg-[#070b14] dark:text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">Trade Hybrid products</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-6xl">Every product. One ecosystem.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">Explore what each product does, which membership plans include it, and where it fits in the trader journey.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CLUB_PRODUCTS.map((product) => (
            <Link key={product.key} to={'/products/' + product.slug} className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.035]">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-violet-600 dark:text-violet-300">{product.category}</p>
              <h2 className="mt-2 text-2xl font-black">{product.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-300">View product <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
