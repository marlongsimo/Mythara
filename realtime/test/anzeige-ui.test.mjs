/* Anzeige im Spiel (25.11.2026): Gegner-Level in OSRS-Farben, Aktionstext oben mittig („Angreifen: Bandit“, „Fällen: Eiche“), Menü-Schalter „Dächer immer ausblenden“.
   Aufruf: node test/anzeige-ui.test.mjs (BILD=pfad/ für Fotos). Gerüst aus quest03-ui.test.mjs (Quest 03 im Spiel, Gerüst aus holz-ui.test.mjs): Anna im Nordwald zwischen Förster Hartwig, dem Baum des Waldgottes und dem Waldstein.
   Förster sichtbar mit „!“ (Quest verfolgt), Antippen → „Mit Hartwig sprechen“, Baum und Stein stehen da. Aufruf: node test/quest03-ui.test.mjs (BILD=pfad/ für Fotos)
   Herkunft des Gerüsts: Holzfällerei im Spiel (Browser, echter Spielserver, nachgebildete Supabase; Grundgerüst aus bank-ui.test.mjs): Anna steht auf der Lichtung südlich der Waldmark,
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
  await ctx.addInitScript(() => { const t = setInterval(() => { const f = window.EZ_UNTAETIG; if (f) { f(-864e5); clearInterval(t); } }, 200); }); /* wach halten (#109): mit ?server= läuft der Untätigkeitswächter nicht, die letzte Eingabe bliebe beim Laden stehen – nach 70 s kein Lebenszeichen „da“ mehr, und der Server meldet nach 5½ Minuten ab. Unter Last dauert der Test länger. */ await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_quest_verfolgt", "nordwald_waldsaebel"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6536, 6583, "waldweg"]); anna.setDefaultTimeout(90000);
  await anna.goto(B + S + "&vorwaermen=0"); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForTimeout(3000);
  const sichtbar = await anna.evaluate(() => [...document.querySelectorAll(".ez-name3d:not(.boden)")].filter((e) => !e.hidden && e.getBoundingClientRect().width > 0).map((e) => e.textContent));
  check(sichtbar.length === 0, "Keine Namensschilder über Figuren (" + sichtbar.slice(0, 3).join(", ") + ")");
  let menueLv = null;
  const balken = () => anna.evaluate(() => [...document.querySelectorAll(".ez-balken3d")].filter((e) => !e.hidden && e.getBoundingClientRect().width > 0 && !e.classList.contains("eigen")).length);
  { let n = 1; for (let i = 0; i < 10 && n; i++) { n = await balken(); if (n) await anna.waitForTimeout(300); } check(n === 0, "Gegner außerhalb des Kampfes: kein Lebensbalken"); } /* beim Aufbau kurz sichtbar möglich */
  /* #66: Lebensbalken anderer Spieler nur im Kampf – Ben kommt dazu und steht nur herum */
  const ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6537, 6583, "waldweg"]); ben.setDefaultTimeout(90000); await ben.goto(B + S + "&vorwaermen=0"); await ben.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  const benBalken = () => anna.evaluate(() => { const K = window.EZK; return [...K.figuren.values()].filter((g) => g.held && !g.tot).map((g) => { const b = K.bilder.get(g); return b ? !b.lb.hidden : null; }); });
  await anna.waitForFunction(() => [...window.EZK.figuren.values()].some((g) => g.held && !g.tot), null, { timeout: 30000 }).catch(() => {}); await anna.waitForTimeout(5000);
  { const bb = await benBalken(); check(bb.length >= 1 && bb.every((x) => x === false), "Mitspieler außerhalb des Kampfes: nur Name, kein Lebensbalken " + JSON.stringify(bb)); }
  /* die Anzeige oben leuchtet nur 2,2 s – unter Last (~2 s je Abfrage) verpasst man sie: das Aufleuchten mitschreiben (#109) */
  for (const q of [anna, ben]) await q.evaluate(() => { window.__tat = null; new MutationObserver(() => { const e = document.getElementById("ez-tat"); if (e && e.classList.contains("an")) window.__tat = { t: e.textContent, an: true }; }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"], characterData: true }); });
  /* Angreifen per Rechtsklick → Anzeige oben */
  for (let v = 0; v < 3; v++) { const ziel = await anna.evaluate(() => { const W = window.EZW.welt3d, K = window.EZK; const f = [...K.figuren.entries()].find(([, g]) => !g.held && !g.tot); if (!f) return null; const x = K.zone.x0 + f[1].x, y = K.zone.y0 + f[1].y; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + 0.9, y); });
    if (ziel) { await anna.mouse.click(ziel.x, ziel.y, { button: "right" }); await anna.waitForTimeout(400); if (!menueLv && process.env.BILD) await anna.screenshot({ path: process.env.BILD + "menue-level.png" }); if (!menueLv) menueLv = await anna.evaluate(() => { const k = [...document.querySelectorAll(".ez-aktionen .kopf")].find((e) => e.querySelector(".lv")); return k ? { t: k.textContent, c: getComputedStyle(k.querySelector(".lv")).color } : null; }); await anna.click('.ez-aktionen button:has-text("Angreifen")', { force: true, timeout: 20000 }) /* unter Last braucht der Klick länger (#109) */.catch(() => {}); await anna.waitForTimeout(300); }
    if (await anna.evaluate(() => Boolean(window.__tat))) break; await anna.keyboard.press("Escape"); }
  const tat = await anna.evaluate(() => window.__tat || null);
  check(tat && tat.an && /^Angreifen: Bandit/.test(tat.t), "Oben mittig: " + JSON.stringify(tat));
  await ben.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && [...window.EZK.figuren.values()].some((g) => !g.held && !g.tot), null, { timeout: 120000, polling: 1000 }).catch(() => {}); /* Bens Kampf muss bereit sein (unter Last dauert das) */
  /* Ben greift ebenfalls an (direkt über seine Verbindung; das Menü prüft der Test bei Anna) → Anna sieht seinen Lebensbalken */
  { const annasZiel = await anna.evaluate(() => (window.EZK.z && window.EZK.z.ich && window.EZK.z.ich.zielId) || 0);
    for (let v = 0; v < 20; v++) { const ok = await ben.evaluate((annasZiel) => { const K = window.EZK, W = window.EZW.welt3d; if (K.z && K.z.ich && K.z.ich.zielId) return true;
        const ox = W.ort.x, oy = W.ort.y, frei = [...K.figuren.entries()].filter(([id, g]) => !g.held && !g.tot && id !== annasZiel).sort((a, b) => Math.hypot(K.zone.x0 + a[1].x - ox, K.zone.y0 + a[1].y - oy) - Math.hypot(K.zone.x0 + b[1].x - ox, K.zone.y0 + b[1].y - oy));
        if (frei[0]) K.netz.sende({ t: "ziel", id: frei[0][0] }); return false; }, annasZiel); if (ok) break; await ben.waitForTimeout(500); } }
  { let bb = []; for (let i = 0; i < 40 && !bb.some((x) => x === true); i++) { await anna.waitForTimeout(500); bb = await benBalken(); }
    check(bb.some((x) => x === true), "Mitspieler im Kampf: Lebensbalken sichtbar " + JSON.stringify(bb)); }
  check(menueLv && /Bandit \(Level 1\)/.test(menueLv.t) && /rgb\(\d+, 255, 0\)/.test(menueLv.c), "Gedrückt halten / Rechtsklick: „Bandit (Level 1)“, Level grün (leichter als Anna): " + JSON.stringify(menueLv));
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "anzeige-angreifen.png" });
  check(await anna.evaluate(() => { const W = window.EZW.welt3d; return typeof W.ausfuehren === "function"; }), "3D-Welt bereit");
  await anna.evaluate(() => { const W = window.EZW.welt3d; W.ausfuehren({ x: W.ort.x, y: W.ort.y, text: "Eiche fällen", tat: () => {}, da: () => true }, () => {}); });
  check(await anna.evaluate(() => document.getElementById("ez-tat").textContent) === "Fällen: Eiche", "„Eiche fällen“ → „Fällen: Eiche“");
  await anna.evaluate(() => { const W = window.EZW.welt3d; W.ausfuehren({ x: W.ort.x, y: W.ort.y, text: "Mit Hartwig sprechen", tat: () => {}, da: () => true }, () => {}); });
  check(await anna.evaluate(() => document.getElementById("ez-tat").textContent) === "Sprechen: Hartwig", "„Mit Hartwig sprechen“ → „Sprechen: Hartwig“");
  /* Dächer-Schalter im Menü */
  const vorher = await anna.evaluate(() => localStorage.getItem("ez_daecher_aus"));
  await anna.evaluate(() => { const b = [...document.querySelectorAll("button, [role=button]")].find((x) => /Menü|Einstellungen/.test(x.getAttribute("aria-label") || x.title || "")); if (b) b.click(); });
  await anna.waitForSelector('#ez-konto [data-t="daecher"]', { timeout: 8000 }).catch(() => {});
  const knopf = await anna.$('#ez-konto [data-t="daecher"]'); check(Boolean(knopf), "Menü: Schalter „Dächer immer ausblenden“ ist da");
  if (knopf) { await knopf.click(); await anna.waitForTimeout(400); check(await anna.evaluate(() => localStorage.getItem("ez_daecher_aus")) === "1" && await knopf.getAttribute("aria-checked") === "true", "Eingeschaltet (gemerkt, Schalter an)");
    if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "anzeige-menue.png" });
    await knopf.click(); await anna.waitForTimeout(200); check(await anna.evaluate(() => localStorage.getItem("ez_daecher_aus")) === "0", "Wieder aus"); }
  /* Welt wechseln: Fenster mit „Riftmere 1“ (aktuell) und Spielerzahl; kurz nach dem Kampf der Hinweis auf die Wartezeit */
  const wk = await anna.$('#ez-konto [data-t="welt"]'); check(Boolean(wk) && /Riftmere 1/.test(await wk.textContent()), "Einstellungen: „Welt · Beta ›“");
  if (wk) { await anna.click('#ez-konto [data-t="welt"]', { timeout: 30000 }).catch(() => {}); /* über den Selektor: der gemerkte Knopf kann inzwischen neu gezeichnet sein (#109) */ await anna.waitForSelector("#ez-konto .weltliste", { timeout: 30000 }).catch(() => {}); await anna.waitForFunction(() => /\d+ online/.test((document.querySelector("#ez-konto .weltzeile") || {}).textContent || ""), null, { timeout: 30000 }).catch(() => {}); /* unter Last (#109) */
    const z = await anna.evaluate(() => [...document.querySelectorAll("#ez-konto .weltzeile")].map((b) => b.textContent.replace(/\s+/g, " ").trim()));
    check(z.length === 1 && /Riftmere 1/.test(z[0]) && /aktuell/.test(z[0]) && /\d+ online/.test(z[0]), "Weltenfenster: " + z.join(" | "));
    const note = await anna.evaluate(() => document.querySelector("#ez-konto .weltnote").textContent); check(/Kampf: wechseln erst in \d+ s|Weitere Welten folgen/.test(note), "Hinweis: " + note);
    if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "welten-fenster.png" });
    await anna.click('#ez-konto [data-w="zurueck"]'); await anna.waitForTimeout(200); check(Boolean(await anna.$('#ez-konto [data-t="daecher"]')), "Zurück zu den Einstellungen"); }
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-1500));
console.log(fehler ? fehler + " Fehler" : "Anzeige im Spiel: alles in Ordnung"); process.exit(fehler ? 1 : 0);
