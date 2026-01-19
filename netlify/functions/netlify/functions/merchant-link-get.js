import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  try {
    const id = (event.queryStringParameters?.id || "").trim();
    if (!id) return json(400, { ok: false, error: "Missing id" });

    const { data, error } = await supabase
      .from("merchant_links")
      .select("url")
      .eq("merchant_id", id)
      .maybeSingle();

    if (error) return json(500, { ok: false, error: error.message });

    return json(200, { ok: true, url: data?.url ?? null });
  } catch (e) {
    return json(500, { ok: false, error: String(e) });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

