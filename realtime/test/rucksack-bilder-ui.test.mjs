/* #166: Rucksackbilder auch nach einem gescheiterten Vorladen – während des Einloggens sind die Bilder nicht erreichbar (Handy: Netz überlastet,
   Zeitüberschreitung), danach wieder. Öffnet man dann den Rucksack, sind alle Bilder da (vorher blieb der Fehlschlag gemerkt: nur die Mengen). Gerüst aus inventar-ui.test.mjs.
   Aufruf: node test/rucksack-bilder-ui.test.mjs */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium, webkit, devices } = require("playwright"), WK = Boolean(process.env.WEBKIT); /* WEBKIT=1: WebKit mit iPhone-Profil (wie Safari/App auf dem iPhone, #188) */
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
/* #166: kein Gegenstand wird mehr zur Laufzeit gezeichnet (symbol) – jeder hat ein festes Bild, und die Datei gibt es */
{ const { build } = await import("esbuild"), AUS = new URL("./gegenstaende.gebaut.mjs", import.meta.url).pathname;
  await build({ entryPoints: [new URL("../shared/gegenstaende.ts", import.meta.url).pathname], bundle: true, platform: "node", format: "esm", outfile: AUS, logLevel: "error" });
  const { GEGENSTAENDE } = await import(AUS); require("fs").unlinkSync(AUS); const alle = Object.values(GEGENSTAENDE);
  const mitSymbol = alle.filter((G) => G.symbol).map((G) => G.id), ohneBild = alle.filter((G) => !G.bild).map((G) => G.id), ohneDatei = alle.filter((G) => G.bild && !require("fs").existsSync(new URL("../../" + G.bild, import.meta.url))).map((G) => G.id);
  check(mitSymbol.length === 0 && ohneBild.length === 0, `Kein Gegenstand hat symbol ohne bild (${mitSymbol.length ? "symbol: " + mitSymbol.join(", ") : ""}${ohneBild.length ? " ohne bild: " + ohneBild.join(", ") : ""}${mitSymbol.length + ohneBild.length ? "" : alle.length + " Gegenstände"})`);
  check(ohneDatei.length === 0, `Jedes bild gibt es als Datei (${ohneDatei.join(", ") || "alle da"})`); }
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: ["jagdbogen", "hammer", "stamm_eiche", "lederpanzer", "spitzhacke_training", "holzbeil_training", "brot", { g: "splitter", n: 12 }], v: 2 }, quests: { die_gesperrte_strasse: { s: "fertig" } } } } /* Quest 1 erledigt: Jori läuft nicht herbei und stellt sich nicht auf den Beutel */, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
HELD["00000000-0000-0000-0000-00000000b002"] = JSON.parse(JSON.stringify(HELD["00000000-0000-0000-0000-00000000a001"])); /* #188: Ben meldet sich frisch an (eigener Browser-Zwischenspeicher) */
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
const br = WK ? await webkit.launch() : await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&aufloesung=0.5&vorwaermen=0&server=ws://localhost:8785" /* langsame Testrechner (SwiftShader): halbe Auflösung, nicht vorwärmen – sonst kommt die Antwort des Servers erst nach 10–17 s an (#136) */, B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext(WK ? { ...devices["iPhone 13 landscape"] } : { viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(() => { const t = setInterval(() => { const f = window.EZ_UNTAETIG; if (f) { f(-864e5); clearInterval(t); } }, 200); }); /* wach halten (#109): mit ?server= läuft der Untätigkeitswächter nicht, die letzte Eingabe bliebe beim Laden stehen – nach 70 s kein Lebenszeichen „da“ mehr, und der Server meldet nach 5½ Minuten ab. Unter Last dauert der Test länger. */ await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6448, 6440, "waldmark"]); anna.setDefaultTimeout(90000); const weg = [];
  anna.on("requestfailed", (r) => weg.push("FAIL " + r.url().slice(-80))); anna.on("response", (r) => { if (r.status() >= 400) weg.push(r.status() + " " + r.url().slice(-80)); });
  anna.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") weg.push("CONSOLE " + m.text().slice(0, 160)); });
  await anna.addInitScript(() => { const gc = HTMLCanvasElement.prototype.getContext; window.__gl = 0; HTMLCanvasElement.prototype.getContext = function (k, o) { if (/webgl/.test(k)) window.__gl++; return gc.call(this, k, o); }; });
  let gesperrt = true, langsam = false; await anna.context().route(/img\/(objekte3d\/|figuren-fabrik\/held\.[a-z]+\/editor|figuren-echt3d\/base[a-z]+3d\.teile)/, async (r) => { const u = r.request().url(); if (gesperrt && (!/objekte3d\//.test(u) || /\.(webp|png)$/.test(u))) return r.abort("failed"); if (langsam && /\.(webp|png)$/.test(r.request().url())) await new Promise((w) => setTimeout(w, 6000)); return r.fallback(); });
  await anna.goto(B + S + "&vorwaermen=0"); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "null"); return i && i.rucksack && i.rucksack.length; }, null, { timeout: 30000 }).catch(() => {});
  await anna.waitForTimeout(8000); gesperrt = false; langsam = true; /* das Vorladen beim Einloggen ist gescheitert; jetzt ist das Netz wieder da, aber langsam (jedes Bild 6 s) */
  const gl0 = await anna.evaluate(() => window.__gl || 0);
  await anna.click('#ez-leiste [data-l="rucksack"]');
  /* #166 (Nutzer): Rucksack öffnen, während die Bilder noch laden – danach müssen sie ohne weitere Aktion erscheinen (vorher blieben die Fächer leer, bis man etwas anlegte) */
  const fertig = new Set(); anna.on("requestfinished", (q) => fertig.add(q.url())); /* Bild beim Browser angekommen (performance-Puffer ist bei dieser Seite längst voll) */
  /* #190: jedes Fach ist ein echtes <img> – geladen heißt: complete und naturalWidth > 0 */
  const geladen = () => anna.evaluate(() => [...document.querySelectorAll("#ez-rucksacktab [data-bild]")].map((c) => ({ g: c.dataset.bild, img: c.tagName === "IMG", da: c.tagName === "IMG" && c.complete && c.naturalWidth > 0 })));
  const frueh = await geladen(); await anna.waitForTimeout(12000); const spaet = await geladen(); langsam = false;
  check(frueh.length >= 8 && frueh.filter((x) => x.da).length < frueh.length, `Beim Öffnen laden die Bilder noch (${frueh.filter((x) => x.da).length}/${frueh.length} da)`);
  check(spaet.length >= 8 && spaet.every((x) => x.da), `Ohne weitere Aktion erscheinen danach alle Bilder im Rucksack (${spaet.filter((x) => !x.da).map((x) => x.g).join(", ") || spaet.length + " Fächer"})`);
  check(spaet.every((x) => x.img), `Jedes Rucksackfach ist ein echtes <img> (keine Leinwand, kein Hintergrundbild)`);
  /* #166/#190: je Gegenstand ein festes Bild mit absoluter Adresse, eager + sync (kein Zeichnen zur Laufzeit, kein WebGL); es lädt */
  const r = await anna.evaluate(() => [...document.querySelectorAll("#ez-rucksacktab img.dbild")].map((c) => { const u = c.dataset.url || "";
    const ok = /^https?:\/\/[^/]+\/img\/.+\.(webp|png)$/.test(u) && c.src.startsWith(u) && c.loading === "eager" && c.decoding === "async" && !c.style.backgroundImage && c.complete && c.naturalWidth > 0;
    return c.dataset.bild + ":" + (ok ? 1 : 0) + ":" + u; }));
  /* #188 (iPhone): geladen allein reicht nicht – das Bild muss das Fach füllen und in der Fachmitte oben liegen */
  const gross = await anna.evaluate(() => [...document.querySelectorAll("#ez-rucksacktab img.dbild")].map((im) => { const b = im.getBoundingClientRect(), f = im.parentElement.getBoundingClientRect(), o = document.elementFromPoint(f.x + f.width / 2, f.y + f.height / 2);
    const m = Math.min(f.width, f.height) * 0.6; return { g: im.dataset.bild, ok: b.width >= m && b.height >= m && (o === im || im.contains(o)), t: `${Math.round(b.width)}×${Math.round(b.height)} in ${Math.round(f.width)}×${Math.round(f.height)}` }; }));
  check(gross.length >= 8 && gross.every((x) => x.ok), `Jedes Rucksackbild füllt sein Fach und liegt oben (${gross.filter((x) => !x.ok).map((x) => x.g + " " + x.t).join(", ") || gross[0]?.t})`);
  const gl1 = await anna.evaluate(() => window.__gl || 0);
  const leer = r.filter((x) => x.split(":")[1] !== "1");
  check(gl1 === gl0, `Der Rucksack legt keine WebGL-Fläche an (${gl0} → ${gl1})`);
  check(r.length >= 8 && leer.length === 0, `Auch nach gescheitertem Vorladen hat jeder Gegenstand ein festes Bild mit echtem Pfad, das lädt (${leer.length ? "fehlt: " + leer.join(", ") : r.length + " Bilder"})`);
  /* #188 (Rückfall #166): frisch anmelden (leerer Zwischenspeicher), Rucksack öffnen, während die Bilder noch scheitern; danach ist das Netz wieder da –
     ohne weitere Aktion müssen alle Fächer ihr Bild zeigen (vorher stand die Adresse sofort im Stil, ein Fehlschlag wurde nie wiederholt) */
  { const ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6448, 6442, "waldmark"]); ben.setDefaultTimeout(90000); let zu = true; const fertigB = new Set();
    ben.on("requestfinished", (q) => fertigB.add(q.url()));
    await ben.context().route(/img\/objekte3d\/.+\.(webp|png)/, (r) => (zu ? r.abort("failed") : r.fallback()));
    await ben.goto(B + S + "&vorwaermen=0"); await ben.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
    await ben.waitForFunction(() => { const i = JSON.parse(localStorage.getItem("ez_inventar") || "null"); return i && i.rucksack && i.rucksack.length; }, null, { timeout: 30000 }).catch(() => {});
    await ben.click('#ez-leiste [data-l="rucksack"]'); await ben.waitForTimeout(3000); zu = false;
    const zeigt = () => ben.evaluate(() => [...document.querySelectorAll("#ez-rucksacktab [data-bild]")].map((c) => ({ g: c.dataset.bild, da: c.tagName === "IMG" && c.complete && c.naturalWidth > 0, r: /[?&]r=\d/.test(c.src || "") })));
    const vorher = await zeigt(); check(vorher.length >= 8 && vorher.every((x) => !x.da), `Solange das Netz die Bilder abweist, ist kein Fach geladen (${vorher.filter((x) => x.da).length}/${vorher.length})`);
    let f = await zeigt(); for (let i = 0; i < 30 && !(f.length && f.every((x) => x.da)); i++) { await ben.waitForTimeout(1000); f = await zeigt(); }
    check(f.length >= 8 && f.every((x) => x.da), `Frisch angemeldet, Rucksack offen während die Bilder scheitern: danach erscheinen alle ohne weitere Aktion (${f.filter((x) => !x.da).map((x) => x.g).join(", ") || f.length + " Fächer"})`);
    check(f.some((x) => x.r), `Gescheiterte Bilder werden neu gesetzt (src mit ?r=n)`);
    /* #190: Diagnose in den Einstellungen – „Bilder prüfen“ zählt geladene, gescheiterte und offene Bilder */
    await ben.click('#ez-leiste-r [data-l="einstellungen"]'); await ben.click('#ez-konto [data-t="bilder"]');
    const bericht = await ben.evaluate(() => ({ b: document.querySelector('#ez-konto [data-t="bilder"] b').textContent, p: (document.querySelector("#ez-konto .bilderbericht") || {}).textContent || "" }));
    const zahl = /(\d+) ok · (\d+) Fehler · (\d+) offen/.exec(bericht.b) || [];
    check(+zahl[1] >= 8 && zahl[2] === "0" && zahl[3] === "0" && /Alle Bilder geladen/.test(bericht.p), `„Bilder prüfen“ meldet alle Rucksackbilder geladen (${bericht.b} – ${bericht.p})`);
    /* und nennt die erste gescheiterte Adresse */
    await ben.evaluate(() => { const i = document.createElement("img"); i.className = "dbild"; i.dataset.status = "fehler"; i.src = location.origin + "/img/gibtsnicht.webp"; i.hidden = true; document.body.append(i); });
    await ben.waitForTimeout(500); await ben.click('#ez-konto [data-t="bilder"]');
    const b2 = await ben.evaluate(() => document.querySelector("#ez-konto .bilderbericht").textContent);
    check(/1 Fehler/.test(await ben.evaluate(() => document.querySelector('#ez-konto [data-t="bilder"] b').textContent)) && /gibtsnicht\.webp/.test(b2), `„Bilder prüfen“ nennt die erste fehlerhafte Adresse (${b2})`); }
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Rucksackbilder: alles in Ordnung"); process.exit(fehler ? 1 : 0);
