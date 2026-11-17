/*
 * Mythara – Testserver: liefert das Repository unter http://localhost:8765/ und zusätzlich unter /abenteuer/ aus
 * (die Tests stammen aus der Zeit, als das Spiel in einem Unterordner lag, und rufen es dort auf).
 * Aufruf: node tools/testserver.js [Port]
 */
const http = require("http"), fs = require("fs"), path = require("path");
const WURZEL = path.join(__dirname, ".."), PORT = Number(process.argv[2]) || 8765;
const TYP = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", json: "application/json", webmanifest: "application/manifest+json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", woff2: "font/woff2", mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", m4a: "audio/mp4", txt: "text/plain; charset=utf-8", md: "text/plain; charset=utf-8" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/abenteuer(\/|$)/, "/");
  let f = path.join(WURZEL, p); if (!f.startsWith(WURZEL)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end("nicht gefunden"); }
  res.writeHead(200, { "Content-Type": TYP[f.split(".").pop().toLowerCase()] || "application/octet-stream", "Content-Length": fs.statSync(f).size, "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log("Mythara-Testserver auf http://localhost:" + PORT + "/ (auch unter /abenteuer/)"));
