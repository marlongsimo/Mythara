/* Wegstein mit zwei Browsern (Phase 3a): Anna (B1 fertig, 5 Ladungen) steht im Osthof, Ben an der Linde in Weidenhain.
   Ben sieht Bindestein und Seelenlichter; Anna reibt den Wegstein im Rucksack (Rechtsklick → Reiben → Ziel) und landet an der Linde –
   Position vom Server, eine Ladung weniger, Ben sieht sie dort. Gerüst aus muehle-ui.test.mjs. Aufruf: node test/wegstein-ui.test.mjs (BILD=pfad/ für Fotos) */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const HELDBASIS = (rucksack = ["wegstein", { g: "splitter", n: 40 }]) => ({ geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert" }, rucksack, v: 2, ladungen: { wegstein: 5 } } });
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { ...HELDBASIS(), quests: { die_gesperrte_strasse: { s: "fertig" }, weidenhain_der_wegstein: { s: "fertig" } } } /* Anna: B1 fertig */,
  "00000000-0000-0000-0000-00000000b002": { ...HELDBASIS(), quests: { die_gesperrte_strasse: { s: "fertig" }, weidenhain_der_wegstein: { s: "fertig" } } } /* Ben: B1 fertig */ }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", TELEPORT_PAUSE_MS: "1000", BUCHUNG_SPAETESTENS_MS: "3000", HOLZ_FALL: "0", HOLZ_KERN: "0" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
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
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_quest_verfolgt", "weidenhain_der_wegstein"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

/* #53: die eigene Figur nach einem Teleport ohne Neuladen (Wegstein, Freunde) – wieder sichtbar, ohne Lichtsäule, nicht durchsichtig */
const figurDa = (p) => p.evaluate(() => { const f = window.EZW.welt3d.figur; if (!f || !f.wurzel) return { ok: false, grund: "kein Modell" }; let blass = 0; f.wurzel.traverse((o) => { if (o.isMesh && o.visible && o.material && o.material.opacity < 0.9) blass++; });
  const ok = f.an !== false && f.bild.gruppe.visible && f.wurzel.visible && !f.effekt && !f.gestorben && blass === 0 && Math.abs(f.wurzel.scale.x - f.wurzel.scale.y) < 1e-3;
  return { ok, grund: `gruppe=${f.bild.gruppe.visible} wurzel=${f.wurzel.visible} effekt=${Boolean(f.effekt)} gestorben=${f.gestorben} blass=${blass} skala=${f.wurzel.scale.x.toFixed(2)}/${f.wurzel.scale.y.toFixed(2)}` }; });
const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);

