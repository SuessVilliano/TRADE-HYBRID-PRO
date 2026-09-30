import React from 'react';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CLUB_PRODUCTS, plansForProduct } from '@/lib/product-catalog';

export default function ClubProductPage() {
  const { slug = '' } = useParams();
  const product = CLUB_PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-5 text-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-black">Product not found.</h1>
          <Link to="/products" className="mt-5 inline-flex text-sm font-black text-violet-600">View all Trade Hybrid products</Link>
        </div>
      </main>
    );
  }

  const plans = plansForProduct(product);

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-[#070b14] dark:text-white">
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-white/10">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-200/50 blur-[120px] dark:bg-violet-600/10" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-cyan-200/50 blur-[120px] dark:bg-cyan-500/10" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Link to="/#ecosystem" className="inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-300">
            <ArrowLeft className="h-4 w-4" /> Trade Hybrid ecosystem
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/[0.08] dark:text-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> {product.category}
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.055em] sm:text-7xl">{product.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{product.summary}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {product.public ? (
              <a href={product.destination} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-6 py-3 font-black text-white">
                Open {product.name} <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <a href="#product-pricing" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-6 py-3 font-black text-white">
                View access plans <ArrowRight className="h-4 w-4" />
              </a>
            )}
            <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
              Member login
            </Link>
          </div>
        </div>
      </section>

      <section id="product-pricing" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">What it does</p>
          <h2 className="mt-3 text-3xl font-black">A real part of the Trade Hybrid stack.</h2>
          <div className="mt-6 space-y-3">
            {product.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Access + pricing</p>
          <h2 className="mt-3 text-3xl font-black">{product.public ? 'Public product' : 'Included with qualifying Club plans'}</h2>
          {!product.public && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              A separate standalone checkout is only shown when a real SKU exists. The current verified purchase path is the Club plan that includes this product.
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.public ? (
              <a href={product.destination} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-sm font-black">Open product</p>
                <p className="mt-2 text-sm text-slate-500">Pricing and terms are handled by {product.name}.</p>
              </a>
            ) : plans.map((plan) => (
              <article key={plan.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
                <div className="flex items-center justify-between">
                  <p className="font-black">{plan.name}</p>
                  <LockKeyhole className="h-4 w-4 text-violet-500" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="ml-1 text-sm text-slate-500">{plan.billing}</span>
                </div>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{plan.description}</p>
                <a href={plan.checkout} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-sm font-black text-white">
                  Choose {plan.name} <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
