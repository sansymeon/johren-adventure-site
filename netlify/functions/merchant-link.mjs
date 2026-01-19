// netlify/functions/merchant-link.js
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TOKEN_SALT = process.env.JBS_TOKEN_SALT;

// Set this to true ONLY if you store hashed tokens in DB
const STORE_HASHED_TOKENS = false;

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(obj),
  };
}

// Keep merchant ids predictable: letters, numbers, underscore, dash
function normalizeMerchantId(s) {
  const id = String(s || "").trim();
  if (!id) return null;
  if (id.length > 80) return null;
  if (!/^[a-z0-9_-]+$/i.test(id)) return null;
  return id;
}

function isValidHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(s) {
  const url = String(s || "").trim();
  if (!url) return null;

  if (!isValidHttpUrl(url)) return null;

  // Hard block weird schemes even if URL() parsed it (belt & braces)
  const u = new URL(url);
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  // Optional: encourage https only (uncomment if you want)
  // if (u.protocol !== "https:") return null;

  // Basic length cap
  if (url.length > 600) return null;

  return u.toString();
}

function tokenHash(token) {
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
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: res.ok, status: res.status, data };
}

function timingSafeEqual(a, b) {
  // avoids subtle timing leaks; overkill here but cheap
  const ab = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function handler(event) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TOKEN_SALT) {
    return json(500, { ok: false, error: "Server not configured" });
  }

  const method = event.httpMethod;

  // ============ GET ============
  // /.netlify/functions/merchant-link?id=merchant_id
  if (method === "GET") {
    const id = normalizeMerchantId(event.queryStringParameters?.id);
    if (!id) return json(400, { ok: false, error: "Invalid or missing id" });

    const q = `merchant_links?select=url,updated_at&merchant_id=eq.${encodeURIComponent(id)}`;
    const { ok, status, data } = await supabaseFetch(q);
    if (!ok) return json(status, { ok: false, error: "DB read failed" });

    const row = Array.isArray(data) && data.length ? data[0] : null;
    return json(200, {
      ok: true,
      id,
      url: row?.url ?? null,
      updated_at: row?.updated_at ?? null,
    });
  }

  // ============ POST ============
  // body: { id, url, token }
  if (method === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { ok: false, error: "Bad JSON" });
    }

    const id = normalizeMerchantId(body.id);
    const token = String(body.token || "").trim();
    const hasUrlField = Object.prototype.hasOwnProperty.call(body, "url");
    const url = hasUrlField ? normalizeUrl(body.url) : null;

    if (!id || !token) return json(400, { ok: false, error: "Missing id/token" });
    if (hasUrlField && body.url && !url) {
      return json(400, { ok: false, error: "Invalid url (http/https only)" });
    }

    // Fetch token for this merchant
    const q = `merchant_links?select=edit_token&merchant_id=eq.${encodeURIComponent(id)}`;
    const r1 = await supabaseFetch(q);
    if (!r1.ok) return json(r1.status, { ok: false, error: "DB read failed" });

    const row = Array.isArray(r1.data) && r1.data.length ? r1.data[0] : null;

    // Don’t leak whether merchant exists (optional but recommended)
    if (!row) return json(403, { ok: false, error: "Bad token" });

    const expected = STORE_HASHED_TOKENS ? row.edit_token : row.edit_token;
    const provided = STORE_HASHED_TOKENS ? tokenHash(token) : token;

    if (!timingSafeEqual(provided, expected)) {
      return json(403, { ok: false, error: "Bad token" });
    }

    // Update url (allow setting null to "remove link")
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

    if (!r2.ok) return json(r2.status, { ok: false, error: "DB update failed" });

    const out = Array.isArray(r2.data) && r2.data.length ? r2.data[0] : null;
    return json(200, {
      ok: true,
      id,
      url: out?.url ?? null,
      updated_at: out?.updated_at ?? null,
    });
  }

  return json(405, { ok: false, error: "Method not allowed" });
}
