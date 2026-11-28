/* #183: Weltkarte auf dem Handy ruckelte beim Verschieben. Ursachen (gemessen, Handy-Emulation 390×844, CPU 4× gebremst: 0,9 Bilder/s, je Zug 21,7 ms):
   vor allem zeichnete die 3D-Welt hinter der deckenden Karte weiter (ohne sie: 42 Bilder/s, 0,5 ms je Zug); dazu verteilte jede Bewegung
   alle ~200 Kartensymbole neu, obwohl sich der Zoom nicht ändert (0,5 → 0,2 ms je Zug).
   Läuft in Handy-Emulation quer (844×390, Pixelverhältnis 3, Touch – das Spiel verlangt auf dem Handy Querformat). Prüft außerdem die Zoomstufen (Lupe, Doppeltipp, Ereignis) und das Nachladen nach Sichtbereich. Prüft: beim Ziehen werden die Symbole nicht angefasst, hinter der offenen Karte zeichnet die 3D-Welt nicht (nach dem Schließen wieder); gibt Bilder/s aus.
   Aufruf: node test/karte-ziehen-ui.test.mjs
   (Gerüst aus rucksack-bilder-ui) – alt: #166: Rucksackbilder auch nach einem gescheiterten Vorladen – während des Einloggens sind die Bilder nicht erreichbar (Handy: Netz überlastet,
   Zeitüberschreitung), danach wieder. Öffnet man dann den Rucksack, sind alle Bilder da (vorher blieb der Fehlschlag gemerkt: nur die Mengen). Gerüst aus inventar-ui.test.mjs.
   Aufruf: node test/rucksack-bilder-ui.test.mjs */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: ["jagdbogen", "hammer", "stamm_eiche", "lederpanzer", "spitzhacke_training", "holzbeil_training", "brot", { g: "splitter", n: 12 }], v: 2 }, quests: { die_gesperrte_strasse: { s: "fertig" } } } } /* Quest 1 erledigt: Jori läuft nicht herbei und stellt sich nicht auf den Beutel */, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  send(404, {}); }); }).listen(8870);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8869", SUPABASE_URL: "http://localhost:8870", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8870/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8870/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8870/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&aufloesung=0.5&vorwaermen=0&server=ws://localhost:8869" /* langsame Testrechner (SwiftShader): halbe Auflösung, nicht vorwärmen – sonst kommt die Antwort des Servers erst nach 10–17 s an (#136) */, B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(() => { const t = setInterval(() => { const f = window.EZ_UNTAETIG; if (f) { f(-864e5); clearInterval(t); } }, 200); }); /* wach halten (#109): mit ?server= läuft der Untätigkeitswächter nicht, die letzte Eingabe bliebe beim Laden stehen – nach 70 s kein Lebenszeichen „da“ mehr, und der Server meldet nach 5½ Minuten ab. Unter Last dauert der Test länger. */ await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6448, 6440, "waldmark"]); anna.setDefaultTimeout(90000);
  await anna.goto(B + S + "&vorwaermen=0"); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForTimeout(4000);
  await anna.keyboard.press("m"); await anna.waitForSelector("#ez-uebersicht .wk-flaeche", { timeout: 20000 }); await anna.waitForTimeout(3000);
  const n = await anna.evaluate(() => ({ sym: document.querySelectorAll("#ez-uebersicht .wk-symbol").length, namen: document.querySelectorAll("#ez-uebersicht .wk-name").length, img: document.querySelectorAll("#ez-uebersicht img").length }));
  console.log("Karte:", JSON.stringify(n));
  const cdp = await anna.context().newCDPSession(anna); await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.BREMSE || 4) });
  const bilder3d = () => anna.evaluate(() => window.EZW.welt3d.motor.r.info.render.frame);
  const finger = (type, p) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [] });
  await anna.evaluate(() => { window.__b = 0; window.__lauf = true; const f = () => { if (!window.__lauf) return; window.__b++; requestAnimationFrame(f); }; requestAnimationFrame(f);
    window.__mv = []; const fl = document.querySelector("#ez-uebersicht .wk-flaeche"); fl.addEventListener("pointermove", () => { window.__mvA = performance.now(); }, true); fl.addEventListener("pointermove", () => { window.__mv.push(performance.now() - window.__mvA); });
    window.__sym = 0; const lw = document.querySelector("#ez-uebersicht .wk-leinwand"); new MutationObserver((l) => { window.__sym += l.filter((m) => m.target !== lw && !m.target.closest(".wk-ich")).length; }).observe(lw, { subtree: true, attributes: true, attributeFilter: ["style"] }); });
  await anna.evaluate(() => { const m = window.EZW.welt3d.motor, bb = m.beimBild; window.__logik = 0; m.beimBild = (dt) => { window.__logik++; bb(dt); }; });
  await cdp.send("Performance.enable"); const met = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value])); const m0 = await met();
  const g0 = await bilder3d(), t0 = Date.now(); let x = 300, y = 200, r = 1;
  await finger("touchStart", { x, y }); for (let k = 0; k < 60; k++) { x += r * 6; if (x > 700 || x < 150) r = -r; y += (k % 40 < 20 ? 2 : -2); await finger("touchMove", { x, y }); } await finger("touchEnd");
  const dt = (Date.now() - t0) / 1000, e = await anna.evaluate(() => { window.__lauf = false; const sym = [...document.querySelectorAll("#ez-uebersicht .wk-symbol")]; const mv = window.__mv.slice().sort((a, b) => a - b); return { b: window.__b, m: window.__sym, med: mv[mv.length >> 1] || 0, mvn: mv.length, lw: document.querySelector("#ez-uebersicht .wk-leinwand").style.transform }; }), g1 = await bilder3d();
  const m1 = await met(), proZug = (m1.TaskDuration - m0.TaskDuration) * 1000 / 60, logik = await anna.evaluate(() => window.__logik);
  console.log(`  Arbeit je Zug: ${proZug.toFixed(1)} ms (Skript ${((m1.ScriptDuration - m0.ScriptDuration) * 1000 / 60).toFixed(1)} ms, Stil ${((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000 / 60).toFixed(1)} ms), Spiellogik ${logik}× in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  Ziehen: ${(e.b / dt).toFixed(1)} Bilder/s (${e.b} in ${dt.toFixed(1)} s), Leinwand ${e.lw}`);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  check(n.sym > 50, `Karte mit vielen Symbolen offen (${n.sym} Symbole, ${n.namen} Namen)`);
  check(/translate\(/.test(e.lw), "Die Karte hat sich beim Ziehen verschoben");
  check(e.m <= 1, `Beim Ziehen bleiben Symbole und Namen unangetastet (${e.m} Stiländerungen außer der Leinwand)`);
  check(proZug < 30, `Ein Zug kostet wenig Arbeit (${proZug.toFixed(1)} ms bei 4× gebremster CPU; vor Teil 2 rund 49 ms, weil die Spiellogik dahinter jedes Bild lief)`);
  check(logik > 0 && logik <= Math.ceil(dt * 14) + 2, `Hinter der Karte läuft die Spiellogik gedrosselt weiter (${logik}× in ${dt.toFixed(1)} s, etwa 10-mal je Sekunde)`);
  check(g1 - g0 === 0, `Hinter der offenen Karte zeichnet die 3D-Welt nicht (${g1 - g0} Bilder)`);
  /* Ausgabe 1 (#183): feste Zoomstufen Welt · Gegend · Nah (Lupe, Doppeltipp), Regionsbilder nach Sichtbereich, Ebene für die Oberfläche */
  const stand = () => anna.evaluate(() => { const lw = document.querySelector("#ez-uebersicht .wk-leinwand"), alle = [...lw.querySelectorAll("img[data-region]")], an = alle.filter((i) => i.getAttribute("src")), kaputt = alle.filter((i) => !i.getAttribute("src") && getComputedStyle(i).display !== "none").length;
    const wb = lw.querySelector(".wk-weltbild");
    return { z: Number((/scale\(([\d.]+)\)/.exec(lw.style.transform) || [])[1]), an: an.length, alle: alle.length, mpx: an.reduce((q, i) => q + i.naturalWidth * i.naturalHeight, 0) / 1e6, ebene: Boolean(lw.querySelector(".wk-ebene")), kaputt,
      zwei: an.filter((i) => /karte2-/.test(i.src)).length, weltbild: wb ? { sichtbar: !wb.hidden, geladen: wb.complete && wb.naturalWidth > 0 } : null }; });
  const mitBildern = await anna.evaluate(async () => { try { const j = await (await fetch("../echtzeit/welt/welt.json")).json(); return Boolean(j.karte && j.karte.welt); } catch { return false; } });
  await anna.evaluate(() => { window.__zoom = []; addEventListener("ez-karte-zoom", (e) => window.__zoom.push(e.detail.stufe)); });
  const s1 = await stand();
  check(Math.abs(s1.z - 1) < 1e-3 && s1.an > 0 && s1.an < s1.alle, `Geöffnet in „Gegend“ (Leinwand-Zoom ${s1.z}), geladen sind nur die nahen Regionsbilder (${s1.an} von ${s1.alle}, ${s1.mpx.toFixed(1)} MPx statt 73)`);
  { const st = await anna.evaluate(() => { const lw = document.querySelector("#ez-uebersicht .wk-leinwand"), n = lw.querySelector(".wk-name"); return { b: parseFloat(lw.style.width), h: parseFloat(lw.style.height), schatten: n ? getComputedStyle(n).textShadow : "" }; });
    check(st.b < 4000, `Leinwand in der Dichte von „Gegend“ statt 9600×12672 px mit scale (${Math.round(st.b)}×${Math.round(st.h)} px)`);
    check((st.schatten.match(/rgb/g) || []).length <= 2, `Namen mit leichtem Schatten (${st.schatten})`); }
  check(s1.ebene, "Ebene für die Symbole der Oberfläche liegt auf der Leinwand (karteEbene)");
  await anna.click('#ez-uebersicht [data-k="rein"]'); await anna.waitForTimeout(800); const s2 = await stand();
  check(Math.abs(s2.z - 10 / 3) < 1e-3 && s2.an >= 1 && s2.an <= s1.an, `Lupe +: „Nah“ (Zoom ${s2.z}), ${s2.an} Regionsbilder geladen`);
  await anna.click('#ez-uebersicht [data-k="raus"]'); await anna.waitForTimeout(500); await anna.click('#ez-uebersicht [data-k="raus"]'); await anna.waitForTimeout(800); const s3 = await stand();
  check([s1, s2, s3].every((x) => x.kaputt === 0), `Regionsbilder ohne geladenes Bild bleiben unsichtbar (keine Rahmen fehlender Bilder: ${[s1, s2, s3].map((x) => x.kaputt).join("/")})`);
  if (mitBildern) { check(Boolean(s3.weltbild && s3.weltbild.sichtbar && s3.weltbild.geladen) && s3.an < s1.an, `„Welt“ zeigt das eine Bild der Oberwelt statt der Regionsbilder darin (${JSON.stringify(s3.weltbild)}, ${s3.an} Regionsbilder außerhalb)`);
    check(s1.zwei === s1.an && s1.an > 0 && s2.zwei === 0, `„Gegend“ lädt die Bilder mit 2 px je Feld (${s1.zwei} von ${s1.an}), „Nah“ die vollen (${s2.zwei} halbe von ${s2.an})`); }
  else console.log("  (welt.json ohne „karte“: überall die vollen Regionsbilder)");
  check(Math.abs(s3.z - 1 / 3) < 1e-3, `Lupe − zweimal: „Welt“ (Zoom ${s3.z}), ${s3.an} Regionsbilder geladen`);
  await anna.click('#ez-uebersicht [data-k="raus"]'); await anna.waitForTimeout(400); check(Math.abs((await stand()).z - 1 / 3) < 1e-3, "Weiter hinaus als „Welt“ geht es nicht");
  { const cdp2 = await anna.context().newCDPSession(anna), tipp = async () => { await cdp2.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 420, y: 200, id: 2 }] }); await cdp2.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); };
    await tipp(); await anna.waitForTimeout(120); await tipp(); await anna.waitForTimeout(800); const s4 = await stand(); check(Math.abs(s4.z - 1) < 1e-3, `Doppeltipp: eine Stufe näher (Zoom ${s4.z})`); }
  const zs = await anna.evaluate(() => window.__zoom); check(JSON.stringify(zs) === "[2,1,0,1]", `Ereignis ez-karte-zoom meldet jede Stufe (${JSON.stringify(zs)})`);
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(1500); const g2 = await bilder3d(); await anna.waitForTimeout(2000); const g3 = await bilder3d();
  check(!(await anna.$("#ez-uebersicht")) && g3 > g2, `Nach dem Schließen zeichnet die 3D-Welt wieder (${g3 - g2} Bilder in 2 s)`);
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Karte ziehen: alles in Ordnung"); process.exit(fehler ? 1 : 0);
