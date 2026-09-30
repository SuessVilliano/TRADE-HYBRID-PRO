import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Swords } from 'lucide-react';
import { authService } from '@/lib/services/auth-service';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';

const TRADEHOUSE_ORIGIN =
  import.meta.env.VITE_TRADEHOUSE_URL ||
  'https://tradehouse-91io.onrender.com';

export default function TradeHouseLaunchPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const launch = async () => {
      try {
        const accessToken = await authService.getAccessToken();

        if (!accessToken) {
          window.location.replace('/login?next=/launch/tradehouse');
          return;
        }

        const tradehouseOrigin = TRADEHOUSE_ORIGIN;

        const response = await fetch(
          SUPABASE_URL + '/functions/v1/tradehouse-sso-start',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_KEY,
              Authorization: 'Bearer ' + accessToken,
            },
            body: JSON.stringify({ returnOrigin: tradehouseOrigin }),
          },
        );

        const body = await response.json().catch(() => ({}));

        if (!response.ok || !body?.code || !body?.returnTo) {
          throw new Error(body?.error || 'Could not open Trade House.');
        }

        const destination = new URL(body.returnTo);
        destination.searchParams.set('code', body.code);
        destination.searchParams.set('next', '/');

        window.location.replace(destination.toString());
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Could not open Trade House.');
        }
      }
    };

    void launch();

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950 dark:bg-[#070b14] dark:text-white">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-7 text-center shadow-sm dark:border-rose-400/20 dark:bg-[#0c1322]">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-5 text-2xl font-black">Trade House did not open.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
            >
              Try again
            </button>
            <Link to="/dashboard" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10">
              Back to Club
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950 dark:bg-[#070b14] dark:text-white">
      <div className="w-full max-w-md rounded-3xl border border-cyan-200 bg-white p-7 text-center shadow-sm dark:border-cyan-400/20 dark:bg-[#0c1322]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
          <Swords className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-black">Opening Trade House…</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Your Trade Hybrid Club identity is being handed to the standalone Arena. No second login should be required.
        </p>
        <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-cyan-500" />
      </div>
    </main>
  );
}
