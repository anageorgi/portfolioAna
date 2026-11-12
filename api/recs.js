// Book & song recommendations left by visitors (Vercel serverless function).
// Uses the same Upstash Redis database as api/drawings.js.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TYPES = { books: "ana:recs:books", songs: "ana:recs:songs" };
const KEEP = 300, SHOW = 40;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return (await r.json()).result;
}
const parse = (list) => (list || []).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
const clean = (v, n) => String(v || "").replace(/[<>]/g, "").trim().slice(0, n);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "storage not configured" });
  try {
    if (req.method === "GET") {
      const key = TYPES[String(req.query && req.query.type)];
      if (!key) return res.status(400).json({ error: "bad type" });
      return res.status(200).json({ items: parse(await redis(["LRANGE", key, 0, SHOW - 1])) });
    }
    if (req.method === "POST") {
      let b = req.body;
      if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
      const key = TYPES[String(b && b.type)];
      const text = clean(b && b.text, 120);
      const name = clean(b && b.name, 24);
      if (!key || text.length < 2) return res.status(400).json({ error: "invalid" });
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
      const rk = "ana:rate:recs:" + ip;
      const n = await redis(["INCR", rk]);
      if (n === 1) await redis(["EXPIRE", rk, 600]);
      if (n > 10) return res.status(429).json({ error: "too many" });
      await redis(["LPUSH", key, JSON.stringify({ text, name, t: Date.now() })]);
      await redis(["LTRIM", key, 0, KEEP - 1]);
      return res.status(200).json({ items: parse(await redis(["LRANGE", key, 0, SHOW - 1])) });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};
