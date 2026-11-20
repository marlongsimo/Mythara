/* Kampagnenkampf über den Spielserver, gegen eine nachgebildete Supabase (die echte wird nie angesprochen):
   echter Spielserver (server/dist/server.js) + Browser mit nachgebildeter Anmeldung. Prüft Anmeldung, Stufen vom Server, Gutschrift von EP und Seelensplittern. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const TOKEN = "tok_anna_" + "x".repeat(30), WERTE = { ep: { schildwaechter: 300 }, seelen: 7 }, buchungen = [], SIEGE = [];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/siege") { res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" }); res.end(JSON.stringify(SIEGE)); return; }
  if (req.url === "/werte") { res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" }); res.end(JSON.stringify(WERTE)); return; } /* für den nachgebildeten Browser-Zugang: so liest das Spiel nach dem Kampf, was in der Datenbank steht */
  if (req.headers.apikey !== "sb_secret_test" || (req.url !== "/auth/v1/user" && req.headers.authorization !== "Bearer sb_secret_test")) return send(401, { message: "permission denied (anon)" }); /* wie Supabase: ohne den Schlüssel auch im Authorization-Kopf gilt die Anfrage als „anon“ */
  if (req.url === "/auth/v1/user") return req.headers.authorization === "Bearer " + TOKEN ? send(200, { id: "00000000-0000-0000-0000-00000000a001", is_anonymous: false }) : send(401, { msg: "ungültig" });
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: WERTE.ep }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, SIEGE);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_sieg") { const a = JSON.parse(b); if (!SIEGE.some((q) => q.ort === a.p_ort && q.kampf === a.p_kampf)) SIEGE.push({ ort: a.p_ort, kampf: a.p_kampf }); return send(200, { ok: true }); }
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_gutschrift") { const a = JSON.parse(b); buchungen.push(a); for (const [h, n] of Object.entries(a.p_ep)) WERTE.ep[h] = (WERTE.ep[h] || 0) + n; WERTE.seelen += a.p_seelen; return send(200, { ep: WERTE.ep, seelen: WERTE.seelen }); }
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn) { if (fn === "rpg_my_profile") return { data: { handle: "Anna", konto: true }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: await (await fetch("http://localhost:8799/siege")).json(), error: null }; if (fn === "rpg_echtzeit_werte") return { data: await (await fetch("http://localhost:8799/werte")).json(), error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const br = await chromium.launch(), ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(), f = []; p.on("pageerror", (e) => f.push(String(e)));
await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE }));
const B = "http://localhost:8765/echtzeit/", KAMPF = B + "?server=ws://localhost:8787&ort=weidenhain&kampf=speicher";
await p.goto(B + "?server="); await p.evaluate((t) => { sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: "schildwaechter", mit: ["lichtbringer"] })); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true, hanne: true, lene: true, agnes: true })); }, TOKEN);
await p.goto(KAMPF.replace("speicher", "muehle")); await p.waitForFunction(() => window.EZ && window.EZ.netz, null, { timeout: 30000 });
check(await p.evaluate(() => window.EZ.netz.art) === "lokal" && /noch nicht freigeschaltet/.test(await p.textContent("#ez-art")), "Der zweite Kampf ist gesperrt, solange der erste nicht gewonnen ist (der Server lehnt ab)");
await p.goto(KAMPF); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 20000 }); await p.waitForTimeout(600);
check(await p.evaluate(() => window.EZ.netz.art) === "server", "Mit Konto rechnet der Spielserver den Kampagnenkampf");
check(await p.evaluate(() => { const z = window.EZ.zustand(); return z.w.find((e) => e[0] === z.ich.id)[8]; }) === 352, "Der Server nimmt die Stufe aus dem Konto (Torvald mit 300 EP = Stufe 3: 352 LP)");
await p.evaluate(() => { window.__bot = setInterval(() => { const E = window.EZ, z = E.zustand(); if (!z) return; const ich = z.w.find((e) => e[0] === z.ich.id); let m = null, bd = 1e9; for (const e of z.w) { if (e[1] || e[10] || e[3] === 0) continue; const d = Math.hypot(e[4] - ich[4], e[5] - ich[5]); if (d < bd) { bd = d; m = e; } } if (m) { if (bd > 1.6) E.netz.sende({ t: "lauf", x: m[4], y: m[5] }); else E.netz.sende({ t: "halt" }); E.netz.sende({ t: "ziel", id: m[0] }); } else if (z.b && z.b.length) E.netz.sende({ t: "lauf", x: z.b[0][1], y: z.b[0][2] }); }, 250); });
await p.waitForFunction(() => { const z = window.EZ.zustand(); return z.phase === "sieg" && !(z.b || []).length; }, null, { timeout: 240000 }); const gesammelt = await p.evaluate(() => window.EZ.zustand().splitter);
check(buchungen.length === 0, "Vor dem Verlassen wird nichts gutgeschrieben");
await p.waitForTimeout(500); check(SIEGE.length === 1 && SIEGE[0].kampf === "speicher", "Sobald alle Gegner besiegt sind, trägt der Server den Sieg ein");
await Promise.all([p.waitForURL((u) => !/kampf=/.test(u), { timeout: 20000 }), p.click("#ez-dorf-knopf")]); await p.waitForTimeout(500);
const bu = buchungen[0] || {}; check(buchungen.length === 1 && bu.p_ep.schildwaechter === 52 && bu.p_ep.lichtbringer === 52 && bu.p_seelen === gesammelt && bu.p_kampf === "weidenhain/speicher", `Beim Verlassen schreibt der Server gut: je Held ${bu.p_ep && bu.p_ep.schildwaechter} EP, ${bu.p_seelen} Seelensplitter (im Kampf gesammelt: ${gesammelt})`);
check(await p.evaluate(() => localStorage.getItem("ez_ep")) === JSON.stringify(WERTE.ep) && await p.evaluate(() => localStorage.getItem("ez_seelen")) === String(WERTE.seelen), "Zurück im Dorf zeigt das Spiel die Werte aus der Datenbank (" + JSON.stringify(WERTE) + ")");
check(await p.evaluate(() => localStorage.getItem("ez_kampagnen")) === "0", "Weltkarte: Freischaltung kommt aus dem Konto (Weidenhain noch nicht geschafft)");
await p.goto(KAMPF.replace("speicher", "muehle")); await p.waitForFunction(() => window.EZ && window.EZ.netz, null, { timeout: 30000 }); check(await p.evaluate(() => window.EZ.netz.art) === "server", "Nach dem Sieg im Speicher ist der Mühlgraben freigeschaltet");
/* Betrugsversuch: Der Browser schickt selbst erfundene Werte – der Server kennt keine solche Nachricht */
await p.goto(KAMPF); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 20000 }); await p.evaluate(() => { window.EZ.netz.sende({ t: "gutschrift", ep: { schildwaechter: 5000 }, seelen: 5000 }); window.EZ.netz.sende({ t: "verlassen" }); }); await p.waitForTimeout(1200);
check(buchungen.length === 1, "Erfundene Werte aus dem Browser werden nicht gutgeschrieben (ein Kampf ohne Sieg gibt nichts)");
/* falsches Token */
await p.evaluate(() => sessionStorage.setItem("fake_token", "falsch_" + "y".repeat(30))); await p.goto(KAMPF); await p.waitForFunction(() => window.EZ && window.EZ.netz, null, { timeout: 30000 });
check(await p.evaluate(() => window.EZ.netz.art) === "lokal" && /nicht gutgeschrieben/.test(await p.textContent("#ez-art")), "Ungültige Anmeldung: der Server lehnt ab, es wird nichts gutgeschrieben (Hinweis im Kampf)");
check(f.length === 0, "Keine Fehler im Browser" + (f.length ? ": " + f.join(" | ") : ""));
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-1500)); console.log(fehler ? `\n${fehler} Prüfungen fehlgeschlagen` : "\nServerkampf und Gutschrift: alles in Ordnung"); process.exit(fehler ? 1 : 0);
