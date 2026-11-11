// Notes wall storage for the portfolio (Vercel serverless function).
// Uses an Upstash Redis database connected to the Vercel project
// (Vercel → Storage → Upstash for Redis). No packages needed.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "ana:wall";
const KEEP = 60;        // drawings kept in the database
const SHOW = 12;        // drawings shown on the wall
const MAX_LEN = 160000; // max size of one drawing (data URL characters)

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

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "storage not configured" });
  try {
    if (req.method === "GET") {
      return res.status(200).json({ items: parse(await redis(["LRANGE", KEY, 0, SHOW - 1])) });
    }
    if (req.method === "POST") {
      let b = req.body;
      if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
      const img = String((b && b.img) || "");
      const name = String((b && b.name) || "").replace(/[<>]/g, "").trim().slice(0, 24);
      if (img.length > MAX_LEN || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(img)) {
        return res.status(400).json({ error: "invalid image" });
      }
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
      const rk = "ana:rate:" + ip;
      const n = await redis(["INCR", rk]);
      if (n === 1) await redis(["EXPIRE", rk, 600]);
      if (n > 5) return res.status(429).json({ error: "too many" });
      await redis(["LPUSH", KEY, JSON.stringify({ img, name, t: Date.now() })]);
      await redis(["LTRIM", KEY, 0, KEEP - 1]);
      return res.status(200).json({ items: parse(await redis(["LRANGE", KEY, 0, SHOW - 1])) });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};
