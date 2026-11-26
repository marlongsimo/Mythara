/* Quest 02 „Der stille Rain“ im Browser (3D-Welt, echter Spielserver, nachgebildete Supabase): Odo, Bruchstellen und Ruten in Osthof, eine Bruchstelle antippen, Questtab mit zwei Quests, Mooshocker in der Zone. Aufruf: node test/quest02-ui.test.mjs */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
const T0 = Date.now(); let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t + (process.env.ZEIT ? ` [${((Date.now() - T0) / 1000).toFixed(0)} s]` : "")); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, quests: { die_gesperrte_strasse: { s: "fertig" }, osthof_der_stille_rain: { s: "spuren_0_0" } } }, "00000000-0000-0000-0000-00000000b002": { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, quests: { die_gesperrte_strasse: { s: "bestaetigt" } } } }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); const H = HELD[a.p_user]; H.quests = H.quests || {}; if ((H.quests[a.p_quest] || {}).s === "fertig") return send(200, false); H.quests[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  if (/^\/rest\/v1\/rpc\/rpg_held_quest_abschluss(_v2)?$/.test(req.url)) { const a = JSON.parse(b); a.v2 = req.url.endsWith("_v2"); if (a.v2 && (HELD[a.p_user].quests[a.p_quest] || {}).s !== "fertig") HELD[a.p_user].questpunkte = (HELD[a.p_user].questpunkte || 0) + Math.min(10, a.p_punkte || 0); const H = HELD[a.p_user]; if ((H.quests[a.p_quest] || {}).s === "fertig") return send(200, false); H.quests[a.p_quest] = { s: "fertig" }; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); if (HELD[a.p_user]) HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_skill_gutschrift") { const a = JSON.parse(b); XPBUCH.push(a); const H = HELD[a.p_user]; if (!H) return send(200, null); for (const k of ["geschick", "staerke", "fernkampf", "magie"]) H["skill_" + k] += a["p_" + k]; return send(200, { geschick: H.skill_geschick, staerke: H.skill_staerke, fernkampf: H.skill_fernkampf, magie: H.skill_magie }); }
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8789", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
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
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8789", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const BILD = process.env.BILD;
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6555.5, 6429.5, "osthof"]); /* in Osthof, neben der ersten Bruchstelle */
  await anna.goto(B + S); await bereit(anna).catch(() => {}); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => window.EZW.welt3d.quest && window.EZW.welt3d.quest.objekte && window.EZW.welt3d.quest.objekte.length >= 7, null, { timeout: 30000 }).catch(() => {});
  await anna.waitForTimeout(2500);
  const lage = () => anna.evaluate(() => { const q = window.EZW.welt3d.quest; return { objekte: q.objekte.map((o) => ({ id: o.d.id, sicht: o.g.visible, ring: o.ring.visible, kaputt: o.kaputt ? o.kaputt.visible : null })), figuren: q.figuren.filter((f) => f.q === "osthof_der_stille_rain").map((f) => f.n.name), ort: window.EZW.ort && window.EZW.ort() }; });
  let L = await lage();
  check(L.figuren.join() === "Brida Wegner,Odo Kern,Wenzel", `Quest-2-Figuren: ${L.figuren.join(", ")}`);
  const Q2O = L.objekte.filter((o) => /^(zaun|rute)\d/.test(o.id)); check(Q2O.length === 7 && Q2O.every((o) => o.sicht && o.ring) && L.objekte.filter((o) => !Q2O.includes(o)).every((o) => !o.sicht) /* Objekte anderer Quests (A2, A3) bleiben verborgen */, `Drei Bruchstellen und vier Rutenbündel sichtbar und leuchtend (${JSON.stringify(L.objekte.map((o) => o.id + (o.sicht ? "+" : "-")))})`);
  if (BILD) await anna.screenshot({ path: BILD + "q2-osthof.png" });
  /* Bruchstelle antippen: „untersuchen“ → der Server zählt, der Text kommt im Chat */
  const st = await anna.evaluate(() => { const s = window.EZW.welt3d.quest.stelle(6556.5, 6428.5); if (!s) return null; s.tat(); return s.text; });
  check(st === "Bruchstelle am Weg untersuchen", `Antippen der Bruchstelle: „${st}“`);
  await anna.waitForFunction(() => window.EZW.chat().some((n) => /Wurzel/.test(n.text)), null, { timeout: 8000 }).catch(() => {});
  L = await lage(); const chat = await anna.evaluate(() => window.EZW.chat().map((n) => n.text).filter((t) => /Wurzel|näher/.test(t)));
  check(chat.some((t) => /Wurzel/.test(t)) && L.objekte.find((o) => o.id === "zaun1").ring === false && L.objekte.find((o) => o.id === "zaun2").ring === true, `Untersucht: Text im Chat, die Stelle leuchtet nicht mehr (${chat.join(" | ").slice(0, 120)})`);
  /* Quest-Tab: zwei Quests, „Der stille Rain“ gestartet; Details zeigen den Fortschritt */
  await anna.click('#ez-leiste [data-l="quests"]'); await anna.waitForTimeout(400);
  const zeilen = await anna.evaluate(() => [...document.querySelectorAll("#ez-queststab .qzeile")].map((b) => b.textContent + ":" + b.className));
  check(zeilen.some((z) => /^Der stille Rain:.*aktiv/.test(z)), `Quest-Tab: ${zeilen.join(" · ")}`);
  await anna.click('#ez-queststab .qzeile[data-quest="osthof_der_stille_rain"]'); await anna.waitForTimeout(400);
  const d = await anna.evaluate(() => { const t = document.querySelector("#ez-konto .tafel.questinfo"); return t ? { jetzt: (t.querySelector(".qschritte .jetzt") || {}).textContent || "", start: (t.querySelector(".qstart") || {}).textContent || "" } : null; });
  check(d && /\(1\/3\)/.test(d.jetzt) && /\(0\/4\)/.test(d.jetzt) && /Brida/.test(d.start), `Details: ${d && d.jetzt}`);
  await anna.click("#ez-konto .tafel.questinfo [data-qv]"); await anna.waitForTimeout(600); await anna.keyboard.press("Escape");
  const pf = await anna.evaluate(() => { const z = window.EZW.welt3d.quest.ziel(); return z && [z.x, z.y]; });
  check(pf && pf[0] === 6562.5 && pf[1] === 6416.5, `Verfolgen: der Pfeil zeigt zur nächsten Bruchstelle (${pf})`);
  /* Die Mooshocker in der Osthof-Zone */
  await anna.waitForFunction(() => window.EZK && window.EZK.z && window.EZK.z.w && window.EZK.z.w.some((w) => w[2] === "mooshocker"), null, { timeout: 30000 }).catch(() => {});
  const moos = await anna.evaluate(() => window.EZK && window.EZK.z && window.EZK.z.w ? window.EZK.z.w.filter((w) => w[2] === "mooshocker").length : 0);
  check(moos === 7, `In der Osthof-Zone stehen ${moos} Mooshocker`);
  check(!fehlerSeite.length, "Keine Fehler auf der Seite" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ").slice(0, 300) : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close();
console.log(fehler ? `${fehler} Prüfung(en) fehlgeschlagen` : "Quest 02 im Browser: alles in Ordnung"); process.exit(fehler ? 1 : 0);
