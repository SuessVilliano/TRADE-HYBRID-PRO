import crypto from "node:crypto";
import { marketBuddy } from "../server/club-market-buddy";
import Parser from "rss-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://uqtluroceakqtlvlzatt.supabase.co").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_";

type PublicNewsSource = {
  id: string;
  name: string;
  rssUrls: string[];
};

const PUBLIC_NEWS_SOURCES: PublicNewsSource[] = [
  {
    id: "cnbc",
    name: "CNBC",
    rssUrls: [
      "https://www.cnbc.com/id/10000664/device/rss/rss.html",
      "https://www.cnbc.com/id/15837362/device/rss/rss.html",
    ],
  },
  {
    id: "marketwatch",
    name: "MarketWatch",
    rssUrls: ["https://www.marketwatch.com/rss/topstories"],
  },
  {
    id: "yahoo_finance",
    name: "Yahoo Finance",
    rssUrls: ["https://finance.yahoo.com/news/rssindex"],
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    rssUrls: ["https://www.coindesk.com/arc/outboundfeeds/rss/"],
  },
  {
    id: "cointelegraph",
    name: "CoinTelegraph",
    rssUrls: ["https://cointelegraph.com/rss"],
  },
  {
    id: "investing",
    name: "Investing.com",
    rssUrls: ["https://www.investing.com/rss/news.rss"],
  },
  {
    id: "nasdaq",
    name: "Nasdaq",
    rssUrls: ["https://www.nasdaq.com/feed/rssoutbound"],
  },
];

const publicNewsParser = new Parser();

