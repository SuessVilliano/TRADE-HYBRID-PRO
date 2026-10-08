import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Network } from 'lucide-react';
import { authService } from '@/lib/services/auth-service';

const ZONE_URL =
  import.meta.env.VITE_ZONE_URL ||
  'https://thehybridzone.club';

export default function ZoneLaunchPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const launch = async () => {
      try {
        const accessToken = await authService.getAccessToken();

        if (!accessToken) {
          window.location.replace('/login?next=/launch/zone');
          return;
        }

        const response = await fetch(
          '/api/sso/ticket?return_to=' + encodeURIComponent(ZONE_URL),
          {
            headers: {
              Authorization: 'Bearer ' + accessToken,
            },
          },
        );

        const body = await response.json().catch(() => ({}));

        if (!response.ok || !body?.ticket) {
          throw new Error(body?.error || 'Could not open The Hybrid Zone.');
        }

        const destination = new URL(ZONE_URL);
        destination.searchParams.set('club_ticket', body.ticket);
        destination.searchParams.set('from', 'club');

        window.location.replace(destination.toString());
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Could not open The Hybrid Zone.');
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
      <main className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-[#07090f] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-rose-300/15 bg-white/[0.035] p-7 text-center shadow-2xl shadow-black/30">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-300" />
          <h1 className="mt-5 text-2xl font-black">The Hybrid Zone did not open.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
            >
              Try again
            </button>
            <Link to="/dashboard" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-black">
              Back to Club OS
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-[#07090f] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-violet-300/15 bg-white/[0.035] p-7 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.08] text-violet-300">
          <Network className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-black">Entering The Hybrid Zone…</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Your Trade Hybrid Club identity and current access are being handed to Zone Mode.
        </p>
        <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-cyan-300" />
      </div>
    </main>
  );
}
