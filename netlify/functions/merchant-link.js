// netlify/functions/merchant-link.js
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TOKEN_SALT = process.env.JBS_TOKEN_SALT;

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(obj),
  };
}

function isValidHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Optional: normalize/limit what merchants can set
function normalizeUrl(s) {
  const url = String(s || "").trim();
  if (!url) return null;
  if (!isValidHttpUrl(url)) return null;
  if (url.length > 600) return null; // simple safety cap
  return url;
}

function tokenHash(token) {
  // hash token before comparing (so tokens aren't handled in plain form longer than needed)
  return crypto
    .createHash("sha256")
    .update(`${TOKEN_SALT}:${token}`)
    .digest("hex");
}

async function supabaseFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...opts.headers,
    },
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  return { ok: res.ok, status: res.status, data };
}

export async function handler(event) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TOKEN_SALT) {
    return json(500, { error: "Server not configured" });
  }

  const method = event.httpMethod;

  // ============ GET ============
  // /.netlify/functions/merchant-link?id=merchant_id
  if (method === "GET") {
    const id = (event.queryStringParameters?.id || "").trim();
    if (!id) return json(400, { error: "Missing id" });

    // Fetch one row
    const q = `merchant_links?select=merchant_id,url,updated_at&merchant_id=eq.${encodeURIComponent(id)}`;
    const { ok, status, data } = await supabaseFetch(q);

    if (!ok) return json(status, { error: "DB read failed", details: data });

    // If not found, return null (don’t leak existence if you prefer; your call)
    const row = Array.isArray(data) && data.length ? data[0] : null;
    return json(200, { id, url: row?.url || null, updated_at: row?.updated_at || null });
  }

  // ============ POST ============
  // body: { id, url, token }
  if (method === "POST") {
    let body;
    try { body = JSON.parse(event.body || "{}"); }
    catch { return json(400, { error: "Bad JSON" }); }

    const id = String(body.id || "").trim();
    const token = String(body.token || "").trim();
    const url = normalizeUrl(body.url);

    if (!id || !token) return json(400, { error: "Missing id/token" });
    if (body.url && !url) return json(400, { error: "Invalid url (must be http/https)" });

    // Read current row (needs edit_token)
    const q = `merchant_links?select=merchant_id,edit_token&merchant_id=eq.${encodeURIComponent(id)}`;
    const r1 = await supabaseFetch(q);
    if (!r1.ok) return json(r1.status, { error: "DB read failed", details: r1.data });

    const row = Array.isArray(r1.data) && r1.data.length ? r1.data[0] : null;
    if (!row) return json(404, { error: "Unknown merchant id" });

    // Compare hashed tokens (store raw token in DB is okay early-stage, but hashing is better)
    // If your DB stores raw tokens, compare directly: token === row.edit_token
    // If you want hashing: store tokenHash(token) in DB.
    // For now, simplest: raw compare:
    if (token !== row.edit_token) return json(403, { error: "Bad token" });

    // Update url
    const payload = { url, updated_at: new Date().toISOString() };
    const r2 = await supabaseFetch(
      `merchant_links?merchant_id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!r2.ok) return json(r2.status, { error: "DB update failed", details: r2.data });

    const out = Array.isArray(r2.data) && r2.data.length ? r2.data[0] : null;
    return json(200, { ok: true, id, url: out?.url ?? null, updated_at: out?.updated_at ?? null });
  }

  return json(405, { error: "Method not allowed" });
}
