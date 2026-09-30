import React, { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '@/lib/services/auth-service';
import { getClubProduct, plansForProduct, userHasProductAccess } from '@/lib/product-catalog';

export default function ClubProductAccessPage() {
  const { slug = '' } = useParams();
  const product = getClubProduct(slug);
  const [state, setState] = useState<'checking'|'allowed'|'locked'|'missing'>('checking');

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!product) {
        if (active) setState('missing');
        return;
      }

      const user = await authService.getCurrentUser();
      if (!active) return;

      if (!user?.authenticated) {
        window.location.replace('/login?next=' + encodeURIComponent('/access/' + product.slug));
        return;
      }

      if (!userHasProductAccess(user, product)) {
        setState('locked');
        return;
      }

      setState('allowed');

      if (/^https?:/i.test(product.destination)) {
        window.location.replace(product.destination);
      } else {
        window.location.replace(product.destination);
      }
    };

    void check();
    return () => { active = false; };
  }, [product?.slug]);

  if (!product || state === 'missing') {
    return <main className="grid min-h-screen place-items-center bg-white text-slate-950"><p className="font-black">Product not found.</p></main>;
  }

  if (state === 'locked') {
    const plans = plansForProduct(product);
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950 dark:bg-[#070b14] dark:text-white">
        <div className="w-full max-w-xl rounded-[28px] border border-violet-100 bg-white p-7 text-center shadow-xl dark:border-white/10 dark:bg-[#0b1020]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-300/10 dark:text-violet-300">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-black">{product.name} is not in your current access.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Upgrade to a plan that includes it, or open the product page to compare access.</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {plans.slice(0,2).map((plan) => (
              <a key={plan.key} href={plan.checkout} target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-black text-white">
                {plan.name} · {plan.price}
              </a>
            ))}
          </div>
          <Link to={'/products/' + product.slug} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-violet-600 dark:text-violet-300">
            View product details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-white text-slate-950 dark:bg-[#070b14] dark:text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600 dark:border-white/10 dark:border-t-cyan-300" />
        <p className="mt-4 text-sm font-bold text-slate-500">Opening {product.name}…</p>
      </div>
    </main>
  );
}
