/* App-Hintergrund (26.11.2026): iOS trennt die Verbindung, die Seite kommt zurück – der Held muss sich ohne Neuladen wieder bewegen. Gerüst aus zwei-geraete-ui.test.mjs. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "holzbeil_training", n: 1 }], v: 2 }, quests: { die_gesperrte_strasse: { s: "fertig" } } } } /* Quest 1 erledigt: Jori läuft nicht herbei */, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, STELLE[wer(req.url)] ? [STELLE[wer(req.url)]] : []); /* gemerkte Stelle (Migration 039) */
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_position_setzen") { const a = JSON.parse(b); STELLE[a.p_user] = { region: a.p_region, x: a.p_x, y: a.p_y }; return send(200, { ok: true }); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, PROFIL[wer(req.url)] ? [{ handle: PROFIL[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, AKTIV[wer(req.url)] ? [{ held: AKTIV[wer(req.url)] }] : []);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_held_setzen") { const a = JSON.parse(b); AKTIV[a.p_user] = a.p_held; HELDSETZEN.push(a); return send(200, { ok: true, held: a.p_held }); }
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); if (HELD[a.p_user]) HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_skill_gutschrift") { const a = JSON.parse(b); XPBUCH.push(a); const H = HELD[a.p_user]; if (!H) return send(200, null); for (const k of ["geschick", "staerke", "fernkampf", "magie"]) H["skill_" + k] += a["p_" + k]; return send(200, { geschick: H.skill_geschick, staerke: H.skill_staerke, fernkampf: H.skill_fernkampf, magie: H.skill_magie }); }
  send(404, {}); }); }).listen(8798);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8786", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000", HOLZ_FALL: "0", HOLZ_KERN: "0" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_feedback_send") { window.__meldung = a; return { data: { ok: true }, error: null }; } if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8798/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8798/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8798/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8786", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_quest_verfolgt", "nordwald_waldsaebel"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);
