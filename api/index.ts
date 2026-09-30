import crypto from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://uqtluroceakqtlvlzatt.supabase.co").replace(/\/$/, "");

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

  if (req.method === "GET" && path === "health") {
    const key = serviceKey();
    return res.status(200).json({
      ok: true,
      service: "trade-hybrid-club-api",
      configured: {
        whopWebhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
        supabaseServiceRole: Boolean(key),
      },
    });
  }

  if (req.method === "GET" && path === "integration-health") {
    if (String(req.query?.bridgeFingerprint || "") === "1" && process.env.WHOP_WEBHOOK_SECRET) {
      const fingerprint = crypto
        .createHash("sha256")
        .update(process.env.WHOP_WEBHOOK_SECRET)
        .digest("hex");
      console.info("[whop-bridge-fingerprint]", fingerprint);
    }

    try {
      const response = await fetch(
        SUPABASE_URL + "/functions/v1/integration-health",
        { headers: { apikey: "sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_" } },
      );
      const supabase = await response.json();
      return res.status(response.ok ? 200 : 502).json({
        ok: response.ok,
        vercel: {
          whopWebhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
          supabaseServiceRole: Boolean(serviceKey()),
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
    const key = serviceKey();
    if (!process.env.WHOP_WEBHOOK_SECRET || !key) {
      return res.status(503).json({
        received: false,
        error: "Whop webhook backend is not fully configured.",
      });
    }

    let eventId = "";

    try {
      const rawBody = await readRawBody(req);
      const event = verifyWhopSignature(req, rawBody);
      const recorded = await recordWhopEvent(event, key);
      eventId = recorded.eventId;

      if (recorded.duplicate) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      try {
        await syncWhopEntitlement(event, key);
        await finishWhopEvent(eventId, key, null);
        return res.status(200).json({ received: true });
      } catch (syncError) {
        const message =
          syncError instanceof Error
            ? syncError.message
            : "Entitlement sync failed";
        await finishWhopEvent(eventId, key, message);
        console.error("[whop] entitlement sync failed", message);
        return res.status(200).json({
          received: true,
          processed: false,
        });
      }
    } catch (error) {
      console.error("[whop] webhook rejected", error);
      return res.status(400).json({ received: false });
    }
  }

  return res.status(404).json({ error: "Not found" });
}