let wach = null;
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6530.5, 6432.5, "osthof"]), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6451.5, 6686.5, "weidenhain"]);
  for (const p of [anna, ben]) { p.setDefaultTimeout(90000); await p.goto(B + S + "&vorwaermen=0"); }
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  /* Der Test dauert länger als 5 Minuten: Ben bleibt wach (sonst meldet ihn das Spiel nach 5 Minuten ohne Eingabe ab – Browser und Server) */
  wach = setInterval(() => { void ben.mouse.click(660, 380).catch(() => {}); }, 45000);   /* Ben geht ab und zu einen Schritt: Eingaben im Browser und Bewegung in der Kampfwelt */
  await ben.waitForFunction(() => window.EZW.welt3d.lichter && window.EZW.welt3d.lichter.liste.filter((l) => l.geladen).length >= 4, null, { timeout: 60000 }).catch(() => {});
  const L = await ben.evaluate(() => window.EZW.welt3d.lichter.liste.filter((l) => l.art === "matt").map((l) => l.id + (l.geladen ? "+" : "-")));
  check(L.length === 4 && L.every((x) => x.endsWith("+")), "Ben an der Linde: vier Matte Lichter geladen (" + L.join(",") + ")");
  const stein = await ben.evaluate(() => { const W = window.EZW.welt3d, s = W.anStelle(6453.2, 6679.4); return s && s.text; });
  check(/Bindestein/.test(stein || ""), "Bindestein an der Linde antippbar: " + stein);
  const licht = await ben.evaluate(() => { const s = window.EZW.welt3d.anStelle(6448.5, 6679.5); return s && s.text; });
  check(/Mattes Licht einfangen/.test(licht || ""), "Seelenlicht antippbar: " + licht);
  await ben.evaluate(() => { const M = window.EZW.welt3d.motor; M.abstand = 9; M.neigen = 0.6; }); await ben.waitForTimeout(2500);
  if (process.env.BILD) await ben.screenshot({ path: process.env.BILD + "wegstein-linde.png" });
  /* Anna: Rucksack → Rechtsklick auf den Wegstein → „Reiben“ → Ziel */
  await anna.click('#ez-leiste [data-l="rucksack"]'); await anna.waitForTimeout(500);
  await anna.click('#ez-rucksacktab .ifeld.voll[data-g="wegstein"]', { button: "right" }); await anna.waitForTimeout(400);
  const akt = await anna.$$eval(".ez-aktionen button", (bs) => bs.map((b) => b.textContent.trim())); check(akt[0] && /Reiben/.test(akt[0]), "Rechtsklick auf den Wegstein: „Reiben“ zuerst (" + akt.join(" · ") + ")");
  await anna.click('.ez-aktionen button:has-text("Reiben")'); await anna.waitForTimeout(500);
  const ziele = await anna.$$eval(".ez-aktionen button", (bs) => bs.map((b) => b.textContent.trim())), kopf = await anna.evaluate(() => (document.querySelector(".ez-aktionen") || {}).textContent || "");
  check(ziele.some((t) => /Linde/.test(t)) && !ziele.some((t) => /Windmühle/.test(t)) && /5 Ladungen/.test(kopf), "Zielliste: nur die Linde (A3 nicht fertig), 5 Ladungen (" + ziele.join(" · ") + ")");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "wegstein-ziele.png" });
  await anna.click('.ez-aktionen button:has-text("Linde")');
  const da = await anna.waitForFunction(() => { const W = window.EZW.welt3d; return W.hier === "weidenhain" && Math.hypot(W.ort.x - 6452.5, W.ort.y - 6684.5) < 2.5 && !W.gesperrt; }, null, { timeout: 60000, polling: 250 }).then(() => true, () => false);
  const o = await anna.evaluate(() => ({ gesperrt: window.EZW.welt3d.gesperrt, x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier, lad: (JSON.parse(localStorage.getItem("ez_inventar") || "{}").ladungen || {}).wegstein }));
  check(da && o.lad === 4 && Math.hypot(o.x - 6452.5, o.y - 6684.5) < 3, `Anna ist an der Linde (gesperrt=${o.gesperrt} ${o.x.toFixed(1)}, ${o.y.toFixed(1)}, ${o.hier}), 4 Ladungen übrig (${o.lad})`);
  { const fd = await figurDa(anna); check(fd.ok, "Wegstein: Annas eigene Figur ist an der Linde wieder sichtbar (" + fd.grund + ")"); }
  await anna.waitForTimeout(4000); void (JSON.stringify(await anna.evaluate(() => { const W = window.EZW.welt3d; return { gesperrt: W.gesperrt, holt: [...W.daten.values()].filter((d) => d === "holt").length, blende: W.blende && W.blende.className }; })));
  const sieht = await ben.evaluate(() => { const W = window.EZW.welt3d, K = window.EZK, l = W.mit && W.mit.figuren ? [...W.mit.figuren.values()].map((f) => f.d.n + "@" + Math.round(f.d.wx) + "," + Math.round(f.d.wy)) : [];
    if (K && K.z) for (const e of K.z.w) if (e[1] === 1 && e[0] !== K.ichId) { const n = K.namen.get(e[0]); if (n) l.push(n.name + "@" + (K.zone.x0 + e[4]).toFixed(0) + "," + (K.zone.y0 + e[5]).toFixed(0)); }
    return l; });
  check(sieht.some((t) => /^Anna@645[0-5],668[2-7]$/.test(t)), "Ben sieht Anna an der Linde: " + sieht.join(" | "));
  await anna.waitForTimeout(4000); const o2 = await anna.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier }));
  check(Math.hypot(o2.x - 6452.5, o2.y - 6684.5) < 3 && o2.hier === "weidenhain", `8 s später steht Anna immer noch an der Linde – die Kampfwelt holt sie nicht zurück (${o2.x.toFixed(1)}, ${o2.y.toFixed(1)}, ${o2.hier})`);
  if (process.env.BILD) await ben.screenshot({ path: process.env.BILD + "wegstein-ankunft.png" });
  /* Heim-Teleport (Taste T): der Server setzt den Startpunkt der Waldmark – die Kampfwelt holt Anna nicht an die Linde zurück */
  await anna.mouse.click(640, 400); await anna.keyboard.press("t");
  await anna.waitForURL(/von=teleport/, { timeout: 60000 }).catch(() => {});
  await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen && window.EZK && window.EZK.bereit, null, { timeout: 120000 }).catch(() => {});
  await anna.waitForTimeout(8000); const h = await anna.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier }));
  check(Math.hypot(h.x - 6448, h.y - 6437.5) < 3 && h.hier === "waldmark", `Heim-Teleport: Anna steht am Startpunkt der Waldmark und bleibt dort (${h.x.toFixed(1)}, ${h.y.toFixed(1)}, ${h.hier})`);
  /* Freunde-Teleport: zu Ben an die Linde – auch hier setzt der Server die Stelle */
  const bo = await ben.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y }));
  let tp = false; for (let i = 0; i < 3 && !tp; i++) { await anna.click('button[aria-label="Freunde"]').catch(() => {}); tp = await anna.waitForSelector('[data-tp="Ben"]', { timeout: 15000 }).then(() => true, () => false); if (!tp) { await anna.keyboard.press("Escape"); await anna.waitForTimeout(1500); } }
  check(tp, "Freunde: „Teleport zu Ben“ angeboten");
  if (tp) { await anna.evaluate(() => [...document.querySelectorAll('[data-tp="Ben"]')].find((b) => b.offsetParent).click()); /* die Liste zeichnet sich laufend neu: direkt am Knopf auslösen */
    const da2 = await anna.waitForFunction(([x, y]) => { const W = window.EZW.welt3d; return W.hier === "weidenhain" && Math.hypot(W.ort.x - x, W.ort.y - y) < 3 && !W.gesperrt; }, [bo.x, bo.y], { timeout: 60000, polling: 250 }).then(() => true, () => false);
    await anna.waitForTimeout(8000); const f = await anna.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, hier: window.EZW.welt3d.hier }));
    { const fd = await figurDa(anna); check(fd.ok, "Freunde-Teleport: Annas eigene Figur ist bei Ben sichtbar (" + fd.grund + ")"); }
    check(da2 && Math.hypot(f.x - bo.x, f.y - bo.y) < 3, `Freunde-Teleport: Anna bei Ben (${bo.x.toFixed(1)}, ${bo.y.toFixed(1)}) und bleibt dort (${f.x.toFixed(1)}, ${f.y.toFixed(1)}, ${f.hier})`); }
  check(fehlerSeite.length === 0, "Keine Seitenfehler " + fehlerSeite.join(" | "));
} catch (e) { console.log("✗ Abbruch: " + e.message + " @ " + (e.stack || "").split("\n").find((z) => z.includes("wegstein-ui"))); fehler++; }
clearInterval(wach); await br.close(); srv.kill(); sb.close();
console.log(fehler ? `${fehler} Fehler` : "Wegstein mit zwei Browsern: alles in Ordnung"); process.exit(fehler ? 1 : 0);