try {
  const T = "tok_anna_" + "x".repeat(30);
  const p = await spieler("Anna", T, [6440, 6440, "waldmark"]); p.setDefaultTimeout(90000); const ctx = p.context(); const T0 = Date.now();
  /* Ein still geschlossener Socket (iOS): bleibt OPEN, aber nichts kommt mehr an und nichts geht mehr hinaus – window.__stumm() schaltet alle offenen so */
  await p.addInitScript(() => { const W = window.WebSocket, t0 = performance.now(); window.__wsl = []; window.__alle = []; const L = (x) => window.__wsl.push(((performance.now() - t0) / 1000).toFixed(1) + " " + x);
    window.WebSocket = class extends W { constructor(u, q) { super(u, q); const k = /welt=1/.test(u) ? "welt" : "kampf"; this.__k = k; L(k + " neu"); window.__alle.push(this); this.addEventListener("open", () => L(k + " offen")); this.addEventListener("close", (e) => L(k + " zu " + e.code));
        super.onmessage = (e) => { if (!this.__stumm && this.__om) this.__om(e); }; }
      set onmessage(f) { this.__om = f; } get onmessage() { return this.__om; }
      send(d) { if (!this.__stumm) super.send(d); } };
    window.__stumm = () => { for (const w of window.__alle) if (w.readyState === 1) { w.__stumm = true; L(w.__k + " stumm"); } }; });
  p.on("console", (m) => { if (/Welt:|Kampfwelt|WebSocket|verbind/i.test(m.text())) console.log("  [" + ((Date.now() - T0) / 1000).toFixed(1) + "s] " + m.text().slice(0, 160)); });
  await p.goto(B + S + "&vorwaermen=0"); await bereit(p); await p.waitForTimeout(1500); const url0 = p.url();
  /* läuft der Held? Taste D eine gute Sekunde halten (die Kampfwelt bewegt ihn – ohne Server bleibt er stehen) */
  let richtung = 1;
  const laeuft = async () => { const o = await p.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y })); richtung = -richtung;
    const q = await schirm(p, o.x + 3 * richtung, o.y + 1, 0); await p.mouse.click(q.x, q.y); await p.waitForTimeout(1300);
    const n = await p.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y })); return Math.hypot(n.x - o.x, n.y - o.y) > 0.8; };
  const sicht = (an) => p.evaluate((an) => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (an ? "visible" : "hidden") }); Object.defineProperty(document, "hidden", { configurable: true, get: () => !an }); document.dispatchEvent(new Event("visibilitychange")); }, an);
  /* bis die Kampfwelt wieder verbunden ist und neue Zustände liefert: Sekunden nach der Rückkehr */
  const verbunden = async (alt, max) => { const t0 = Date.now(); const ok = await p.waitForFunction((alt) => window.EZK && window.EZK.netz && window.EZK.netz !== window.__altNetz && window.EZK.z && window.EZK.z !== window.__altZ, alt, { timeout: max * 1000, polling: 100 }).then(() => true).catch(() => false); return ok ? (Date.now() - t0) / 1000 : null; };
  const merken = () => p.evaluate(() => { window.__altNetz = window.EZK && window.EZK.netz; window.__altZ = window.EZK && window.EZK.z; });
  /* bis der Held wieder läuft: Sekunden nach der Rückkehr */
  const wieder0 = 0; const wieder = async (max) => { const t0 = Date.now(); while (Date.now() - t0 < max * 1000) { if (await laeuft()) return (Date.now() - t0) / 1000; } return null; };
  { const t0 = await wieder(40); console.log("  [" + ((Date.now() - T0) / 1000).toFixed(1) + "s] erster Lauf nach " + t0 + " s"); check(t0 !== null, "Vorher: der Held läuft (Kampfwelt über den Server)"); }
  console.log("  [" + ((Date.now() - T0) / 1000).toFixed(1) + "s] Hintergrund");

  /* 1. App in den Hintergrund, die Verbindung stirbt still (iOS), nach 6 s zurück */
  await merken(); await sicht(false); await p.evaluate(() => window.__stumm()); await p.waitForTimeout(6000); await sicht(true);
  const v1 = await verbunden(null, 30); check(v1 !== null, `Nach 6 s Hintergrund (Verbindung still tot): die Kampfwelt ist neu verbunden und läuft (nach ${v1} s)`);
  const t1 = await wieder(30); console.log("  WS:", (await p.evaluate(() => window.__wsl.splice(0))).join(" | ")); check(t1 !== null, `Nach 6 s Hintergrund (Verbindung still tot): …und der Held läuft wieder (nach weiteren ${t1} s)`);

  /* 2. Stiller Abbruch: Netz weg, Seite bleibt sichtbar – der Wachhund merkt es */
  await merken(); await p.evaluate(() => window.__stumm()); await p.waitForTimeout(6000);
  const v2 = await verbunden(null, 40); check(v2 !== null, `Stiller Abbruch bei sichtbarer Seite: der Wachhund verbindet neu (6 s + ${v2} s)`);
  const t2 = await wieder(30); console.log("  WS:", (await p.evaluate(() => window.__wsl.splice(0))).join(" | ")); check(t2 !== null, `Stiller Abbruch bei sichtbarer Seite: …und der Held läuft wieder (nach weiteren ${t2} s)`);

  /* 3. Im Kampf: Banditen auf der Lichtung im Kreuzwald, angreifen, Abbruch, zurück – genau ein Held, der Kampf geht weiter */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6536, 6583)); await p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  for (let i = 0; i < 6; i++) { await p.keyboard.press("1"); await p.waitForTimeout(300); }
  await sicht(false); await p.evaluate(() => window.__stumm()); await p.waitForTimeout(3000); await sicht(true); /* kurz: vier Banditen schlagen weiter auf den stehenden Helden ein */
  await p.waitForFunction(() => window.EZK && window.EZK.netz && window.EZK.z, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(2500);
  const nachher = await p.evaluate(() => { const K = window.EZK; return { namen: [...K.namen.values()].map((n) => n.name), annas: [...K.namen.values()].filter((n) => n.name === "Anna").length, helden: K.z.w.filter((e) => e[1] === 1).length, netz: Boolean(K.netz) }; });
  check(nachher.netz && nachher.annas === 1 && nachher.helden === 1, `Nach dem Abbruch im Kampf: verbunden, genau ein Held (${JSON.stringify(nachher)})`);
  const z0 = await p.evaluate(() => JSON.stringify(window.EZK.z.w.map((e) => [e[0], e[4], e[5], e[7]]))); await p.waitForTimeout(1500);
  check(await p.evaluate((z0) => JSON.stringify(window.EZK.z.w.map((e) => [e[0], e[4], e[5], e[7]])) !== z0, z0), "Die Kampfwelt läuft weiter (neue Zustände)");
  check(p.url() === url0, "Kein Neuladen der Seite");
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Hintergrund: alles in Ordnung"); process.exit(fehler ? 1 : 0);
