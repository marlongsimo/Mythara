/* Mitspieler in der 3D-Welt (Stufe 2): Spielserver gegen nachgebildete Supabase, zwei Spieler in der Waldmark (?welt3d=1).
   Anna sieht Ben als Figur mit Namen und Stufe, auf der Minikarte, er läuft – Anna sieht es; öffentlicher Chat als Sprechblase; Antippen öffnet die Spielerkarte. */
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
  await anna.goto(B + "?welt3d=1&schatten=0&zeitraffer=1" + S); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.ich(), null, { timeout: 90000 }).catch(() => {}); /* nacheinander: zwei 3D-Seiten zugleich überlasten den Testbrowser ohne Grafikkarte */
  await ben.goto(B + "?welt3d=1&schatten=0&zeitraffer=1" + S);
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.ich() && window.EZW.spieler().length >= 1 && window.EZW.welt3d.mit && window.EZW.welt3d.mit.figuren.size >= 1, null, { timeout: 90000 }).catch(() => {});
  for (const [n, p] of [['Anna', anna], ['Ben', ben]]) console.log('    ' + n + ':', await p.evaluate(() => JSON.stringify({ url: location.search, w3d: !!(window.EZW && window.EZW.welt3d), ich: !!(window.EZW && window.EZW.ich && window.EZW.ich()), start: !document.getElementById('ez-start') || document.getElementById('ez-start').hidden, hier: window.EZW.welt3d && window.EZW.welt3d.hier, chat: window.EZW.chat && window.EZW.chat().map((m) => m.text).slice(-3) })));
  const sicht = await anna.evaluate(() => { const W = window.EZW.welt3d, f = [...W.mit.figuren.values()][0]; return { spieler: window.EZW.spieler().map((d) => d.n), figuren: W.mit.figuren.size, schild: f && f.nm.textContent, sichtbar: f && !f.nm.hidden, geladen: f && f.f.geladen }; });
  check(sicht.figuren === 1 && sicht.spieler.includes("Ben"), `Anna sieht Ben in der 3D-Welt (${sicht.spieler.join(", ")})`);
  await anna.waitForFunction(() => { const f = [...window.EZW.welt3d.mit.figuren.values()][0]; return f && f.f.geladen; }, null, { timeout: 30000 }).catch(() => {});
  check(/^Ben · Lv \d+$/.test(sicht.schild || "") , `Über Ben: „${sicht.schild}“`);
  check(await anna.evaluate(() => document.querySelectorAll("#ez-karte u.freund").length) === 1, "Ben erscheint auf Annas Minikarte");
  /* Ben läuft – Anna sieht seine Figur wandern */
  const vor = await anna.evaluate(() => { const g = [...window.EZW.welt3d.mit.figuren.values()][0].f.bild.gruppe.position; return { x: g.x, z: g.z }; });
  await ben.evaluate(() => window.EZW.gehe(window.EZW.welt3d.ort.x + 3, window.EZW.welt3d.ort.y - 4));
  await anna.waitForFunction((v) => { const g = [...window.EZW.welt3d.mit.figuren.values()][0].f.bild.gruppe.position; return Math.hypot(g.x - v.x, g.z - v.z) > 2.5; }, vor, { timeout: 40000 }).catch(() => {});
  const nach = await anna.evaluate(() => { const g = [...window.EZW.welt3d.mit.figuren.values()][0].f.bild.gruppe.position; return { x: g.x, z: g.z }; });
  check(Math.hypot(nach.x - vor.x, nach.z - vor.z) > 2.5, `Ben läuft – Anna sieht es (${Math.hypot(nach.x - vor.x, nach.z - vor.z).toFixed(1)} Felder)`);
  if (BILD) await anna.screenshot({ path: BILD + "mitspieler.png" });
  /* öffentlicher Chat als Sprechblase */
  await anna.evaluate(() => { new MutationObserver(() => { if ([...document.querySelectorAll(".ez-blase3d")].some((b) => b.textContent === "Hallo in 3D")) window.__eigeneBlase = true; }).observe(document.body, { childList: true }); });
  await ben.evaluate(() => { new MutationObserver(() => { if ([...document.querySelectorAll(".ez-blase3d")].some((b) => b.textContent === "Hallo in 3D")) window.__blase = true; }).observe(document.body, { childList: true, subtree: true }); });
  await anna.fill("#ez-chat input", "Hallo in 3D"); await anna.press("#ez-chat input", "Enter");
  await ben.waitForFunction(() => window.__blase, null, { timeout: 15000 }).catch(() => {});
  check(await ben.evaluate(() => window.__blase === true), "Ben sieht Annas Nachricht als Sprechblase über ihr");
  await anna.waitForFunction(() => window.__eigeneBlase, null, { timeout: 10000 }).catch(() => {});
  console.log("    Anna nach dem Senden:", await anna.evaluate(() => JSON.stringify({ chat: window.EZW.chat().slice(-2), ich: window.EZW.ich() && window.EZW.ich().id, blasen: document.querySelectorAll(".ez-blase3d").length })));
  check(await anna.evaluate(() => window.__eigeneBlase || [...document.querySelectorAll(".ez-blase3d")].some((b) => b.textContent === "Hallo in 3D")), "Anna sieht ihre eigene Sprechblase");
  if (BILD) await ben.screenshot({ path: BILD + "blase.png" });
  /* Antippen öffnet die Spielerkarte */
  await anna.evaluate(() => document.activeElement && document.activeElement.blur());
  const wo = await anna.evaluate(() => { const W = window.EZW.welt3d, f = [...W.mit.figuren.values()][0], g = f.f.bild.gruppe.position, p = W.motor.bildschirm(g.x, g.y + 0.9, g.z); return p; });
  const frei = wo && await anna.evaluate((q) => { const e = document.elementFromPoint(q.x, q.y); return e ? e.tagName + (e.id ? '#' + e.id : '') : ''; }, wo); console.log('    Ben am Bildschirm:', wo && wo.x.toFixed(0), wo && wo.y.toFixed(0), 'dort liegt', frei);
  if (wo) await anna.mouse.click(wo.x, wo.y); await anna.waitForSelector(".tafel.spieler", { timeout: 5000 }).catch(() => {});
  check(await anna.evaluate(() => !!document.querySelector(".tafel.spieler") && /Ben/.test(document.querySelector(".tafel.spieler").textContent)), "Antippen öffnet Bens Spielerkarte");
  /* Ben geht */
  await ben.close(); await anna.waitForFunction(() => window.EZW.welt3d.mit.figuren.size === 0, null, { timeout: 10000 }).catch(() => {});
  check(await anna.evaluate(() => window.EZW.welt3d.mit.figuren.size === 0 && !document.querySelector(".ez-name3d.fremd")), "Geht Ben, verschwindet er samt Namensschild");
  check(fehlerSeite.length === 0, "Keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? `${fehler} Fehler` : "3D-Welt Mitspieler: alles in Ordnung"); process.exit(fehler ? 1 : 0);
