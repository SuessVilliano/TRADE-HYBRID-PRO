const CLUB_URL = "https://uqtluroceakqtlvlzatt.supabase.co";
const CLUB_PUBLISHABLE_KEY = "sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_";

const allowedOrigins = new Set([
  "https://pro.tradehybrid.co",
  "https://tradehybrid.co",
  "https://www.tradehybrid.co",
  "http://localhost:5173",
  "http://localhost:5000",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://pro.tradehybrid.co",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function secretKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw);
      if (keys?.default) return String(keys.default);
    } catch {}
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function providerTimeframe(provider: string) {
  const value = provider.toLowerCase();
  if (value.includes("solaris")) return "5m";
  if (value.includes("hybrid")) return "10m";
  if (value.includes("paradox")) return "30m";
  return "LIVE";
}

async function clubUser(token: string) {
  const response = await fetch(CLUB_URL + "/auth/v1/user", {
    headers: {
      apikey: CLUB_PUBLISHABLE_KEY,
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) return null;
  return await response.json();
}

async function hasPaidAccess(token: string, userId: string) {
  const response = await fetch(
    CLUB_URL +
      "/rest/v1/product_entitlements?user_id=eq." +
      encodeURIComponent(userId) +
      "&status=in.(active,trialing)&select=product_key,status,starts_at,ends_at",
    {
      headers: {
        apikey: CLUB_PUBLISHABLE_KEY,
        Authorization: "Bearer " + token,
      },
    },
  );
  if (!response.ok) return false;
  const rows = await response.json();
  const now = Date.now();
  return Array.isArray(rows) && rows.some((row: any) => {
    if (!row?.product_key || row.product_key === "club_free") return false;
    if (row.starts_at && Date.parse(row.starts_at) > now) return false;
    if (row.ends_at && Date.parse(row.ends_at) <= now) return false;
    return row.status === "active" || row.status === "trialing";
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(req) });
  }
  if (req.method !== "GET") return json(req, { error: "Method not allowed" }, 405);

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return json(req, { error: "Trade Hybrid Club sign-in required" }, 401);

  const user = await clubUser(token);
  if (!user?.id) return json(req, { error: "Invalid or expired Trade Hybrid Club session" }, 401);

  if (!(await hasPaidAccess(token, String(user.id)))) {
    return json(req, { error: "An active Trade Hybrid membership is required" }, 403);
  }

  const key = secretKey();
  const signalsUrl = (Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "");
  if (!key || !signalsUrl) return json(req, { error: "Signals feed is not configured" }, 503);

  const incoming = new URL(req.url);
  const limit = Math.min(Math.max(Number(incoming.searchParams.get("limit") || "100"), 1), 250);
  const assetClass = incoming.searchParams.get("asset_class");
  const provider = incoming.searchParams.get("provider");
  const status = incoming.searchParams.get("status");

  let query =
    "/rest/v1/canonical_signals?select=id,external_signal_id,strategy_name,symbol,asset_class,direction,entry_price,sl,tp1,tp2,tp3,risk_distance,rr_ratio,status,entry_time,activated_at,closed_at,close_reason,exit_price,r_value,pnl_pct,last_price,last_price_at,created_at,updated_at,provider:providers(name)&order=entry_time.desc&limit=" +
    limit;
  if (assetClass && assetClass !== "all") query += "&asset_class=eq." + encodeURIComponent(assetClass.toUpperCase());

  if (status === "results") query += "&status=in.(SL_HIT,TP3_HIT,CLOSED)";
  else if (status && status !== "all") return json(req, { error: "Unknown status filter" }, 400);

  const response = await fetch(signalsUrl + query, {
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("canonical signal feed failed", response.status, detail);
    return json(req, { error: "Canonical signal feed unavailable" }, 502);
  }

  let rows = await response.json();
  if (!Array.isArray(rows)) rows = [];
  if (provider && provider !== "all") {
    rows = rows.filter((row: any) => String(row?.provider?.name || "").toLowerCase() === provider.toLowerCase());
  }

  const signals = rows.map((row: any) => {
    const providerName = row.provider?.name || "Unknown";
    return {
      id: row.id,
      externalSignalId: row.external_signal_id,
      provider: providerName,
      strategyName: row.strategy_name,
      symbol: row.symbol,
      assetClass: row.asset_class,
      timeframe: providerTimeframe(providerName),
      direction: row.direction,
      entryPrice: row.entry_price == null ? null : Number(row.entry_price),
      stopLoss: row.sl == null ? null : Number(row.sl),
      tp1: row.tp1 == null ? null : Number(row.tp1),
      takeProfit: row.tp1 == null ? null : Number(row.tp1),
      tp2: row.tp2 == null ? null : Number(row.tp2),
      tp3: row.tp3 == null ? null : Number(row.tp3),
      riskDistance: row.risk_distance == null ? null : Number(row.risk_distance),
      rrRatio: row.rr_ratio == null ? null : Number(row.rr_ratio),
      status: row.status,
      entryTime: row.entry_time,
      activatedAt: row.activated_at,
      closedAt: row.closed_at,
      closeReason: row.close_reason,
      exitPrice: row.exit_price == null ? null : Number(row.exit_price),
      rValue: row.r_value == null ? null : Number(row.r_value),
      pnlPct: row.pnl_pct == null ? null : Number(row.pnl_pct),
      lastPrice: row.last_price == null ? null : Number(row.last_price),
      lastPriceAt: row.last_price_at,
    };
  });

  return json(req, {
    signals,
    count: signals.length,
    source: "Trade Hybrid Signals Network",
    canonical: true,
    asOf: new Date().toISOString(),
  });
});

