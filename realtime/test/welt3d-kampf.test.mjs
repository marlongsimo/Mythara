/* Kampf in der 3D-Welt (Stufe 3, ?welt3d=1) – derselbe Ablauf wie kampf-v1-welt.test.mjs, nur in 3D: Gegner als Aufsteller, Namen, Zahlen und Balken als HTML. Grundlage: – eigener Held mit Skill-XP (Migration 041 nachgebildet). Grundgerüst wie welt-kampf.test.mjs: (echter Spielserver, nachgebildete Supabase, Browser; die Spieldateien liefert Playwright aus – kein Testserver nötig):
   Anna und Ben stehen im Kreuzwald, sehen sich und die Banditen ohne eigene Kampfszene, Anna besiegt Banditen (EP gebucht), durchs Tor zurück in die Waldmark, Teleport, Gast rechnet im Browser. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, skill_lp: 86133 /* LP-Level 50 = 50 LP: übersteht die Fäuste-Probe sicher, Heldenlevel ⌊0,25 × (1 + 50) + 0,325 × 2⌋ = 13 */, skill_defense: 0 } }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8799/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8799/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8799/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8787", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6536, 6583, "waldweg"]);
  await anna.addInitScript(() => { if (!sessionStorage.getItem("stil_gesetzt")) { sessionStorage.setItem("stil_gesetzt", "1"); localStorage.setItem("ez_stil", JSON.stringify({ nah: 0 })); } }); /* Stil „Akkurat“ schon vor dem Betreten gewählt */
  await anna.goto(B + S); await bereit(anna); await anna.waitForTimeout(1500);
  check(await anna.evaluate(() => window.EZK.art === "server" && window.EZK.v1 && document.body.classList.contains("kampf-v1")), "Eigener Held im Kreuzwald: Kampfregeln v2, gerechnet vom Server");
  const hud = await anna.evaluate(() => ({ stufe: document.querySelector("#ez-ich-stufe").textContent, lp: document.querySelector("#ez-lpzahl").textContent, name: document.querySelector("#ez-name").textContent,
    skills: [...document.querySelectorAll("#ez-skills .skill")].map((s) => s.querySelector("b").textContent + " " + s.querySelector(".lv").textContent), xp: getComputedStyle(document.querySelector("#ez-xpleiste")).display,
    tasten: ["a", "q", "e", "r"].map((t) => getComputedStyle(document.querySelector(`[data-taste="${t}"]`)).display !== "none"), modus: getComputedStyle(document.querySelector("#ez-modus")).display !== "none", an: document.querySelector('[data-taste="a"] small').textContent }));
  check(hud.stufe === "Lv 13" && hud.lp === "50 / 50" && hud.name === "Trainingsschwert", `Heldenkasten: ${hud.stufe}, ${hud.lp} LP, ${hud.name}`);
  check(hud.skills.join(", ") === "Geschick 1, Stärke 1, Fernkampf 1, Magie 1, Lebenspunkte 50, Defense 1" && hud.xp === "none", `Sechs Skill-Balken statt EP: ${hud.skills.join(", ")}`);
  check(JSON.stringify(hud.tasten) === "[false,false,false,false]" && !hud.modus, "Keine Aktionstasten unten rechts (kein „Angreifen“, keine Fähigkeiten, kein Waffenwechsel)");
  await anna.evaluate(() => { window.__drops = []; new MutationObserver((m) => { for (const r of m) for (const n of r.addedNodes) if (n.classList && n.classList.contains("xpdrop")) window.__drops.push({ text: n.textContent, bilder: n.querySelectorAll("img").length }); }).observe(document.body, { childList: true, subtree: true }); });
  await anna.waitForFunction(() => document.querySelectorAll(".ez-name3d.feind").length >= 1, null, { timeout: 30000 }).catch(() => {});
  await anna.waitForFunction(() => [...window.EZK.bilder.values()].filter((b) => b.fl.geladen).length >= 1, null, { timeout: 60000 }).catch(() => {});
  const sicht = await anna.evaluate(() => { const K = window.EZK; return { max: K.z.w.filter((e) => e[3] !== 0).map((e) => e[8]), schilder: [...document.querySelectorAll(".ez-name3d.feind")].map((e) => e.textContent), figuren: [...K.bilder.values()].filter((b) => b.fl.geladen).length }; });
  check(sicht.figuren >= 1, `Banditen als Figuren in der 3D-Welt (${sicht.figuren} geladen)`);
  check(sicht.max.every((m) => m === 6) && sicht.schilder.every((t) => t === "Bandit · Lv 1"), `Banditen Level 1 mit 6 LP (${[...new Set(sicht.schilder)].join()} · ${[...new Set(sicht.max)].join()})`);
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "kampf3d.png" });
  /* kämpfen, bis Skill-XP gebucht sind (alle 10 s) */
  const xpSumme = () => XPBUCH.filter((x) => x.p_user.endsWith("a001")).reduce((n, x) => n + x.p_geschick + x.p_staerke, 0); let blocks = 0, treffer = 0;
  anna.on("console", () => {});
  await anna.evaluate(() => { window.__zahlen = []; new MutationObserver((l) => { for (const m of l) for (const n of m.addedNodes) if (n.classList && n.classList.contains("ez-splat")) window.__zahlen.push((n.classList.contains("rot") ? "rot:" : "blau:") + n.textContent); }).observe(document.body, { childList: true }); });
  for (let i = 0; i < 200 && (xpSumme() === 0 || !(await anna.evaluate(() => window.__zahlen.includes("blau:0") && window.__zahlen.some((x) => /^rot:[1-9]\d*$/.test(x))))); i++) { await anna.keyboard.press("1"); await anna.waitForTimeout(250); }
  { const z = await anna.evaluate(() => window.__zahlen); treffer = z.filter((x) => /^rot:[1-9]\d*$/.test(x)).length; blocks = z.filter((x) => x === "blau:0").length; }
  check(xpSumme() > 0 && XPBUCH.every((x) => x.p_staerke === 0 && x.p_defense === 0 && x.p_fernkampf === 0 && x.p_magie === 0), `Stil „Akkurat“ gilt vom ersten Schlag an: XP nur an Geschick (${xpSumme()}), Stärke und Defense 0`);
  { const d = await anna.evaluate(() => window.__drops); check(d.length > 0 && d.every((x) => x.bilder > 0 && /\+\d/.test(x.text)), `XP-Drops mit Zeichen am oberen Rand (${d.length}, z. B. „${d[0] && d[0].text}“)`); }
  check(XPBUCH.every((x) => x.p_lp > 0 && x.p_geschick > x.p_lp), "Akkurat: 4 XP je Lebenspunkt an Geschick, 1,33 XP an Lebenspunkte");
  check(blocks > 0 && treffer > 0, `Hitsplats wie in OSRS: rot mit Schaden, blau mit 0 statt „geblockt“ (${treffer} rot, ${blocks} blau)`);
  { const b = await anna.waitForFunction(() => { const W = window.EZW.welt3d; return W.bodenBild && W.bodenBild.size > 0 ? [...W.bodenBild.keys()].length : 0; }, null, { timeout: 30000, polling: 500 }).then((h) => h.jsonValue()).catch(() => 0);
    check(b > 0, `Beute der Banditen liegt am Boden (Splitter aus dem ersten Wurf, ${b} Stück sichtbar)`); }
  { const lp = await anna.evaluate(() => { const K = window.EZK, ich = K.z.w.find((e) => e[0] === K.z.ich.id); return { text: (document.querySelector("#ez-kartenrahmen .lpzahl") || {}).textContent, soll: ich ? `${Math.round(ich[7])} / ${ich[8]}` : "" }; });
    check(lp.text && /^\d+ \/ \d+$/.test(lp.text), `Lebenspunkte im Bogen an der Minikarte: ${lp.text} (Server: ${lp.soll})`); }
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "kampf3d-treffer.png" });
  console.log("    Zustand beim Foto:", await anna.evaluate(() => { const K = window.EZK, W = window.EZW.welt3d; return JSON.stringify({ art: K && K.art, region: K && K.region, hier: W.hier, xp: K && K.z && K.z.ich.xp, stufe: K && K.z && K.z.ich.stufe, lp: document.querySelector("#ez-lpzahl").textContent, v1: K && K.v1, naechster: window.EZN && window.EZN.region }); }));
  const lokal = await anna.evaluate(() => JSON.parse(localStorage.getItem("ez_skills2") || "{}").geschick || 0); check(lokal > 0, `Der Browser zeigt den Stand des Servers (ez_skills2 Geschick ${lokal})`);
  /* Mogeln: eine fremde Waffe melden – mit Server-Inventar zählt allein das, was der Server als angelegt kennt */
  await anna.evaluate(() => window.EZK.netz.sende({ t: "ausruestung", angelegt: { waffe: "hirtenstab", nebenhand: "rundschild" } })); await anna.waitForTimeout(600);
  check(await anna.evaluate(() => { const K = window.EZK, h = K.netz && K.z && K.z.w.find((e) => e[0] === K.z.ich.id); return !/Stab/.test(document.querySelector("#ez-name").textContent); }) && !/Ausrüstung Anna: waffe=hirtenstab/.test(log), "Eine gemeldete fremde Waffe (Stab) ändert nichts – der Server nimmt seine eigene Ausrüstung");
  /* Schwert ablegen → Fäuste (über den Server) */
  await anna.evaluate(() => window.EZW && 0); await anna.click('#ez-leiste [data-l="ausruestung"]'); await anna.waitForTimeout(400); await anna.click('#ez-ausruestungtab .ifeld.voll[data-wo="waffe"]', { button: 'right' }); await anna.click('.ez-aktionen button:has-text("Ablegen")'); await anna.waitForTimeout(800); await anna.click('#ez-leiste [data-l="ausruestung"]');
  await anna.waitForFunction(() => document.querySelector("#ez-name").textContent === "Fäuste", null, { timeout: 8000 }).catch(() => {});
  { const st = await anna.evaluate(() => ({ name: document.querySelector("#ez-name").textContent, inv: localStorage.getItem("ez_inventar"), konto: !document.getElementById("ez-konto").hidden, gesperrt: window.EZW.welt3d.gesperrt }));
    check(st.name === "Fäuste", `Schwert abgelegt: Server und Anzeige kämpfen mit Fäusten (${JSON.stringify(st)})`); }
  /* Schwert wieder anlegen (mit Fäusten – Trefferwert 1 – überlebt man die Banditen nicht lange) */
  await anna.click('#ez-leiste [data-l="rucksack"]'); await anna.waitForTimeout(400); await anna.click('#ez-rucksacktab .ifeld.voll[data-g="ritterschwert"]', { button: 'right' }); await anna.click('.ez-aktionen button:has-text("Ausrüsten")'); await anna.waitForTimeout(800); await anna.click('#ez-leiste [data-l="rucksack"]');
  await anna.waitForFunction(() => document.querySelector("#ez-name").textContent === "Trainingsschwert", null, { timeout: 8000 }).catch(() => {}); check(await anna.evaluate(() => document.querySelector("#ez-name").textContent) === "Trainingsschwert", "Schwert aus dem Rucksack wieder angelegt");
  /* gehen: die letzten XP werden gebucht */
  for (let i = 0; i < 40 && (await anna.evaluate(() => JSON.parse(localStorage.getItem("ez_skills2") || "{}").staerke || 0)) <= HELD["00000000-0000-0000-0000-00000000a001"].skill_staerke; i++) { await anna.keyboard.press("1"); await anna.waitForTimeout(250); } /* mit Fäusten weiter, bis neue (noch nicht gebuchte) XP da sind */
  const zuletzt = await anna.evaluate(() => JSON.parse(localStorage.getItem("ez_skills2") || "{}").staerke || 0), vorDb = HELD["00000000-0000-0000-0000-00000000a001"].skill_staerke;
  await anna.close(); for (let i = 0; i < 30 && HELD["00000000-0000-0000-0000-00000000a001"].skill_staerke < zuletzt; i++) await new Promise((r) => setTimeout(r, 500)); /* steht der Held beim Schließen noch im Kampf, bleibt er kurz in der Welt (Abmelden) – die Buchung kommt dann etwas später */ const nachDb = HELD["00000000-0000-0000-0000-00000000a001"].skill_staerke;
  check(nachDb >= zuletzt && nachDb >= vorDb, `Beim Verlassen: die offenen XP werden gebucht (Datenbank ${vorDb} → ${nachDb}, zuletzt angezeigt ${zuletzt})`);
  /* Gast mit eigenem Helden: der Browser rechnet nach v1 */
  const gast = await spieler("Gast", "", [6536, 6583, "waldweg"]); await gast.goto(B + S); await bereit(gast); await gast.waitForTimeout(1200);
  check(await gast.evaluate(() => window.EZK.art === "lokal" && window.EZK.v1 && window.EZK.netz.sim.wesen.filter((w) => !w.held).every((w) => w.max === 6)), "Gast: der Browser rechnet nach v3, Banditen mit 6 LP");
  for (let i = 0; i < 80 && !(await gast.evaluate(() => (JSON.parse(localStorage.getItem("ez_skills2") || "{}").staerke || 0) > 0)); i++) { await gast.keyboard.press("1"); await gast.waitForTimeout(250); }
  check(await gast.evaluate(() => (JSON.parse(localStorage.getItem("ez_skills2") || "{}").staerke || 0) > 0), "Gast: Nahkampf-XP auf dem Gerät gemerkt");
  /* Mit Konto, aber der Spielserver antwortet nicht: nach der Wartefrist rechnet der Browser – und sagt im Chat deutlich, dass es keine Beute gibt */
  { const cara = await spieler("Cara", "tok_anna_" + "x".repeat(30), [6536, 6583, "waldweg"]); await cara.goto(B + S.replace(/server=[^&]*/, "server=ws://localhost:1")); await bereit(cara).catch(() => {});
    const hinweis = await cara.waitForFunction(() => [...document.querySelectorAll("#ez-chat li, .ez-chat .zeile, #ez-chat div, #ez-dorf-hilfe")].some((e) => /Keine Verbindung zum Spielserver.*keine Beute/.test(e.textContent)), null, { timeout: 120000, polling: 1000 }).then(() => true).catch(() => false);
    check(hinweis, "Spielserver nicht erreichbar: Hinweis im Chat – keine Beute, XP nicht gespeichert"); }
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.slice(0, 3).join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500)); if (process.env.STILDEBUG) console.log(log.split("\n").filter((l) => /STILDEBUG|Anmeldung|betritt/.test(l)).join("\n"));
console.log(fehler ? fehler + " Fehler" : "Kampf in der 3D-Welt: alles in Ordnung"); process.exit(fehler ? 1 : 0);
