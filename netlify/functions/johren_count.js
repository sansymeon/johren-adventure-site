export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  let body = {};
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, body: "Bad JSON" }; }

  const merchant = (body.merchant || "").trim();
  const token = (body.token || "").trim();
  if (!merchant || !token) return { statusCode: 400, body: "Missing merchant/token" };

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return { statusCode: 500, body: "Server not configured" };

  const auth = { Authorization: `Bearer ${tok}` };

  const dedupeKey = `johren:dedupe:${merchant}:${token}`;
  const totalKey  = `johren:total:${merchant}`;

  // set dedupe key once (nx) so each device/day increments max once
  const setnx = await fetch(`${url}/set/${encodeURIComponent(dedupeKey)}/1?nx=1`, { headers: auth })
    .then(r => r.json()).catch(() => null);

  const wasSet = setnx?.result === "OK";
  if (!wasSet) return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  // expire dedupe key (2 days)
  await fetch(`${url}/expire/${encodeURIComponent(dedupeKey)}/172800`, { headers: auth }).catch(()=>{});

  // increment total
  await fetch(`${url}/incr/${encodeURIComponent(totalKey)}`, { headers: auth }).catch(()=>{});

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}
