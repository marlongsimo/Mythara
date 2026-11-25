/* Kampf in der offenen Welt, Ende zu Ende (echter Spielserver, nachgebildete Supabase, Browser; die Spieldateien liefert Playwright aus – kein Testserver nötig):
   Anna und Ben stehen im Kreuzwald, sehen sich und die Banditen ohne eigene Kampfszene, Anna besiegt Banditen (EP gebucht), durchs Tor zurück in die Waldmark, Teleport, Gast rechnet im Browser. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8799/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8799/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8799/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?server=ws://localhost:8787", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); sessionStorage.setItem("ez__hilfe", "1"); sessionStorage.setItem("ez__lager", "1") /* wie nach „Ins Spiel“ auf der Willkommensseite (seit 24.11.) */; if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z, null, { timeout: 40000 });
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6536, 6583, "waldweg"]), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6533, 6588, "waldweg"]);
  await anna.goto(B + S); await ben.goto(B + S); await bereit(anna); await bereit(ben);
  await anna.evaluate(() => { window.__zahlen = 0; setInterval(() => { const sz = window.EZW && window.EZW.szene; if (sz && sz.children && sz.children.list.some((o) => o.type === "Text" && /^\d+$/.test(o.text))) window.__zahlen++; }, 50); }); /* Schadenszahlen von Anfang an alle 50 ms suchen (Banditen greifen schon beim Laufen an; die Zahlen verschwinden nach 0,9 s) */
  check(await anna.evaluate(() => document.body.classList.contains("weltkampf") && window.EZK.art === "server" && window.EZW.szene.scene.key !== "spiel"), "Im Kreuzwald kämpft man in der offenen Welt selbst (keine Kampfszene), gerechnet vom Server");
  check(await anna.evaluate(() => getComputedStyle(document.querySelector("#ez-tasten")).display !== "none" && getComputedStyle(document.querySelector("#ez-ich")).display !== "none"), "Aktionen 1–4 und Leben/Erfahrung sind eingeblendet");
  await anna.waitForTimeout(1500);
  const sicht = await anna.evaluate(() => { const K = window.EZK; return { banditen: K.z.w.filter((e) => e[3] !== 0 && !e[10]).length, schilder: [...K.figuren.values()].map((f) => f.nm.text).sort() }; });
  check(sicht.banditen === 4 && sicht.schilder.filter((t) => t === "Bandit · Lv 1").length === 4, "Anna sieht vier Banditen mit „Bandit · Lv 1“");
  check(sicht.schilder.includes("Ben · Lv 2"), "…und Ben mit Name und Stufe aus derselben Simulation: " + sicht.schilder.filter((t) => !/Bandit/.test(t)).join(", "));
  check(await anna.evaluate(() => { const K = window.EZK, i = K.z.w.find((e) => e[0] === K.ichId); return Math.hypot(K.zone.x0 + i[4] - 6536, K.zone.y0 + i[5] - 6583) < 1.6; }), "Anna steht im Kampf dort, wo sie in der Welt stand");
  { const ka = await anna.evaluate(() => document.querySelector("#ez-kampfart b").textContent); check(ka === "Einzelkampf", "Unter der Minimap: „Einzelkampf“ auf der Lichtung (seit 22.11. ist die Banditen-Lichtung Einzelkampf; " + ka + ")"); }
  check(await anna.evaluate(() => document.querySelectorAll("#ez-karte u.feind:not(.tot)").length) === 4, "Die Minimap zeigt die vier Banditen live als rote Punkte");
  const tf0 = await anna.evaluate(() => document.querySelector("#ez-karte").style.transform);
  /* laufen: Taste D – der Server bewegt, die Welt folgt */
  const x0 = await anna.evaluate(() => window.EZW.szene.ort.x); await anna.keyboard.down("d"); await anna.waitForTimeout(1000); await anna.keyboard.up("d"); await anna.waitForTimeout(400);
  const x1 = await anna.evaluate(() => window.EZW.szene.ort.x); check(x1 - x0 > 1, `Laufen mit der Tastatur: der Server bewegt Anna (${(x1 - x0).toFixed(1)} Felder)`);
  const tf1 = await anna.evaluate(() => document.querySelector("#ez-karte").style.transform), dx = (t) => Number((t.match(/translate\((-?[\d.]+)px/) || [])[1]);
  check(dx(tf0) - dx(tf1) >= 6, `Die Minimap scrollt beim Laufen sichtbar mit (${tf0} → ${tf1})`);
  /* kämpfen: immer wieder 1 (Angriff auf den nächsten Banditen) */
  const gebucht = () => buchungen.filter((x) => x.p_user.endsWith("a001")).reduce((n, x) => n + (x.p_ep.schildwaechter || 0), 0); let zahlen = 0;
  anna.on("console", () => {}); for (let i = 0; i < 160 && gebucht() === 0; i++) { await anna.keyboard.press("1"); await anna.waitForTimeout(400); if (!zahlen) { zahlen = await anna.evaluate(() => window.EZW.szene.children.list.filter((o) => o.type === "Text" && /^\d+$/.test(o.text)).length); if (zahlen && process.env.BILD) await anna.screenshot({ path: process.env.BILD }); } }
  { const n = await anna.evaluate(() => window.__zahlen || 0); check(zahlen > 0 || n > 0, `Treffer zeigen Schadenszahlen in der Welt (${n} gezählt)`); }
  check(gebucht() > 0, `Anna besiegt Banditen: ${gebucht()} EP gebucht (Kreuzwald, ${buchungen.filter((x) => x.p_user.endsWith("a001")).map((x) => x.p_kampf).filter((v, i, a) => a.indexOf(v) === i).join(", ")})`);
  check(buchungen.every((x) => x.p_kampf === "kreuzwald/kreuzwald"), "Gebucht wird als Kreuzwald");
  /* Teleport aus dem Kampfgebiet */
  await Promise.all([anna.waitForURL(/von=teleport/, { timeout: 15000 }), anna.click('#ez-kartenrahmen [aria-label="Teleport"]')]);
  await anna.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.hier === "waldmark", null, { timeout: 30000 }); await anna.waitForTimeout(800);
  await anna.waitForTimeout(2500); /* der Server schickt inzwischen die im Kreuzwald gemerkte Stelle – sie darf nach dem Teleport nicht gelten */
  check(await anna.evaluate(() => window.EZW.szene.hier === "waldmark"), "Teleport bleibt: auch nachdem der Server die alte Stelle im Kreuzwald gemeldet hat (" + JSON.stringify(STELLE["00000000-0000-0000-0000-00000000a001"]) + ")");
  check(await anna.evaluate(() => !window.EZK && !document.body.classList.contains("weltkampf")), "Teleport: zurück in der Waldmark, dort wird nicht gekämpft");
  check(await anna.evaluate(() => document.querySelector("#ez-kampfart b").textContent === "Einzelkampf" && !document.querySelector("#ez-kampfart em")), "In der Waldmark: „Einzelkampf“ (Solo, seit 25.11. kein „Sicherer Ort“ mehr), keine Gegneranzahl");
  /* Die fünf Helden sind nicht mehr wählbar: H öffnet in der Waldmark den Heldeneditor (Aussehen und Startwaffe) */
  await Promise.all([anna.waitForURL(/held\.html/, { timeout: 15000 }).catch(() => {}), anna.keyboard.press("h")]);
  check(/held\.html/.test(anna.url()), "H in der Waldmark: Heldeneditor statt Heldenwechsel (" + anna.url() + " · " + (await anna.evaluate(() => [...document.querySelectorAll(".tafel h2, .tafel h1, dialog h2")].map((e) => e.textContent).join("|")).catch(() => "?")) + ")");
  /* Ben läuft durchs Südtor zurück in die Waldmark */
  await ben.goto(B + S + "&wx=6448&wy=6467.5"); await bereit(ben); /* Startstelle über die Adresse – ein Wert im Speicher könnte von der laufenden Seite überschrieben werden */
  check(await ben.evaluate(() => document.querySelector("#ez-kampfart b").textContent) === "Einzelkampf", "Am Südtor im Kreuzwald: „Einzelkampf“");
  await ben.keyboard.press("h"); await ben.waitForTimeout(600);
  check(await ben.evaluate(() => document.querySelector("#ez-wahl").hidden && /nur in der Waldmark/.test(document.querySelector("#ez-dorf-hilfe").textContent)), "Im Kreuzwald lässt sich der Held nicht wechseln („nur in der Waldmark“)");
  await ben.keyboard.down("w"); await ben.waitForFunction(() => window.EZW.szene.hier === "waldmark", null, { timeout: 8000 }).catch(() => {}); await ben.waitForTimeout(400); await ben.keyboard.up("w");
  check(await ben.evaluate(() => window.EZW.szene.hier === "waldmark" && !(window.EZK && window.EZK.eingetreten) && !document.body.classList.contains("weltkampf")), "Durchs Südtor nach Norden: Ben verlässt das Kampfgebiet nahtlos und ist in der Waldmark (" + await ben.evaluate(() => window.EZW.szene.ort.y.toFixed(1)) + ")");
  /* Gast: der Browser rechnet selbst */
  const gast = await spieler("Gast", "", [6530, 6587, "waldweg"]); await gast.goto(B + S); await bereit(gast);
  check(await gast.evaluate(() => window.EZK.art === "lokal" && window.EZK.z.w.filter((e) => e[3] !== 0).length === 4), "Ein Gast ohne Konto kämpft auch – der Browser rechnet (ohne Gutschrift)");
  /* Torvald mit erhobenem Schild: Block im Stehen, Gang mit Schild (Figur aus der Fabrik) */
  await gast.goto(B + S + "&wx=6448&wy=6470"); await bereit(gast); await gast.waitForTimeout(800); /* abseits der Banditen: im Kampf kann ein Angriff den Waffenwechsel kurz sperren */
  const haltung = () => gast.evaluate(() => window.EZW.szene.figur.zustand), warteAuf = (z) => gast.waitForFunction((zz) => window.EZW.szene.figur.zustand === zz, z, { timeout: 3000 }).catch(() => {});
  await gast.keyboard.press(" "); await warteAuf("block"); const h1 = await haltung();
  await gast.keyboard.down("s"); await warteAuf("schild_laufen"); const h2 = await haltung(); await gast.keyboard.up("s"); await warteAuf("block"); await gast.waitForTimeout(500);
  await gast.keyboard.press(" "); await warteAuf("ruhe"); const h3 = await haltung();
  check(h1 === "block" && h2 === "schild_laufen" && h3 === "ruhe", `Schild (Leertaste): Torvald blockt (${h1}), geht mit Schild (${h2}), danach wieder normal (${h3})`);
  check(fehlerSeite.length === 0, "Keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? `${fehler} Fehler` : "Kampf in der offenen Welt: alles in Ordnung"); process.exit(fehler ? 1 : 0);
