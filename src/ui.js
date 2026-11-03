// CIDC Dashboard UI server (no dependencies). Binds to 127.0.0.1 only.
// Serves ui/index.html and proxies /api/cidc/* to the CIDC API, adding the token server-side.
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = process.env.UI_PORT || 5190;
const API = new URL(process.env.CIDC_API || "http://127.0.0.1:8800");
const TOKEN = process.env.CIDC_TOKEN;
const PAGE = path.join(__dirname, "..", "ui", "index.html");
if (!TOKEN) { console.error("Set CIDC_TOKEN first (source ~/.cidc_env)"); process.exit(1); }

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return fs.createReadStream(PAGE).pipe(res);
  }
  if (url.startsWith("/api/cidc/") && (req.method === "GET" || req.method === "POST")) {
    const p = http.request({ hostname: API.hostname, port: API.port, path: req.url, method: req.method,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + TOKEN } }, (r) => {
      res.writeHead(r.statusCode, { "Content-Type": "application/json; charset=utf-8" });
      r.pipe(res);
    });
    p.on("error", () => { res.writeHead(502); res.end('{"error":"cidc_api_down"}'); });
    return req.pipe(p);
  }
  res.writeHead(404); res.end("not found");
}).listen(PORT, "127.0.0.1", () => console.log("CIDC UI on http://127.0.0.1:" + PORT));
