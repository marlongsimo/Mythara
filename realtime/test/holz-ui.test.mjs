/* Holzfällerei im Spiel (Browser, echter Spielserver, nachgebildete Supabase; Grundgerüst aus bank-ui.test.mjs): Anna steht auf der Lichtung südlich der Waldmark,
   ein Trainings-Holzbeil im Rucksack, Ritterschwert in der Hand. Eiche antippen → „Eiche fällen“, Hiebe mit dem Beil (das Schwert verschwindet währenddessen),
   Stamm im Rucksack, Holzfällerei-XP unter Skills → Berufe. Aufruf: node test/holz-ui.test.mjs (BILD=pfad/ für Fotos) */
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
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
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
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6475.5, 6501.4, "waldweg"]); anna.setDefaultTimeout(90000);
  await anna.goto(B + S + "&vorwaermen=0"); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "null"); return i && i.angelegt && i.angelegt.waffe === "ritterschwert"; }, null, { timeout: 30000 }).catch(() => {});
  await anna.waitForFunction(() => window.EZW.welt3d.holz && window.EZW.welt3d.holz.liste.filter((b) => b.geladen).length >= 3, null, { timeout: 90000 }).catch(() => {}); await anna.waitForTimeout(2500);
  const ort = await anna.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier }));
  check(Math.hypot(ort.x - 6475.5, ort.y - 6501.4) < 2, `Anna steht auf der Lichtung südlich der Waldmark (${ort.x.toFixed(1)}, ${ort.y.toFixed(1)}, ${ort.hier})`);
  const liste = await anna.evaluate(() => window.EZW.welt3d.holz.liste);
  check(liste.length === 37 || liste.length > 20, `Holzfäller-Bäume bekannt: ${liste.length}`);
  check(liste.filter((b) => b.geladen && /^(eiche_1[5-7]|tanne_3)$/.test(b.id)).length >= 3, "Die Bäume der Lichtung sind geladen: " + liste.filter((b) => b.geladen).map((b) => b.id).join(", "));
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "holz-lichtung.png" });
  const st = await anna.evaluate(() => { const s = window.EZW.welt3d.anStelle(6475.5, 6503.5); return s && s.text; });
  check(st === "Eiche fällen", "An der Eiche: „Eiche fällen“ (" + st + ")");
  await anna.evaluate(() => { const f = window.EZW.welt3d.figur, alt = f.beilWeg.bind(f); /* Zustand kurz vor dem Wegstecken des Beils festhalten */
    f.beilWeg = () => { const w = [...f.teile].filter(([n]) => /^waffe/.test(n)); if (f.beil && f.beil.visible) window.__hieb = { schwertWeg: w.length > 0 && w.every(([, o]) => !o.visible), waffenteile: w.length }; alt(); if (window.__hieb) window.__nach = { beil: Boolean(f.beil && f.beil.visible), schwert: w.length > 0 && w.every(([, o]) => o.visible) }; }; });
  { const q = await schirm(anna, 6475.5, 6503.5, 2.5); await anna.mouse.click(q.x, q.y); }
  /* Während des Hiebs: Beil in der Hand, Schwert weg */
  if (process.env.DEBUG) { await anna.waitForTimeout(4000); console.log("DEBUG", JSON.stringify(await anna.evaluate(() => { const f = window.EZW.welt3d.figur, H = window.EZW.welt3d.holz; let knochen = []; if (f.wurzel) f.wurzel.traverse((o) => { if (o.isBone && /hand/i.test(o.name)) knochen.push(o.name); });
    return { dauer: f.clips && f.clips.get("angriff") && f.clips.get("angriff").duration, typ: f.constructor.name, hieb: typeof f.beilHieb, wurzel: !!f.wurzel, mixer: !!f.mixer, beil: !!f.beil, beilUrl: f.beilUrl, knochen, faellt: H.faellt, hbeil: H.beil, teile: [...(f.teile || [])].map(([n]) => n) }; }))); }
  const hieb = await anna.waitForFunction(() => window.__hieb, null, { timeout: 120000, polling: 200 }).then((h) => h.jsonValue()).catch(() => null);
  check(!!hieb, "Hieb: das Holzbeil erscheint in der Hand (ohne es anzulegen)");
  check(hieb && hieb.schwertWeg, "Während des Hiebs ist das Schwert ausgeblendet " + JSON.stringify(hieb));
  if (process.env.BILD) { await anna.waitForTimeout(250); await anna.screenshot({ path: process.env.BILD + "holz-hieb.png" }); }
  const stamm = await anna.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "{}"); return (i.rucksack || []).includes("stamm_eiche"); }, null, { timeout: 90000 }).then(() => true).catch(() => false);
  check(stamm, "Ein Eichenstamm liegt im Rucksack");
  check(await anna.evaluate(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "{}"); return i.angelegt && i.angelegt.waffe === "ritterschwert"; }), "Das Schwert bleibt angelegt (das Beil wurde nicht angelegt)");
  check(await anna.evaluate(() => [...document.querySelectorAll("#ez-chat li, .ez-chat .zeile, #ez-chat div")].some((e) => /Eichenstamm|Eiche/.test(e.textContent))), "Im Chat steht etwas zum Fällen");
  const xp = await anna.evaluate(() => (window.EZW.welt3d && JSON.parse(localStorage.getItem("ez_inventar") || "{}").berufe || {}).holzfaellerei || 0);
  check(xp >= 25, "Holzfällerei-XP im Inventar: " + xp);
  const nach = await anna.waitForFunction(() => window.__nach, null, { timeout: 60000, polling: 200 }).then((h) => h.jsonValue()).catch(() => null);
  check(nach && !nach.beil && nach.schwert, "Nach dem Hieb: Beil weg, Schwert wieder in der Hand " + JSON.stringify(nach));
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Holzfällerei im Spiel: alles in Ordnung"); process.exit(fehler ? 1 : 0);
