/* Händler am Marktplatz und Tränke im Browser (3D-Welt, echter Spielserver, nachgebildete Supabase): Händler stehen an ihren Ständen, kurz antippen = Gespräch
   mit „Nein danke“ / „Laden ansehen“, Rechtsklick = Menü mit „Laden ansehen“, Ladenfenster als Raster (kurz = untersuchen, lang = Menü mit Kaufen), Trank im Rucksack.
   Gerüst aus inventar-ui.test.mjs. Aufruf: node test/laden-ui.test.mjs  (BILD=… für Bilder) */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "splitter", n: 12 }], v: 2 } } }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
const BILD = process.env.BILD;
try {
  HELD["00000000-0000-0000-0000-00000000a001"].inventar = { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "splitter", n: 300 }, "kleiner_heiltrank"], v: 2 };
  HELD["00000000-0000-0000-0000-00000000a001"].quests = { die_gesperrte_strasse: { s: "fertig" } }; /* Jori läuft nicht dazwischen */
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6448.5, 6444.5, "waldmark"]);
  await anna.goto(B + S); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "null"); return i && i.rucksack && i.rucksack.includes("splitter"); }, null, { timeout: 30000 }).catch(() => {}); await anna.waitForTimeout(2500);
  const H = await anna.evaluate(() => window.EZW.welt3d.haendler && window.EZW.welt3d.haendler.liste.filter((h) => !String(h.id).startsWith("troedler_") && !String(h.id).startsWith("zunft_") && Math.hypot(h.x - 6448, h.y - 6444) < 30)); /* die Trödler (#88) stehen nicht am Marktplatz; nur der Marktplatz der Waldmark (Läden der anderen Städte sind weit weg) */
  check(H && H.length === 3, `Drei Händler am Marktplatz: ${JSON.stringify(H)}`);
  /* Kamera über den Markt */
  await anna.evaluate(() => { const W = window.EZW.welt3d; W.versetzen(6448.5, 6444.5); const M = W.motor; M.gieren = 0; M.neigen = 0.9; M.abstand = 18; }); await anna.waitForTimeout(3000);
  if (BILD) await anna.screenshot({ path: BILD + "markt-sued.png" });
  const hin = async (x, y) => { await anna.evaluate(([x, y]) => { const W = window.EZW.welt3d; W.versetzen(x, y - 3); const M = W.motor; M.gieren = 0; M.neigen = 0.9; M.abstand = 11; }, [x, y]); await anna.waitForTimeout(2500); }; /* drei Felder nördlich des Händlers, Kamera von Süden */
  await hin(6456, 6441);
  if (BILD) await anna.screenshot({ path: BILD + "markt.png" });
  const q = (x, y) => anna.evaluate(([x, y]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + 1, y); }, [x, y]);
  /* kurz antippen: Mira (Tränke) → hingehen, Gespräch mit Antworten */
  { const p = await q(6456, 6441); await anna.mouse.click(p.x, p.y); await anna.waitForFunction(() => { const d = document.getElementById("ez-gespraech"); return d && !d.hidden && /Mira/.test(d.textContent); }, null, { timeout: 40000 }).catch(() => {}); }
  check(await anna.evaluate(() => /Mira Kräuterlieb/.test(document.getElementById("ez-gespraech")?.textContent || "")), "Kurz antippen: hingehen, Mira grüßt");
  await anna.click("#ez-gespraech"); await anna.waitForTimeout(400);
  const aw = await anna.evaluate(() => [...document.querySelectorAll("#ez-gespraech [data-a]")].filter((b) => b.dataset.a !== "__zu").map((b) => b.textContent.trim()));
  check(aw.length === 2 && /Nein danke/.test(aw[0]) && /Laden ansehen/.test(aw[1]), `Antworten: ${JSON.stringify(aw)}`);
  /* #100: im Gespräch dreht sich Mira zum Helden */
  const dreh = () => anna.evaluate(() => { const W = window.EZW.welt3d, H = W.haendler.alle.find((h) => h.l.id === "traenke"); return { ist: H.npc.zielDreh, zumHelden: Math.atan2(W.ort.x - H.l.x, W.ort.y - H.l.y), grund: Math.atan2(H.l.blick[0], H.l.blick[1]), zu: Boolean(H.zugewandt) }; });
  const winkel = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  { const d = await dreh(); check(d.zu && winkel(d.ist, d.zumHelden) < 0.05, `Mira dreht sich zum Helden (${d.ist.toFixed(2)} ≈ ${d.zumHelden.toFixed(2)})`); }
  if (BILD) await anna.screenshot({ path: BILD + "haendler-dialog.png" });
  await anna.click('#ez-gespraech [data-a="laden"]'); await anna.waitForTimeout(600);
  check(await anna.evaluate(() => /Schluck auf!/.test(document.querySelector("#ez-konto .tafel.laden")?.textContent || "") && document.querySelectorAll("#ez-konto .lware").length >= 2), "„Laden ansehen“: Ladenfenster „Schluck auf!“ mit seinen Waren");
  if (BILD) await anna.screenshot({ path: BILD + "laden-traenke.png" });
  await anna.click('#ez-konto .lware[data-g="heiltrank"]'); await anna.waitForTimeout(400);
  check(await anna.evaluate(() => Boolean(document.querySelector("#ez-konto .tafel.untersuchen")) && !JSON.parse(localStorage.getItem("ez_inventar")).rucksack.includes("heiltrank")), "Kurz antippen: untersuchen (kein Kauf)");
  await anna.click('#ez-konto [data-t="zurueck"]'); await anna.waitForTimeout(400);
  await anna.click('#ez-konto .lware[data-g="heiltrank"]', { button: "right" }); await anna.waitForTimeout(300); await anna.click('.ez-aktionen button:has-text("Kaufen")');
  await anna.waitForFunction(() => /^◆ 150 Splitter$/.test((document.querySelector("#ez-konto .lgeld")?.textContent || "").trim()), null, { timeout: 8000 }).catch(() => {});
  check(await anna.evaluate(() => JSON.parse(localStorage.getItem("ez_inventar")).rucksack.includes("heiltrank") && /150/.test(document.querySelector("#ez-konto .lgeld").textContent)), "Lange drücken → Kaufen: Heiltrank gekauft (300 → 150 Splitter), im Rucksack");
  await anna.click('#ez-konto .lware[data-g="kleiner_heiltrank"]', { button: "right" }); await anna.waitForTimeout(300);
  const lm = await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent)); check(/Kaufen/.test(lm[0] || "") && /Untersuchen/.test(lm[1] || ""), `Lange drücken / Rechtsklick auf eine Ware: ${JSON.stringify(lm)}`);
  await anna.click('.ez-aktionen button:has-text("Untersuchen")'); await anna.waitForTimeout(400);
  check(await anna.evaluate(() => /Kleiner Heiltrank/.test(document.querySelector("#ez-konto .tafel.untersuchen")?.textContent || "") && /Heilung/.test(document.querySelector("#ez-konto .tafel.untersuchen").textContent)), "Untersuchen: Werte des Tranks");
  await anna.click('#ez-konto [data-t="zurueck"]'); await anna.waitForTimeout(400); check(await anna.evaluate(() => Boolean(document.querySelector("#ez-konto .tafel.laden"))), "Zurück: wieder im Laden");
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(300);
  { const d = await dreh(); check(!d.zu && winkel(d.ist, d.grund) < 0.05, `Nach dem Gespräch: wieder in der Grundhaltung (${d.ist.toFixed(2)} ≈ ${d.grund.toFixed(2)})`); }
  /* Rechtsklick auf Brann (Waffen): Menü „Sprechen“, „Laden ansehen“ */
  await hin(6439.2, 6439.2);
  if (BILD) await anna.screenshot({ path: BILD + "markt-vorn.png" });
  { const p = await q(6439.2, 6439.2); await anna.mouse.click(p.x, p.y, { button: "right" }); await anna.waitForTimeout(400); }
  const hm = await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent)); check(hm[0] === "💬Sprechen" && hm[1] === "🛒Laden ansehen", `Rechtsklick auf Brann: ${JSON.stringify(hm)}`);
  await anna.click('.ez-aktionen button:has-text("Laden ansehen")'); await anna.waitForFunction(() => /Zur Scharfen Kante/.test(document.querySelector("#ez-konto .tafel.laden")?.textContent || ""), null, { timeout: 40000 }).catch(() => {});
  check(await anna.evaluate(() => document.querySelectorAll("#ez-konto .lware").length === 15), "Hingehen und Waffenladen öffnen: 15 Waffen (bis Selten)");
  if (BILD) await anna.screenshot({ path: BILD + "laden-waffen.png" });
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(300);
  /* Trank im Rucksack: lange drücken = Trinken, Untersuchen; kurz = trinken (bei vollem Leben: Hinweis, der Trank bleibt) */
  await anna.click('#ez-leiste [data-l="rucksack"]'); await anna.waitForTimeout(400);
  await anna.click('#ez-rucksacktab .ifeld.voll[data-g="kleiner_heiltrank"]', { button: "right" }); await anna.waitForTimeout(300);
  const tm = await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent)); check(tm[0] === "🧪Trinken" && tm[1] === "🔍Untersuchen", `Trank im Rucksack lange drücken: ${JSON.stringify(tm)}`);
  if (BILD) await anna.screenshot({ path: BILD + "trank-menue.png" });
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(200);
  await anna.click('#ez-rucksacktab .ifeld.voll[data-g="kleiner_heiltrank"]'); await anna.waitForTimeout(1200);
  check(await anna.evaluate(() => /volles Leben/.test(document.querySelector(".ez-chat")?.textContent || "") && JSON.parse(localStorage.getItem("ez_inventar")).rucksack.includes("kleiner_heiltrank")), "Kurz antippen bei vollem Leben: „Du hast schon volles Leben.“, der Trank bleibt");
  check(fehlerSeite.length === 0, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Läden und Tränke im Spiel: alles in Ordnung"); process.exit(fehler ? 1 : 0);
