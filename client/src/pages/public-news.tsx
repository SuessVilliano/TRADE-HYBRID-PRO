import { useEffect, useState } from "react";
import axios from "axios";
import { Globe2, ShieldCheck } from "lucide-react";
import { TradingViewTickerTape } from "@/components/ui/tradingview-ticker-tape";
import { SimpleNewsFeed } from "@/components/ui/simple-news-feed";

interface NewsSource {
  id: string;
  name: string;
}

const FALLBACK_SOURCES: NewsSource[] = [
  { id: "cnbc", name: "CNBC" },
  { id: "marketwatch", name: "MarketWatch" },
  { id: "yahoo_finance", name: "Yahoo Finance" },
  { id: "coindesk", name: "CoinDesk" },
  { id: "cointelegraph", name: "CoinTelegraph" },
];

export default function PublicNewsPage() {
  const [sources, setSources] = useState<NewsSource[]>(FALLBACK_SOURCES);
  const [selectedSource, setSelectedSource] = useState("cnbc");
  const [sourcesStatus, setSourcesStatus] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    document.title = "Trade Hybrid News | Markets & Financial Headlines";

    axios
      .get("/api/rss-feeds/sources", { timeout: 8000 })
      .then((response) => {
        const nextSources = Array.isArray(response.data?.sources)
          ? response.data.sources
          : [];

        if (nextSources.length > 0) {
          setSources(nextSources);
          if (!nextSources.some((source: NewsSource) => source.id === selectedSource)) {
            setSelectedSource(nextSources[0].id);
          }
          setSourcesStatus("live");
        }
      })
      .catch(() => {
        setSources(FALLBACK_SOURCES);
        setSourcesStatus("fallback");
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-cyan-400/15 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Trade Hybrid
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
              Market News Desk
            </h1>
          </div>
          <a
            href="https://tradehybrid.co"
            className="rounded-full border border-cyan-300/25 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
          >
            Trade Hybrid
          </a>
        </div>
      </header>

      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6">
          <TradingViewTickerTape className="border-slate-800 bg-slate-900/40" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Globe2 className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                Financial Headlines
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              What is moving markets now
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
              Publisher RSS headlines are loaded from their source feeds. Market prices above are
              supplied by TradingView and may be delayed depending on venue and exchange licensing.
            </p>
          </div>

          <label className="block min-w-[220px] text-sm text-slate-300">
            <span className="mb-2 block font-semibold">News source</span>
            <select
              value={selectedSource}
              onChange={(event) => setSelectedSource(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-100">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>
            Live-feed mode: {sourcesStatus === "live" ? "source directory connected" : "fallback source list in use"}.
            No simulated market prices are used on this page.
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 shadow-2xl shadow-black/20 md:p-6">
          <SimpleNewsFeed sourceId={selectedSource} />
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-7 text-center text-xs text-slate-500">
        Trade Hybrid News · Headlines remain the property of their respective publishers · Verify
        time-sensitive details at the original source.
      </footer>
    </main>
  );
}
