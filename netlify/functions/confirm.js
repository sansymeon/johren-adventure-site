// netlify/functions/confirm.js
// Requires Netlify Blobs (no DB needed).
// Set env vars in Netlify:
// - SITE_URL (optional) e.g. https://johrenadventure.com
// - ADMIN_TOKEN (optional) for manual LINE approvals

const { getStore } = require("@netlify/blobs");

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type,x-admin-token",
      "access-control-allow-methods": "POST,OPTIONS",
    },
    body: JSON.stringify(obj),
  };
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Bad JSON" });
  }

  const spotId = (body.spotId || "").trim();
  const method = (body.method || "gps").trim(); // "gps" or "line"
  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!spotId) return json(400, { error: "Missing spotId" });

  // If LINE/manual, require admin token
  if (method === "line") {
    const token = event.headers["x-admin-token"] || "";
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return json(403, { error: "Forbidden" });
    }
  } else {
    // For GPS confirms, require coords
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json(400, { error: "Missing lat/lng" });
    }

    // Optional: if the client passes spotLat/spotLng, we can enforce proximity.
    // (You can add these later from the pin page.)
    const spotLat = Number(body.spotLat);
    const spotLng = Number(body.spotLng);
    const radiusM = Number(body.radiusM || 120); // default 120m

    if (Number.isFinite(spotLat) && Number.isFinite(spotLng)) {
      const d = haversineMeters(lat, lng, spotLat, spotLng);
      if (d > radiusM) {
        return json(200, { ok: false, error: "Too far", distance_m: Math.round(d) });
      }
    }
  }

  // Device/user hash (lightweight). You can replace with your existing device ID later.
  const device =
    (body.device || "").trim() ||
    (event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown")
      .split(",")[0]
      .trim();

  const store = getStore("johren-confirmations");

  const key = `confirm:${spotId}`;
  const existing = (await store.get(key, { type: "json" })) || { count: 0, log: [] };

  // Rate-limit: prevent same device from confirming same spot repeatedly
  const now = new Date().toISOString();
  const already = existing.log.some((x) => x.device === device);
  if (already) {
    return json(200, {
      ok: true,
      spotId,
      count: existing.count,
      message: "Already confirmed",
    });
  }

  const entry = { ts: now, method, device };
  const log = [entry, ...existing.log].slice(0, 50);

  const updated = { count: (existing.count || 0) + 1, log };
  await store.set(key, JSON.stringify(updated));

  return json(200, { ok: true, spotId, count: updated.count });
};


