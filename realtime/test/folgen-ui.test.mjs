/* Folgen (Issue #54) in der 3D-Welt: Spielserver gegen nachgebildete Supabase, zwei Spieler in der Waldmark (?welt3d=1), Aufbau wie welt3d-mmo.test.mjs.
   Anna drückt lange auf Ben → „Folgen“; Ben läuft, Anna kommt hinterher und hält Abstand; Anna tippt woandershin → das Folgen endet;
   Ben geht offline → das Folgen endet mit Meldung. Aufruf (im Ordner realtime, nach node build.mjs): node test/folgen-ui.test.mjs */
import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
const WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const BILD = process.env.BILD || "";
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url.startsWith("/fake/")) { res.setHeader("access-control-allow-origin", "*"); if (req.url === "/fake/einladen") { const a = JSON.parse(b || "{}"); EINL.push({ id: "e" + EINL.length, von: a.von, an: a.an, code: a.code }); return send(200, { ok: true }); }
    if (req.url.startsWith("/fake/einladungen")) return send(200, EINL.filter((e) => e.an === new URL(req.url, "http://x").searchParams.get("an")));
    if (req.url.startsWith("/fake/weg")) { const id = new URL(req.url, "http://x").searchParams.get("id"); const i = EINL.findIndex((e) => e.id === id); if (i >= 0) EINL.splice(i, 1); return send(200, { ok: true }); } }
  if (req.headers.apikey !== "sb_secret_test" || (req.url !== "/auth/v1/user" && req.headers.authorization !== "Bearer sb_secret_test")) return send(401, { message: "anon" });
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: (WERTE[wer(req.url)] || { ep: {} }).ep }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, SIEGE.filter((s) => s.user === wer(req.url)));
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_sieg") { const a = JSON.parse(b); SIEGE.push({ user: a.p_user, ort: a.p_ort, kampf: a.p_kampf }); return send(200, { ok: true }); }
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_gutschrift") { const a = JSON.parse(b); buchungen.push(a); const W = WERTE[a.p_user]; for (const [h, n] of Object.entries(a.p_ep)) W.ep[h] = (W.ep[h] || 0) + n; W.seelen += a.p_seelen; return send(200, { ep: W.ep, seelen: W.seelen }); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, PROFIL[wer(req.url)] ? [{ handle: PROFIL[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, AKTIV[wer(req.url)] ? [{ held: AKTIV[wer(req.url)] }] : []);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_held_setzen") { const a = JSON.parse(b); AKTIV[a.p_user] = a.p_held; HELDSETZEN.push(a); return send(200, { ok: true, held: a.p_held }); }
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8799/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8799/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8799/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "&server=ws://localhost:8787", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, held) { const ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e)); p.on("websocket", (w) => { const t0 = Date.now(); console.log("    " + name + " ws:", w.url()); w.on("framesent", (f) => console.log("    " + name + " sendet nach " + (Date.now() - t0) + " ms:", String(f.payload).slice(0, 90))); w.on("close", () => console.log("    " + name + " ws zu nach " + (Date.now() - t0) + " ms")); }); p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("    " + name + " " + m.type() + ":", m.text().slice(0, 200)); });
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE(name) }));
  await ctx.addInitScript(([t, h]) => { sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); localStorage.setItem("ez__alles", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: t.includes("anna") ? "frau" : "mann", frisur: t.includes("anna") ? "dutt_hoch" : "scheitel", bart: "ohne", haar: "orange", haut: "hell" }, waffe: t.includes("anna") ? "bogen" : "schwert" })); localStorage.removeItem("ez_welt_pos"); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true })); }, [token, held]);
  await ctx.addInitScript(() => { const W = window.WebSocket; window.WebSocket = function (u, ...r) { const w = new W(u, ...r); console.warn("WS-NEU " + new Error().stack.split("\n").slice(2, 5).map((x) => x.trim().slice(0, 60)).join(" < ")); w.addEventListener("close", (e) => console.warn("WS-ZU " + e.code + " " + e.reason)); return w; }; window.WebSocket.prototype = W.prototype; Object.assign(window.WebSocket, { OPEN: 1, CLOSED: 3, CONNECTING: 0, CLOSING: 2 }); });
  return p; }
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), "schildwaechter"), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), "kopfgeldjaeger");
  await anna.goto(B + "?welt3d=1&schatten=0&zeitraffer=1" + S); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.ich(), null, { timeout: 90000 }).catch(() => {});
  await ben.goto(B + "?welt3d=1&schatten=0&zeitraffer=1" + S);
  await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.spielerOrt("Ben"), null, { timeout: 90000 }).catch(() => {});
  await ben.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.spielerOrt("Anna"), null, { timeout: 90000 }).catch(() => {});
  check(await anna.evaluate(() => Boolean(window.EZW.welt3d.spielerOrt("Ben"))), "Anna sieht Ben");
  await anna.waitForTimeout(2500); /* Figuren laden */
  const ort = (p) => p.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y }));
  /* Lange drücken auf Ben: im Aktionsmenü steht „Folgen“ */
  await anna.evaluate(() => document.activeElement && document.activeElement.blur());
  const wo = await anna.evaluate(() => { const W = window.EZW.welt3d, b = W.spielerOrt("Ben"); return b ? W.motor.bildschirm(b.x, W.motor.hoehe(b.x, b.y) + 0.9, b.y) : null; });
  if (wo) await anna.evaluate((q) => window.EZW.welt3d.menueBei(q.x, q.y), wo);
  const knopf = await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent.trim()));
  check(knopf.some((t) => /Folgen/.test(t)), `Aktionsmenü bei Ben: „Folgen“ (${knopf.join(" · ")})`);
  await anna.evaluate(() => { const b = [...document.querySelectorAll(".ez-aktionen button")].find((x) => /Folgen/.test(x.textContent)); if (b) b.click(); });
  check(await anna.evaluate(() => window.EZW.welt3d.folgtWem() === "Ben" && !document.getElementById("ez-folgen").hidden && /Du folgst Ben/.test(document.getElementById("ez-folgen").textContent)), "Anna folgt Ben, oben steht „Du folgst Ben“");
  /* Ben läuft weg – Anna kommt hinterher */
  const a0 = await ort(anna), b0 = await ort(ben);
  await ben.evaluate(() => window.EZW.gehe(window.EZW.welt3d.ort.x + 7, window.EZW.welt3d.ort.y + 1));
  await ben.waitForFunction((v) => Math.hypot(window.EZW.welt3d.ort.x - v.x, window.EZW.welt3d.ort.y - v.y) > 6 && !window.EZW.welt3d.pfad.length, b0, { timeout: 30000 }).catch(() => {});
  const b1 = await ort(ben);
  await anna.waitForFunction((v) => Math.hypot(window.EZW.welt3d.ort.x - v.x, window.EZW.welt3d.ort.y - v.y) < 3.2, b1, { timeout: 30000 }).catch(() => {});
  const a1 = await ort(anna), d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y);
  check(Math.hypot(a1.x - a0.x, a1.y - a0.y) > 3 && d1 < 3.2, `Anna läuft hinterher (${Math.hypot(a1.x - a0.x, a1.y - a0.y).toFixed(1)} Felder) und bleibt nah bei Ben (${d1.toFixed(1)} Felder)`);
  await anna.waitForTimeout(1500); const a2 = await ort(anna);
  check(Math.hypot(a2.x - b1.x, a2.y - b1.y) >= 0.9, `sie hält Abstand und läuft nicht in ihn hinein (${Math.hypot(a2.x - b1.x, a2.y - b1.y).toFixed(1)} Felder)`);
  /* Anna tippt woandershin: das Folgen endet */
  await anna.evaluate(() => window.EZW.welt3d.gehe(window.EZW.welt3d.ort.x - 3, window.EZW.welt3d.ort.y));
  check(await anna.evaluate(() => window.EZW.welt3d.folgtWem() === null && document.getElementById("ez-folgen").hidden), "Anna tippt woandershin: das Folgen endet, der Hinweis ist weg");
  await ben.evaluate(() => window.EZW.gehe(window.EZW.welt3d.ort.x + 6, window.EZW.welt3d.ort.y)); await anna.waitForTimeout(4000); const a3 = await ort(anna), b3 = await ort(ben);
  check(Math.hypot(a3.x - b3.x, a3.y - b3.y) > 4, `danach läuft Anna Ben nicht mehr nach (${Math.hypot(a3.x - b3.x, a3.y - b3.y).toFixed(1)} Felder auseinander)`);
  /* wieder folgen; Ben geht offline */
  await anna.evaluate(() => window.EZW.welt3d.folgen("Ben")); check(await anna.evaluate(() => window.EZW.welt3d.folgtWem() === "Ben"), "erneut folgen (direkt)");
  await ben.close(); await anna.waitForFunction(() => window.EZW.welt3d.folgtWem() === null, null, { timeout: 15000 }).catch(() => {});
  check(await anna.evaluate(() => window.EZW.welt3d.folgtWem() === null && window.EZW.chat().some((c) => /Ben ist nicht mehr hier/.test(c.text || c))), "Ben geht offline: das Folgen endet mit „Ben ist nicht mehr hier.“");
  check(fehlerSeite.length === 0, "Keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? `${fehler} Fehler` : "Folgen: alles in Ordnung"); process.exit(fehler ? 1 : 0);
