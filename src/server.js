// CIDC AI/UI Gateway - no external dependencies (Node 18+)
const http = require("http");
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LOGS = path.join(__dirname, "..", "logs");
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.CIDC_TOKEN; // required
const VERSION = require("../package.json").version;
if (!TOKEN) { console.error("Set CIDC_TOKEN first: export CIDC_TOKEN=your-secret"); process.exit(1); }
fs.mkdirSync(LOGS, { recursive: true });

const load = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const hits = new Map(); // rate limit: 60 req/min per IP
function limited(ip) {
  const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < 60000);
  a.push(now); hits.set(ip, a); return a.length > 60;
}
function log(req, status) {
  fs.appendFile(path.join(LOGS, "access.log"),
    JSON.stringify({ t: new Date().toISOString(), m: req.method, u: req.url, s: status }) + "\n", () => {});
}
function send(req, res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body)); log(req, status);
}
function readBody(req) {
  return new Promise((ok, no) => {
    let s = ""; req.on("data", (c) => { s += c; if (s.length > 1e6) no(new Error("too large")); });
    req.on("end", () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { no(e); } });
  });
}
const collections = () => ({ languages: load("languages.json").items, "file-formats": load("file-formats.json").items, templates: load("templates.json").items });

http.createServer(async (req, res) => {
  try {
    const url = req.url.split("?")[0];
    if (limited(req.socket.remoteAddress)) return send(req, res, 429, { error: "rate_limited" });
    if (req.headers.authorization !== "Bearer " + TOKEN) return send(req, res, 401, { error: "unauthorized" });
    // Read-only gateway: write/delete methods are not allowed here
    if (req.method === "GET") {
      if (url === "/api/cidc/health") return send(req, res, 200, { status: "ok" });
      if (url === "/api/cidc/modules") return send(req, res, 200, load("modules.json"));
      if (url === "/api/cidc/languages") return send(req, res, 200, load("languages.json"));
      if (url === "/api/cidc/file-formats") return send(req, res, 200, load("file-formats.json"));
      if (url === "/api/cidc/templates") return send(req, res, 200, load("templates.json"));
      if (url === "/api/cidc/version") return send(req, res, 200, { version: VERSION });
      if (url === "/api/cidc/statistics") {
        const c = collections(); const out = {};
        for (const k in c) out[k] = c[k].length;
        return send(req, res, 200, out);
      }
    } else if (req.method === "POST" && (url === "/api/cidc/search" || url === "/api/cidc/retrieve")) {
      const b = await readBody(req); const c = collections();
      if (typeof b.collection !== "string" || !c[b.collection]) return send(req, res, 400, { error: "collection must be one of: " + Object.keys(c).join(", ") });
      let items = c[b.collection];
      if (b.verification_status) items = items.filter((i) => i.verification_status === b.verification_status);
      if (url.endsWith("/retrieve")) {
        const idKey = Object.keys(items[0] || {})[0];
        return send(req, res, 200, { item: items.find((i) => i[idKey] === b.id) || null });
      }
      if (b.query) { const q = String(b.query).toLowerCase(); items = items.filter((i) => JSON.stringify(i).toLowerCase().includes(q)); }
      return send(req, res, 200, { count: items.length, items });
    }
    send(req, res, 404, { error: "not_found" });
  } catch (e) { send(req, res, 500, { error: "server_error" }); }
}).listen(PORT, () => console.log("CIDC gateway on port " + PORT));