function cleanNewsText(value: unknown) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNewsTimestamp(item: any) {
  const candidate = item?.isoDate || item?.pubDate || item?.published || "";
  const timestamp = Date.parse(candidate);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

async function fetchPublicNewsSource(source: PublicNewsSource, requestedLimit = 20) {
  const limit = Math.min(Math.max(Number(requestedLimit) || 20, 1), 50);
  const collected: any[] = [];

  for (const url of source.rssUrls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TradeHybridNews/1.0 (+https://tradehybrid.co)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn("[news] feed request failed", source.id, response.status, url);
        continue;
      }

      const xml = await response.text();
      const feed = await publicNewsParser.parseString(xml);
      const items = Array.isArray(feed?.items) ? feed.items : [];

      for (const item of items) {
        const title = cleanNewsText(item?.title);
        const link = String(item?.link || "").trim();
        if (!title || !link) continue;

        collected.push({
          id: source.id + "-" + (item?.guid || item?.id || link),
          title,
          description: cleanNewsText(item?.contentSnippet || item?.content || item?.summary || item?.description),
          link,
          pubDate: item?.isoDate || item?.pubDate || new Date().toISOString(),
          source: source.name,
          sourceId: source.id,
        });
      }
    } catch (error) {
      console.warn("[news] feed unavailable", source.id, url, error);
    } finally {
      clearTimeout(timeout);
    }
  }

  const seen = new Set<string>();
  return collected
    .sort((a, b) => toNewsTimestamp(b) - toNewsTimestamp(a))
    .filter((item) => {
      const key = item.link || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function serviceKey() {
  const direct =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";
  if (direct) return direct;

  try {
    const parsed = JSON.parse(process.env.SUPABASE_SECRET_KEYS || "{}");
    return parsed.default || "";
  } catch {
    return "";
  }
}

async function readRawBody(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getHeader(req: any, name: string) {
  const value = req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function verifyWhopSignature(req: any, rawBody: Buffer) {
  const secret = process.env.WHOP_WEBHOOK_SECRET || "";
  const webhookId = getHeader(req, "webhook-id");
  const timestamp = getHeader(req, "webhook-timestamp");
  const signatureHeader = getHeader(req, "webhook-signature");

  if (!secret) throw new Error("WHOP_WEBHOOK_SECRET is not configured");
  if (!webhookId || !timestamp || !signatureHeader) {
    throw new Error("Missing Whop webhook verification material");
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > 300
  ) {
    throw new Error("Whop webhook timestamp outside replay window");
  }

  const signedPayload = Buffer.from(
    webhookId + "." + timestamp + "." + rawBody.toString("utf8"),
  );
  const secretBody = secret.startsWith("ws_") ? secret.slice(3) : secret;

  const keyCandidates: Buffer[] = [];
  try {
    const decoded = Buffer.from(secretBody, "base64");
    if (decoded.length) keyCandidates.push(decoded);
  } catch {
    // fall through to raw secret candidate
  }
  keyCandidates.push(Buffer.from(secret));

  const expected = keyCandidates.map((key) =>
    crypto.createHmac("sha256", key).update(signedPayload).digest("base64"),
  );

  const candidates = signatureHeader
    .split(/[ ,]+/)
    .map((value) => value.replace(/^v1,?/, ""))
    .filter(Boolean);

  const valid = candidates.some((candidate) =>
    expected.some((value) => {
      const a = Buffer.from(candidate);
      const b = Buffer.from(value);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    }),
  );

  if (!valid) throw new Error("Invalid Whop webhook signature");

  return JSON.parse(rawBody.toString("utf8"));
}

async function callWhopBridge(action: "health" | "event", payload: Record<string, any> = {}) {
  const secret = process.env.WHOP_WEBHOOK_SECRET || "";
  if (!secret) throw new Error("WHOP_WEBHOOK_SECRET is not configured");

  const response = await fetch(
    SUPABASE_URL + "/functions/v1/whop-entitlement-sync",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "x-tradehybrid-bridge-secret": secret,
      },
      body: JSON.stringify({ action, ...payload }),
    },
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error || "Whop entitlement bridge is unavailable");
  }

  return body;
}

function adminHeaders(key: string, prefer?: string) {
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function findAuthUserByEmail(email: string, key: string) {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return null;

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`,
      { headers: adminHeaders(key) },
    );

    if (!response.ok) {
      throw new Error("Supabase Auth user lookup failed");
    }

    const body: any = await response.json();
    const users = Array.isArray(body?.users) ? body.users : [];
    const match = users.find(
      (user: any) => String(user?.email || "").toLowerCase() === wanted,
    );
    if (match) return match;
    if (users.length < 1000) break;
  }

  return null;
}

async function recordWhopEvent(event: any, key: string) {
  const data = event?.data || {};
  const eventId = String(event?.id || "");
  const eventType = String(event?.type || "");
  const whopUserId =
    data?.user_id ||
    data?.user?.id ||
    data?.member?.user_id ||
    data?.member?.user?.id ||
    null;
  const membershipId =
    data?.membership_id ||
    data?.membership?.id ||
    (eventType.startsWith("membership.") ? data?.id : null) ||
    null;

  if (!eventId) throw new Error("Whop event is missing an id");

  const existing = await fetch(
    `${SUPABASE_URL}/rest/v1/whop_webhook_events?event_id=eq.${encodeURIComponent(eventId)}&select=id,processed_at&limit=1`,
    { headers: adminHeaders(key) },
  );
  if (!existing.ok) throw new Error("Could not check Whop event idempotency");
  const existingRows: any[] = await existing.json();
  if (existingRows.length && existingRows[0]?.processed_at) {
    return { duplicate: true, eventId, eventType, data };
  }

  const upsert = await fetch(
    `${SUPABASE_URL}/rest/v1/whop_webhook_events?on_conflict=event_id`,
    {
      method: "POST",
      headers: adminHeaders(key, "resolution=merge-duplicates,return=minimal"),
      body: JSON.stringify({
        event_id: eventId,
        event_type: eventType,
        whop_user_id: whopUserId,
        whop_membership_id: membershipId,
        payload: event,
        processing_error: null,
      }),
    },
  );

  if (!upsert.ok) {
    throw new Error("Could not persist Whop webhook event");
  }

  return { duplicate: false, eventId, eventType, data };
}

async function finishWhopEvent(
  eventId: string,
  key: string,
  processingError: string | null,
) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/whop_webhook_events?event_id=eq.${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: adminHeaders(key, "return=minimal"),
      body: JSON.stringify({
        processed_at: new Date().toISOString(),
        processing_error: processingError,
      }),
    },
  );

  if (!response.ok) {
    console.error("[whop] failed to mark webhook processed", response.status);
  }
}

async function syncWhopEntitlement(event: any, key: string) {
  const type = String(event?.type || "");
  const data = event?.data || {};

  const activeEvents = new Set(["payment.succeeded", "membership.activated"]);
  const inactiveEvents = new Set(["membership.deactivated"]);

  if (!activeEvents.has(type) && !inactiveEvents.has(type)) {
    return { changed: false, reason: "event_not_entitlement_changing" };
  }

  const email = String(
    data?.email ||
      data?.user?.email ||
      data?.member?.email ||
      data?.member?.user?.email ||
      data?.membership?.user?.email ||
      "",
  )
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("Whop entitlement event has no member email");
  }

  const user = await findAuthUserByEmail(email, key);
  if (!user?.id) {
    throw new Error("No Trade Hybrid Club user matches the Whop member email");
  }

  const membershipId =
    data?.membership_id ||
    data?.membership?.id ||
    (type.startsWith("membership.") ? data?.id : null) ||
    event?.id ||
    null;

  const planId =
    data?.plan_id ||
    data?.plan?.id ||
    data?.membership?.plan_id ||
    data?.membership?.plan?.id ||
    null;

  const active = !inactiveEvents.has(type);
  const now = new Date().toISOString();

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/product_entitlements?on_conflict=user_id,product_key`,
    {
      method: "POST",
      headers: adminHeaders(key, "resolution=merge-duplicates,return=minimal"),
      body: JSON.stringify({
        user_id: user.id,
        product_key: "club_paid",
        status: active ? "active" : "inactive",
        source: "whop",
        source_ref: membershipId ? String(membershipId) : String(event?.id || ""),
        starts_at: active ? now : undefined,
        ends_at: active ? null : now,
        metadata: {
          whop_user_id:
            data?.user_id || data?.user?.id || data?.member?.user_id || null,
          whop_membership_id: membershipId,
          whop_plan_id: planId,
          event_type: type,
          synced_at: now,
        },
        updated_at: now,
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("[whop] entitlement upsert failed", response.status, detail);
    throw new Error("Could not update Trade Hybrid entitlement");
  }

  return { changed: true, active, userId: user.id };
}

export default async function handler(req: any, res: any) {
  const pathValue = req.query?.path;
  const path = Array.isArray(pathValue)
    ? pathValue.join("/")
    : String(pathValue || "");

  if (req.method === "POST" && path === "market-buddy/chat") return marketBuddy(req, res, readRawBody);

  if (req.method === "GET" && path === "rss-feeds/sources") {
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json({
      sources: PUBLIC_NEWS_SOURCES.map(({ id, name }) => ({ id, name })),
      asOf: new Date().toISOString(),
    });
  }

  if (req.method === "GET" && path.startsWith("rss-feeds/source/")) {
    const sourceId = decodeURIComponent(path.slice("rss-feeds/source/".length));
    const source = PUBLIC_NEWS_SOURCES.find((candidate) => candidate.id === sourceId);

    if (!source) {
      return res.status(404).json({ error: "Unknown news source." });
    }

    const limit = Math.min(Math.max(Number(req.query?.limit) || 20, 1), 50);
    const items = await fetchPublicNewsSource(source, limit);

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({
      items,
      source: { id: source.id, name: source.name },
      asOf: new Date().toISOString(),
      stale: items.length === 0,
    });
  }

  if (req.method === "GET" && path === "rss-feeds/news") {
    const limit = Math.min(Math.max(Number(req.query?.limit) || 30, 1), 50);
    const batches = await Promise.all(
      PUBLIC_NEWS_SOURCES.slice(0, 5).map((source) =>
        fetchPublicNewsSource(source, Math.min(limit, 12)),
      ),
    );

    const seen = new Set<string>();
    const items = batches
      .flat()
      .sort((a, b) => toNewsTimestamp(b) - toNewsTimestamp(a))
      .filter((item) => {
        const key = item.link || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({
      items,
      asOf: new Date().toISOString(),
      stale: items.length === 0,
    });
  }

  if (req.method === "GET" && path === "health") {
    return res.status(200).json({
      ok: true,
      service: "trade-hybrid-club-api",
      configured: {
        whopWebhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
        whopEntitlementBridge: true,
      },
    });
  }

  if (req.method === "GET" && path === "integration-health") {
    try {
      const [supabaseResponse, whopBridge] = await Promise.all([
        fetch(
          SUPABASE_URL + "/functions/v1/integration-health",
          { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
        ),
        process.env.WHOP_WEBHOOK_SECRET
          ? callWhopBridge("health").then(() => true).catch(() => false)
          : Promise.resolve(false),
      ]);

      const supabase = await supabaseResponse.json().catch(() => ({}));
      const coreOk = supabaseResponse.ok && Boolean(process.env.WHOP_WEBHOOK_SECRET) && whopBridge;

      return res.status(coreOk ? 200 : 502).json({
        ok: coreOk,
        vercel: {
          whopWebhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
          whopEntitlementBridge: whopBridge,
          streamKey: Boolean(process.env.STREAM_KEY),
          streamSecret: Boolean(process.env.STREAM_SECRET),
          vercelOidc: Boolean(process.env.VERCEL_OIDC_TOKEN),
        },
        supabase: supabase?.configured || null,
      });
    } catch {
      return res.status(502).json({ ok: false, error: "Integration health unavailable." });
    }
  }

  if (
    req.method === "POST" &&
    path === "billing/whop/webhook"
  ) {
    if (!process.env.WHOP_WEBHOOK_SECRET) {
      return res.status(503).json({
        received: false,
        error: "Whop webhook verification is not configured.",
      });
    }

    let event: any;

    try {
      const rawBody = await readRawBody(req);
      event = verifyWhopSignature(req, rawBody);
    } catch (error) {
      console.error("[whop] webhook rejected", error);
      return res.status(400).json({ received: false });
    }

    try {
      const result = await callWhopBridge("event", { event });
      return res.status(200).json({
        received: true,
        processed: result?.processed !== false,
        duplicate: Boolean(result?.duplicate),
      });
    } catch (error) {
      console.error("[whop] entitlement bridge unavailable", error);
      return res.status(503).json({
        received: false,
        error: "Entitlement sync temporarily unavailable.",
      });
    }
  }

  return res.status(404).json({ error: "Not found" });
}
