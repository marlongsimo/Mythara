/* Bank im Spiel (Browser, echter Spielserver, nachgebildete Supabase; Grundgerüst aus inventar-ui.test.mjs): In der Bank der Waldmark stehen zwei Bankmitarbeiter
   hinter den Schaltern (und einer in Weidenhain). Schalter antippen → Bankfenster; im Rucksack antippen = einzahlen (Menge 1 bzw. „Alle“), in der Bank = abheben (5);
   Bankmitarbeiter antippen → Gespräch wie in OSRS → „Ich möchte auf mein Bankkonto zugreifen“ öffnet die Bank. Aufruf: node test/bank-ui.test.mjs (BILD=pfad/ für Fotos) */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "splitter", n: 12 }], v: 2 }, quests: { die_gesperrte_strasse: { s: "fertig" } } } } /* Quest 1 erledigt: Jori läuft nicht herbei */, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  send(404, {}); }); }).listen(8797);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8785", SUPABASE_URL: "http://localhost:8797", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8797/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8797/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8797/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8785", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);
const bankFenster = (p) => p.waitForSelector("#ez-konto .tafel.bank", { timeout: 90000 }).then(() => true).catch(() => false);
const inBank = (p, g) => p.evaluate((g) => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "{}"); const b = (i.bank || []).find((x) => x[0] === g); return b ? b[1] : 0; }, g);
const imRucksack = (p, g) => p.evaluate((g) => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "{}"); return (i.rucksack || []).reduce((n, x, k) => n + (x === g ? (i.anzahl || [])[k] || 1 : 0), 0); }, g);
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), (process.env.START ? [...process.env.START.split(",").map(Number), "waldmark"] : [6479.4, 6429.6, "waldmark"])); anna.setDefaultTimeout(90000); /* SwiftShader: jede Inventaränderung zeichnet die Gegenstandsbilder neu */
  await anna.goto(B + S + "&vorwaermen=0"); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "null"); return i && i.angelegt && i.angelegt.waffe === "ritterschwert"; }, null, { timeout: 30000 }).catch(() => {}); await anna.waitForTimeout(3000);
  const ort = await anna.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier }));
  check(ort.hier === "waldmark" && Math.hypot(ort.x - (process.env.START ? +process.env.START.split(",")[0] : 6479.4), ort.y - (process.env.START ? +process.env.START.split(",")[1] : 6429.6)) < 2, `Anna steht in der Bank der Waldmark (${ort.x.toFixed(1)}, ${ort.y.toFixed(1)})`);
  const liste = await anna.evaluate(() => window.EZW.welt3d.bank.liste);
  check(liste.length === 3 && liste.filter((b) => b.y < 6500).length === 2, `Drei Bankmitarbeiter: ${liste.map((b) => b.name).join(", ")}`);
  await anna.waitForFunction(() => { let n = 0; window.EZW.welt3d.bank.alle.forEach((f) => { if (f.npc.geladen || f.npc.gruppe.children.length > 1) n++; }); return n >= 2; }, null, { timeout: 60000 }).catch(() => {});
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "bank-schalter.png" });
  /* Schalter antippen → gleich die Bank */
  { const q = await schirm(anna, 6476.6, 6429.1, 0.9);
    if (process.env.DEBUG) console.log("DEBUG", JSON.stringify(await anna.evaluate(([x, y]) => { const W = window.EZW.welt3d, a = W.anStelle(6476.6, 6429.1), b = W.stelleAmSchirm(x, y); return { boden: a && a.text, schirm: b && b.text, ort: [W.ort.x, W.ort.y] }; }, [q.x, q.y])));
    await anna.mouse.click(q.x, q.y); await anna.waitForTimeout(2500);
    if (process.env.DEBUG) console.log("DEBUG2", await anna.evaluate(() => [document.getElementById("ez-dorf-hilfe")?.textContent, (document.getElementById("ez-gespraech") || {}).textContent, [...document.querySelectorAll(".ez-chat .zeile, #ez-chat li")].slice(-3).map((e) => e.textContent).join(" | "), window.EZW.welt3d.ort.x + "," + window.EZW.welt3d.ort.y].join(" ## "))); }
  check(await bankFenster(anna), "Linken Schalter angetippt: das Bankfenster öffnet sich");
  check(await anna.evaluate(() => /Deine Bank ist leer/.test(document.querySelector(".tafel.bank .braster").textContent)), "Die Bank ist noch leer");
  await anna.click('.tafel.bank .brucksack .bfach[data-g="splitter"]'); await anna.waitForFunction(() => /"splitter",1\]/.test(localStorage.getItem("ez_inventar") || ""), null, { timeout: 5000 }).catch(() => {});
  check(await inBank(anna, "splitter") === 1 && await imRucksack(anna, "splitter") === 11, "Menge 1: ein Splitter eingezahlt (Rucksack 11)");
  await anna.click('.tafel.bank .bmenge[data-m="alle"]'); await anna.click('.tafel.bank .brucksack .bfach[data-g="splitter"]'); await anna.waitForTimeout(800);
  check(await inBank(anna, "splitter") === 12 && await imRucksack(anna, "splitter") === 0, "Menge „Alle“: alle Splitter in der Bank (12)");
  check(await anna.evaluate(() => (document.querySelector('.tafel.bank .braster .bfach[data-g="splitter"] b') || {}).textContent === "12"), "Im Bankraster steht die Menge (12, gelb wie in OSRS)");
  await anna.click('.tafel.bank .bmenge[data-m="5"]'); await anna.click('.tafel.bank .braster .bfach[data-g="splitter"]'); await anna.waitForTimeout(800);
  check(await inBank(anna, "splitter") === 7 && await imRucksack(anna, "splitter") === 5, "Menge 5 in der Bank angetippt: 5 abgehoben (Bank 7)");
  await anna.click('.tafel.bank .balles[data-was="ausruestung"]'); await anna.waitForFunction(() => /rundschild/.test(JSON.stringify(JSON.parse(localStorage.getItem("ez_inventar") || "{}").bank || [])), null, { timeout: 30000 }).catch(() => {});
  check(await inBank(anna, "ritterschwert") === 1 && await inBank(anna, "rundschild") === 1, "„Ausrüstung einzahlen“: Schwert und Schild in der Bank");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "bank-fenster.png" });
  await anna.click('.tafel.bank .bmenge[data-m="1"]');
  await anna.click('.tafel.bank .braster .bfach[data-g="ritterschwert"]', { button: "right" }); await anna.waitForTimeout(300);
  check(await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent).some((t) => /Abheben: Alle/.test(t))), "Lange drücken / Rechtsklick: Menü mit „Abheben: 1 / 5 / 10 / X / Alle“ und „Untersuchen“");
  await anna.click('.ez-aktionen button:has-text("Abheben: 1")'); await anna.waitForTimeout(700);
  check(await imRucksack(anna, "ritterschwert") === 1, "Über das Menü abgehoben: Schwert wieder im Rucksack");
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(300); if (await anna.$("#ez-konto .tafel.bank")) { await anna.keyboard.press("Escape"); await anna.waitForTimeout(300); }
  check(!(await anna.$("#ez-konto .tafel.bank")), "Bankfenster mit Escape geschlossen");
  /* Bankmitarbeiter antippen → Gespräch wie in OSRS */
  { const q = await schirm(anna, 6479.4, 6427.3, 1.3); await anna.mouse.click(q.x, q.y); }
  await anna.waitForFunction(() => { const t = (document.getElementById("ez-gespraech") || {}).textContent || ""; window.__gesehen = (window.__gesehen || "") + " ¦ " + t; return /Wie kann ich dir helfen|Bankkonto zugreifen/.test(t); }, null, { timeout: 45000, polling: 100 }).catch(() => {});
  if (process.env.DEBUG) console.log("DEBUG3", (await anna.evaluate(() => (window.__gesehen || "").slice(-600))));
  const gespr = await anna.evaluate(() => (document.getElementById("ez-gespraech") || {}).textContent || "");
  check(/Edwin Pfennig/.test(gespr) && /Wie kann ich dir helfen/.test(gespr) || /Bankkonto zugreifen/.test(gespr), "Edwin (rechter Schalter) angetippt: Gespräch beginnt („Guten Tag. Wie kann ich dir helfen?“)");
  for (let i = 0; i < 4 && !(await anna.$('#ez-gespraech button:has-text("Bankkonto")')); i++) { await anna.click("#ez-gespraech"); await anna.waitForTimeout(400); }
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "bank-gespraech.png" });
  await anna.click('#ez-gespraech :text("Bankkonto zugreifen")').catch(() => {});
  check(await bankFenster(anna), "„Ich möchte auf mein Bankkonto zugreifen.“ öffnet die Bank");
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Bank im Spiel: alles in Ordnung"); process.exit(fehler ? 1 : 0);
