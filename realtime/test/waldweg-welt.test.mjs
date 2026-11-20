/* Gemeinsame Kampfwelt auf dem Waldweg (Spielserver gegen nachgebildete Supabase): Anna und Ben stehen in derselben Simulation,
   sehen dieselben Gegner, sehen sich mit Name und Stufe; EP werden nach Schadensanteil getrennt gebucht, jeder nur für sich. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
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
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "1000", BUCHUNG_SPAETESTENS_MS: "4000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8799/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8799/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8799/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const br = await chromium.launch(), S = "&server=ws://localhost:8787", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, held) { const ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE(name) }));
  await ctx.addInitScript(([t, h]) => { sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); localStorage.setItem("ez__alles", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true })); }, [token, held]);
  return p; }
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), "schildwaechter"), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), "kopfgeldjaeger");
  const W = B + "?server=ws://localhost:8787&ort=weidenhain&kampf=waldweg";
  await anna.goto(W); await ben.goto(W);
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZ && window.EZ.zustand() && window.EZ.netz.art === "server", null, { timeout: 30000 });
  await anna.waitForFunction(() => window.EZ.zustand().w.filter((e) => e[1]).length === 2, null, { timeout: 10000 }).catch(() => {});
  const blick = (p) => p.evaluate(() => { const z = window.EZ.zustand(); return { ich: z.ich.id, helden: z.w.filter((e) => e[1]).map((e) => e[0]).sort(), monster: z.w.filter((e) => !e[1] && e[3] !== 0).map((e) => e[0]).sort().join(","), namen: [...window.EZ.szene.spielerNamen.values()].map((s) => s.name + " · St. " + s.stufe).sort() }; });
  const a = await blick(anna), b = await blick(ben);
  check(a.helden.length === 2 && JSON.stringify(a.helden) === JSON.stringify(b.helden) && a.ich !== b.ich, `Beide stehen in derselben Welt (Helden ${a.helden.join(",")}, Anna ist ${a.ich}, Ben ist ${b.ich})`);
  check(a.monster && a.monster === b.monster, "Beide sehen dieselben Gegner (" + a.monster + ")");
  check(JSON.stringify(b.namen) === JSON.stringify(["Anna · St. 3", "Ben · St. 2"]), "Name und Stufe der Spieler kommen vom Server: " + b.namen.join(", "));
  await anna.waitForTimeout(400); const schild = await ben.evaluate((id) => { const S = window.EZ.szene; const bb = S.bilder.get(id); return bb && bb.name ? bb.name.text : ""; }, a.ich);
  check(/^Anna · St\. 3/.test(schild), "Über Annas Held steht bei Ben „" + schild + "“");
  /* beide greifen dieselben Gegner an */
  const BOT = () => { window.__bot = setInterval(() => { const E = window.EZ, z = E.zustand(); if (!z) return; const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; let m = null, bd = 1e9; for (const e of z.w) { if (e[1] || e[10] || e[3] === 0) continue; const d = Math.hypot(e[4] - ich[4], e[5] - ich[5]); if (d < bd) { bd = d; m = e; } } if (m) { if (bd > 1.6) E.netz.sende({ t: "lauf", x: m[4], y: m[5] }); else E.netz.sende({ t: "halt" }); E.netz.sende({ t: "ziel", id: m[0] }); } }, 250); };
  await anna.evaluate(BOT); await ben.evaluate(BOT);
  const gebucht = (u) => buchungen.filter((x) => x.p_user.endsWith(u)), summe = (l, h) => l.reduce((n, x) => n + (x.p_ep[h] || 0), 0);
  for (let i = 0; i < 180 && !(summe(gebucht("a001"), "schildwaechter") > 0 && summe(gebucht("b002"), "kopfgeldjaeger") > 0); i++) await anna.waitForTimeout(500);
  const ea = summe(gebucht("a001"), "schildwaechter"), eb = summe(gebucht("b002"), "kopfgeldjaeger");
  check(ea > 0 && eb > 0, `Beide bekommen EP für die gemeinsamen Gegner: Anna ${ea}, Ben ${eb}`);
  check(gebucht("a001").every((x) => Object.keys(x.p_ep).every((h) => h === "schildwaechter")) && gebucht("b002").every((x) => Object.keys(x.p_ep).every((h) => h === "kopfgeldjaeger")), "Jeder bekommt nur EP für seinen eigenen Helden (keine fremden Buchungen)");
  check(buchungen.every((x) => x.p_kampf === "weidenhain/waldweg"), "Gebucht wird als Waldweg");
  await anna.evaluate(() => clearInterval(window.__bot)); await anna.close();
  await ben.waitForFunction(() => window.EZ.zustand().w.filter((e) => e[1]).length === 1, null, { timeout: 8000 }).catch(() => {});
  check(await ben.evaluate(() => window.EZ.zustand().w.filter((e) => e[1]).length) === 1, "Geht Anna, verschwindet ihr Held aus Bens Welt");
  check(fehlerSeite.length === 0, "Keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-3000));
console.log(fehler ? `${fehler} Fehler` : "Alles gut"); process.exit(fehler ? 1 : 0);
