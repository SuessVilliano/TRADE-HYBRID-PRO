import React from 'react';
import { ArrowLeft, ArrowRight, Check, Minus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLUB_PLANS, CLUB_PRODUCTS, plansForProduct } from '@/lib/product-catalog';

const paidProducts = CLUB_PRODUCTS.filter((product) => !product.public);

function firstIncludedPlan(productKey: string) {
  const product = CLUB_PRODUCTS.find((item) => item.key === productKey);
  if (!product) return null;
  return plansForProduct(product)[0] || null;
}

export default function ClubProductsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-[#070b14] dark:text-white">
      <section className="border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-5 py-16 dark:border-white/10 dark:from-violet-950/20 dark:via-[#070b14] dark:to-cyan-950/10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-300">
            <ArrowLeft className="h-4 w-4" /> Trade Hybrid
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm dark:border-violet-300/20 dark:bg-white/[0.04] dark:text-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> Product catalog
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-6xl">Every product. One ecosystem.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Explore what each product does, which membership plans include it, and where it fits in the trader journey.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CLUB_PRODUCTS.map((product) => {
            const startingPlan = firstIncludedPlan(product.key);
            return (
              <Link key={product.key} to={'/products/' + product.slug} className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.035]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-violet-600 dark:text-violet-300">{product.category}</p>
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10">
                    {product.public ? 'Public' : startingPlan ? 'From ' + startingPlan.name : 'Club'}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-black">{product.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-300">
                  View product <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-white/[0.02] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Bundle comparison</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">See exactly what each Club plan unlocks.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The same inclusion rules shown here drive the member entitlement gates after purchase.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1020]">
            <table className="min-w-[980px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  <th className="p-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Product</th>
                  {CLUB_PLANS.map((plan) => (
                    <th key={plan.key} className="p-4 text-center">
                      <p className="font-black">{plan.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{plan.price} · {plan.billing}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidProducts.map((product) => (
                  <tr key={product.key} className="border-b border-slate-100 last:border-b-0 dark:border-white/[0.07]">
                    <td className="p-4">
                      <Link to={'/products/' + product.slug} className="font-black hover:text-violet-600 dark:hover:text-violet-300">{product.name}</Link>
                      <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                    </td>
                    {CLUB_PLANS.map((plan) => {
                      const included = product.plans.includes(plan.key);
                      return (
                        <td key={plan.key} className="p-4 text-center">
                          {included ? (
                            <Check className="mx-auto h-5 w-5 text-emerald-500" />
                          ) : (
                            <Minus className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-700" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CLUB_PLANS.map((plan) => (
              <article key={plan.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1020]">
                <p className="font-black">{plan.name}</p>
                <p className="mt-2 text-3xl font-black">{plan.price}</p>
                <p className="text-xs text-slate-500">{plan.billing}</p>
                <a href={plan.checkout} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-black text-white">
                  Choose plan <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
