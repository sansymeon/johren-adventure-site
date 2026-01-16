export async function handler(event) {
  // Allow GET (simple to call from browser or a merchant admin page)
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const merchant = (event.queryStringParameters?.merchant || "").trim();
  if (!merchant) {
    return { statusCode: 400, body: "Missing merchant" };
  }

  // (Optional) light gate so random sites don’t hotlink it
  const origin = event.headers?.origin || "";
  const referer = event.headers?.referer || "";
  const okRef =
    origin === "https://johrenadventure.com" ||
    referer.startsWith("https://johrenadventure.com");

  if (!okRef) return { statusCode: 403, body: "Forbidden" };

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) {
    return { statusCode: 500, body: "Server not configured" };
  }

  const auth = { Authorization: `Bearer ${tok}` };
  const totalKey = `johren:total:${merchant}`;

  const data = await fetch(`${url}/get/${encodeURIComponent(totalKey)}`, {
    headers: auth
  }).then(r => r.json()).catch(() => null);

  // Upstash returns strings for GET; normalize to number
  const total = Number(data?.result || 0) || 0;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ merchant, total })
  };
}

