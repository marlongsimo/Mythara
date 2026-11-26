/* Fischen im Browser (Phase 3b): Anna steht am Mühlgraben in Weidenhain mit Angelrute, Würmern und einer Fischsuppe. Wellenkreise nur an den aktiven Stellen,
   Antippen → angeln → Bachling; Fischsuppe essen → Schild „Defense +2“ mit Restzeit im Profil. Gerüst aus wegstein-ui.test.mjs. Aufruf: node test/fischen-ui.test.mjs (BILD=pfad/ für Fotos) */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const HELDBASIS = (rucksack = ["angelrute", { g: "wurm", n: 20 }, "fischsuppe", "fisch_bachling_roh"]) => ({ geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert" }, rucksack, v: 2, ladungen: { wegstein: 5 } } });
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { ...HELDBASIS(), quests: { die_gesperrte_strasse: { s: "fertig" } } } }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  if (req.url === "/rest/v1/rpc/rpg_freunde_von") { const a = JSON.parse(b), ich = a.p_user, ander = Object.keys(PROFIL).find((u) => u !== ich); return send(200, [{ user_id: ander, handle: PROFIL[ander] }]); }
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); if (HELD[a.p_user]) HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_skill_gutschrift") { const a = JSON.parse(b); XPBUCH.push(a); const H = HELD[a.p_user]; if (!H) return send(200, null); for (const k of ["geschick", "staerke", "fernkampf", "magie"]) H["skill_" + k] += a["p_" + k]; return send(200, { geschick: H.skill_geschick, staerke: H.skill_staerke, fernkampf: H.skill_fernkampf, magie: H.skill_magie }); }
  send(404, {}); }); }).listen(8796);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8786", SUPABASE_URL: "http://localhost:8796", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", FISCH_WANDER_MS: "600000", TELEPORT_PAUSE_MS: "1000", BUCHUNG_SPAETESTENS_MS: "3000", HOLZ_FALL: "0", HOLZ_KERN: "0" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8796/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8796/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8796/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8786", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_quest_verfolgt", "weidenhain_der_wegstein"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);

let fehlerAus = 0;
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6469.5, 6684.5, "weidenhain"]);
  anna.setDefaultTimeout(90000); await anna.goto(B + S + "&vorwaermen=0");
  await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => window.EZW.welt3d.fische && window.EZW.welt3d.fische.liste.filter((l) => l.geladen).length >= 8, null, { timeout: 60000 }).catch(() => {});
  const F = await anna.evaluate(() => window.EZW.welt3d.fische.liste.filter((l) => l.id.startsWith("muehlgraben_") && !l.id.includes("unten")));
  const da = F.filter((l) => !l.leer);
  check(F.length === 8 && da.length === 2, `Mühlgraben: 2 von 8 Fangstellen sichtbar (${da.map((l) => l.id).join(", ")})`);
  const ziel = da[0], knopf = await anna.evaluate(([x, y]) => { const s = window.EZW.welt3d.anStelle(x, y); return s && s.text; }, [ziel.x, ziel.y]);
  check(/Bachling angeln/.test(knopf || ""), "Fangstelle antippbar: " + knopf);
  const ruht = F.find((l) => l.leer), still = await anna.evaluate(([x, y]) => { const s = window.EZW.welt3d.anStelle(x, y); return s && s.text; }, [ruht.x, ruht.y]);
  check(!/angeln/.test(still || ""), "Ruhende Stelle (keine Fische) nicht als Fangstelle antippbar: " + (still || "–"));
  await anna.evaluate(() => { const M = window.EZW.welt3d.motor; M.abstand = 8; M.neigen = 0.75; }); await anna.waitForTimeout(2500);
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "fischen-muehlgraben.png" });
  /* antippen: hingehen, angeln, bis ein Bachling im Rucksack ist */
  const p = await schirm(anna, ziel.x, ziel.y, 0.05); await anna.mouse.click(p.x, p.y);
  await anna.waitForFunction(() => window.EZW.chat().some((c) => /Bachling/.test(c.text || "") && /bekommst/.test(c.text || "")), null, { timeout: 90000 }).catch(() => {});
  const chat = await anna.evaluate(() => window.EZW.chat().map((c) => c.text || "")); if (process.env.DBG) console.log(chat.slice(-8), await anna.evaluate(() => [window.EZW.welt3d.ort.x, window.EZW.welt3d.ort.y, window.EZW.welt3d.fische.aktiv]), p, ziel);
  check(chat.some((c) => /wirfst die Schnur/.test(c)) && chat.some((c) => /Du bekommst .*Bachling/.test(c)), "Angeln per Antippen: Schnur ausgeworfen, Bachling gefangen");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "fischen-fang.png" });
  /* Fischsuppe essen: Rucksack → Rechtsklick → Essen; das Schild unter dem Lebensbalken zeigt die Wirkung mit Restzeit */
  await anna.click('#ez-leiste [data-l="rucksack"]'); await anna.waitForTimeout(500);
  await anna.click('#ez-rucksacktab .ifeld.voll[data-g="fischsuppe"]', { button: "right" }); await anna.waitForTimeout(400);
  const akt = await anna.$$eval(".ez-aktionen button", (bs) => bs.map((b) => b.textContent.trim()));
  check(akt[0] && /Essen/.test(akt[0]), "Rechtsklick auf die Fischsuppe: „Essen“ zuerst (" + akt.join(" · ") + ")");
  await anna.click(".ez-aktionen button"); await anna.waitForTimeout(1200);
  const schild = await anna.evaluate(() => { const e = document.getElementById("ez-wirkungen"); return e && !e.hidden ? e.textContent : ""; });
  check(/Defense \+2/.test(schild) && /[45]:\d\d/.test(schild), "Wirkung im Profil: " + schild);
  check((await anna.evaluate(() => window.EZW.chat().map((c) => c.text || ""))).some((c) => /Fischsuppe.*Defense \+2 für 5 Minuten/.test(c)), "Chat: Fischsuppe – Defense +2 für 5 Minuten");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "fischen-wirkung.png" });
  check(!fehlerSeite.length, "Keine Seitenfehler" + (fehlerSeite.length ? ": " + fehlerSeite.slice(0, 3).join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close();
console.log(fehler ? `${fehler} Fehler` : "Fischen im Browser: alles in Ordnung"); process.exit(fehler ? 1 : 0);
