/* Quest 01 im Browser (3D-Welt, echter Spielserver, nachgebildete Supabase): Jori spricht Anna beim ersten Besuch an, Quest-Tab zeigt den Auftrag; Ben steht an der Sperre, Raban lässt ihn durch, für Anna bleibt sie zu. Aufruf: node test/quest01-ui.test.mjs */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
const T0 = Date.now(); let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t + (process.env.ZEIT ? ` [${((Date.now() - T0) / 1000).toFixed(0)} s]` : "")); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, quests: {} }, "00000000-0000-0000-0000-00000000b002": { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, quests: { die_gesperrte_strasse: { s: "bestaetigt" } } } }, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss") { const a = JSON.parse(b); const H = HELD[a.p_user]; if ((H.quests[a.p_quest] || {}).s === "fertig") return send(200, false); H.quests[a.p_quest] = { s: "fertig" }; return send(200, true); }
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
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6438.5, 6429.5, "waldmark"]); /* vor dem Rathaus, gut 20 Felder von Joris Platz */
  await anna.goto(B + S); await bereit(anna).catch(() => {}); await anna.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  /* Gespräch wie die klassische Chatbox: eine Aussage nach der anderen, dann die Antworten */
  const offen = (p) => p.evaluate(() => { const d = document.getElementById("ez-gespraech"); return d && d.offsetHeight > 0 ? { passt: [...d.querySelectorAll(".antworten button")].every((b) => b.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom + 0.5), art: d.className.split(" ")[0], name: (d.querySelector(".name") || {}).textContent || "", text: (d.querySelector(".text") || {}).textContent || "", bild: !!(d.querySelector(".bild") || {}).src, antworten: [...d.querySelectorAll(".antworten button")].map((b) => b.dataset.a) } : null; });
  const bisWahl = async (p, max = 12) => { const gesehen = []; for (let i = 0; i < max; i++) { const o = await offen(p); if (!o) return { gesehen, o: null }; if (o.art === "wahl") return { gesehen, o }; gesehen.push(o); await p.keyboard.press(" "); await p.waitForTimeout(250); } return { gesehen, o: await offen(p) }; };
  /* Jori läuft auf Anna zu und spricht sie an (nur sie) */
  await anna.waitForFunction(() => { const d = document.getElementById("ez-gespraech"); return d && !d.hidden; }, null, { timeout: 60000 }).catch(() => {});
  await anna.waitForTimeout(1500); const o0 = await offen(anna); if (BILD) await anna.screenshot({ path: BILD + "quest-jori.png" });
  { const L = await anna.evaluate(() => { const g = document.getElementById("ez-gespraech").getBoundingClientRect(), c = document.querySelector(".ez-chat").getBoundingClientRect(); return { dx: Math.abs(g.left - c.left), dy: Math.abs(g.top - c.top), dw: Math.abs(g.width - c.width) }; });
    check(L.dx < 2 && L.dy < 2 && L.dw < 2, `Das Gespräch liegt genau über dem Chatfenster (${JSON.stringify(L)})`); }
  check(o0 && o0.art === "npc" && o0.name === "Jori" && /Bürgermeister braucht deine Hilfe/.test(o0.text) && o0.bild, `Jori läuft auf Anna zu und spricht sie an – mit Kopfbild links (${JSON.stringify(o0)})`);
  { const { gesehen, o } = await bisWahl(anna); if (BILD) await anna.screenshot({ path: BILD + "quest-wahl.png" });
    check(gesehen.some((g) => g.art === "ich" && g.name === "Du") && o && o.antworten.includes("annehmen") && o.passt, `Aussage für Aussage (${gesehen.map((g) => g.name).join(" → ")}), dann „Wähle eine Antwort“: ${o && o.antworten.join(", ")}`); }
  await anna.click('#ez-gespraech [data-a="annehmen"]'); await anna.waitForTimeout(800);
  { const a = await offen(anna); check(a && a.art === "ich", "Die gewählte Antwort sagt der eigene Held (Bildnis rechts)"); if (BILD) await anna.screenshot({ path: BILD + "quest-ich.png" }); }
  await anna.keyboard.press(" "); await anna.waitForTimeout(500);
  { const a = await offen(anna); check(a && a.name === "Jori" && /Rathaus/.test(a.text), `Jori: „${a && a.text}“`); }
  await anna.keyboard.press(" "); await anna.waitForTimeout(400); check(!(await offen(anna)), "Nach der letzten Aussage schließt sich das Gespräch");
  await anna.click('#ez-leiste [data-l="quests"]'); await anna.waitForTimeout(300);
  { const z = await anna.evaluate(() => { const b = document.querySelector("#ez-queststab .qzeile"); return b ? { text: b.textContent, klasse: b.className, zeilen: Math.round(b.getBoundingClientRect().height / parseFloat(getComputedStyle(b).lineHeight || "20")) <= 2, hell: getComputedStyle(b).color } : null; });
    check(z && z.text === "Die gesperrte Straße" && /aktiv/.test(z.klasse), `Quest-Tab: nur der Titel in einer Zeile, gestartet = dunkel mit heller Schrift (${JSON.stringify(z)})`); }
  await anna.click("#ez-queststab .qzeile"); await anna.waitForTimeout(400);
  { const d = await anna.evaluate(() => { const t = document.querySelector("#ez-konto .tafel.questinfo"); if (!t) return null; return { vor: /Voraussetzungen\s*Keine/.test(t.textContent), jetzt: (t.querySelector(".qschritte .jetzt") || {}).textContent || "", erledigt: t.querySelectorAll(".qschritte .erledigt").length, knopf: (t.querySelector("[data-qv]") || {}).textContent || "" }; });
    check(d && d.vor && /Bürgermeister von Waldmark braucht Hilfe/.test(d.jetzt) && d.erledigt === 0 && /Verfolgen/.test(d.knopf), `Kurz antippen: Details auf Pergament – Voraussetzungen, aktueller Schritt, „Verfolgen“ oben rechts (${JSON.stringify(d)})`); }
  if (BILD) await anna.screenshot({ path: BILD + "quest-details.png" });
  await anna.click("#ez-konto .tafel.questinfo [data-qv]"); await anna.waitForTimeout(500);
  check(await anna.evaluate(() => /Wird verfolgt/.test(document.querySelector("#ez-konto [data-qv]").textContent) && /verfolgt/.test(document.querySelector("#ez-queststab .qzeile").className)), "Verfolgen in den Details: Knopf „Wird verfolgt“, Zeile im Tab hell mit dunkler Schrift");
  await anna.keyboard.press("Escape"); await anna.waitForTimeout(300);
  await anna.click("#ez-queststab .qzeile", { button: "right" }); await anna.waitForTimeout(300);
  check(await anna.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent).join("|") === "📜Details öffnen|🧭Nicht mehr verfolgen"), "Lange drücken / Rechtsklick auf die Quest: „Details öffnen“ zuerst, dann Verfolgen");
  if (BILD) await anna.screenshot({ path: BILD + "quest-tab.png" }); await anna.keyboard.press("Escape"); await anna.waitForTimeout(500);
  { const P = await anna.evaluate(() => { const W = window.EZW.welt3d, q = W.quest, z = q.ziel(), p = q.pfeil; if (!p || !z) return null; const zum = Math.atan2(z.x - W.ort.x, z.y - W.ort.y), hin = Math.atan2(p.position.x - W.ort.x, p.position.z - W.ort.y);
      return { sichtbar: p.visible, ziel: [Math.round(z.x), Math.round(z.y)], abw: Math.abs(((zum - hin + 3 * Math.PI) % (2 * Math.PI)) - Math.PI), verfolgt: localStorage.getItem("ez_q1_verfolgen") }; });
    check(P && P.sichtbar && P.abw < 0.15 && P.verfolgt === "1", `Quest abgehakt: Pfeil am Helden zeigt zum Bürgermeister (${JSON.stringify(P)})`); }
  if (BILD) await anna.screenshot({ path: BILD + "quest-tab.png" }); await anna.click('#ez-leiste [data-l="quests"]');
  /* Hagan geht im Rathaus umher: sein Name schwebt nicht von weitem über dem Dach */
  await anna.evaluate(() => window.EZW.welt3d.versetzen(6450.5, 6440.5)); await anna.waitForTimeout(1500);
  check(await anna.evaluate(() => { const n = [...document.querySelectorAll(".ez-name3d.quest")].find((e) => e.textContent === "Hagan Voss"); return !!n && n.hidden; }), "Von weitem: kein Namensschild über dem Rathausdach");
  if (BILD) await anna.screenshot({ path: BILD + "quest-pfeil.png" });
  /* außer Reichweite (weit im Süden) kein !, in Reichweite (vor dem Rathaus) das ! */
  await anna.evaluate(() => window.EZW.welt3d.versetzen(6450.5, 6470)); await anna.waitForTimeout(2500);
  { const gelb = await anna.evaluate(() => { const c = document.querySelector("canvas.karte3d"); if (!c) return -1; const x = c.getContext("2d"), n = c.width, d = x.getImageData(0, 0, n, n).data; let k = 0;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { if (Math.hypot(i - n / 2, j - n / 2) > n / 3) continue; const o = (j * n + i) * 4; if (d[o] > 225 && d[o + 1] > 170 && d[o + 1] < 235 && d[o + 2] < 120) k++; } return k; });
    check(gelb < 6, `Ziel außer Reichweite der Minikarte: noch kein gelbes ! (${gelb} gelbe Bildpunkte)`); }
  await anna.evaluate(() => window.EZW.welt3d.versetzen(6446.5, 6436.5));
  await anna.waitForFunction(() => { const c = document.querySelector("canvas.karte3d"); if (!c) return false; const n = c.width, d = c.getContext("2d").getImageData(0, 0, n, n).data; let k = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { if (Math.hypot(i - n / 2, j - n / 2) > n / 3) continue; const o = (j * n + i) * 4; if (d[o] > 225 && d[o + 1] > 170 && d[o + 1] < 235 && d[o + 2] < 120) k++; } return k > 25; }, null, { timeout: 45000, polling: 500 }).catch(() => {});
  { const gelb = await anna.evaluate(() => { const c = document.querySelector("canvas.karte3d"); if (!c) return -1; const x = c.getContext("2d"), n = c.width, d = x.getImageData(0, 0, n, n).data; let k = 0;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { if (Math.hypot(i - n / 2, j - n / 2) > n / 3) continue; const o = (j * n + i) * 4; if (d[o] > 225 && d[o + 1] > 170 && d[o + 1] < 235 && d[o + 2] < 120) k++; } return k; });
    check(gelb > 25, `In Reichweite: gelbes ! auf der Minikarte (${gelb} gelbe Bildpunkte)`); }
  await anna.evaluate(() => window.EZW.welt3d.versetzen(6450.5, 6440.5)); await anna.waitForTimeout(1500);
  /* Sprint: Umschalttaste, 2 Felder je Tick, die gelbe Leiste leert sich */
  { await anna.keyboard.press("Escape"); await anna.waitForFunction(() => { const d = document.getElementById("ez-gespraech"); return (!d || d.hidden) && !window.EZW.welt3d.gesperrt; }, null, { timeout: 15000, polling: 300 }).catch(() => {}); /* Jori kann gerade angesprochen haben */
    await anna.keyboard.press("Shift"); await anna.waitForFunction(() => window.EZW.welt3d.ausdauer.an, null, { timeout: 15000, polling: 300 }).catch(() => {}); const v = await anna.evaluate(() => { const W = window.EZW.welt3d; return { an: W.ausdauer.an, faktor: W.ausdauer.faktor, knopf: !!document.querySelector('[aria-label="Sprint"].an') }; });
    await anna.evaluate(() => window.EZW.welt3d.geheWeit(6450.5, 6470)); await anna.waitForFunction(() => window.EZW.welt3d.ausdauer.wert < 100, null, { timeout: 40000 }).catch(() => {}); await anna.waitForTimeout(300);
    const n = await anna.evaluate(() => { const W = window.EZW.welt3d; return { wert: W.ausdauer.wert, gelb: (document.querySelector(".ez-boegen .voll.gelb") || {}).style?.strokeDasharray || "" }; });
    check(v.an && v.faktor === 2 && v.knopf && n.wert < 100 && /^\d/.test(n.gelb) && !n.gelb.startsWith("100"), `Sprint: Umschalt schaltet ein (2 Felder je Tick, Knopf leuchtet), die gelbe Leiste sinkt (${n.wert.toFixed(0)} %, ${n.gelb})`);
    await anna.keyboard.press("Shift"); await anna.waitForFunction(() => !window.EZW.welt3d.ausdauer.an, null, { timeout: 15000, polling: 300 }).catch(() => {}); check(await anna.evaluate(() => !window.EZW.welt3d.ausdauer.an && window.EZW.welt3d.ausdauer.faktor === 1), "Nochmal Umschalt: Sprint aus"); }
  /* Felder und Schräge: Schritte von Feldmitte zu Feldmitte, 1 Feld je Tick, schräg wie gerade, angeklickte Wege über Feldmitten */
  { const r = await anna.evaluate(() => { const W = window.EZW.welt3d; W.ausdauer.setzen(false); W.halt(); W.schrittZiel = null; W.ort.x = 6450.5; W.ort.y = 6440.5; const o = W.ort, aus = [];
      for (const [dx, dy] of [[1, 0], [1, 1], [-1, 0]]) { const x0 = o.x, y0 = o.y; W.feldSchritte(0.5, [dx, dy]); aus.push([+(o.x - x0).toFixed(3), +(o.y - y0).toFixed(3)]); }
      const halb = (() => { const x0 = o.x; W.feldSchritte(0.25, [1, 0]); const a = o.x - x0; W.feldSchritte(0.25, null); return [+a.toFixed(3), +(o.x - x0).toFixed(3)]; })();
      W.gehe(o.x + 5, o.y + 3); const mitten = W.pfad.every((p) => Math.abs(p.x % 1 - 0.5) < 1e-6 && Math.abs(p.y % 1 - 0.5) < 1e-6), n = W.pfad.length; W.halt(); W.schrittZiel = null; return { aus, halb, mitten, n }; });
    check(JSON.stringify(r.aus) === "[[1,0],[1,1],[-1,0]]" && JSON.stringify(r.halb) === "[0.5,1]" && r.mitten && r.n === 5,
      `Feldschritte in der offenen Welt: je 0,5 s ein Feld (gerade ${JSON.stringify(r.aus[0])}, schräg ${JSON.stringify(r.aus[1])}), ein angefangener Schritt wird beendet (${JSON.stringify(r.halb)}), Klickweg über ${r.n} Feldmitten (5 schräg/gerade für 5×3)`); }
  /* Ausrüstungs-Tab mit Auswahl (auf dem Handy war der Kopf abgeschnitten): Kopf mit „i“ ganz sichtbar, nichts überlappt */
  await anna.click('#ez-leiste [data-l="ausruestung"]'); await anna.waitForTimeout(300); await anna.click('#ez-ausruestungtab .ifeld.voll[data-wo="waffe"]', { button: 'right' }); await anna.waitForTimeout(300);
  { const L = await anna.evaluate(() => { const m = document.querySelector(".ez-aktionen"); if (!m) return null; const r = m.getBoundingClientRect(), b = [...m.querySelectorAll("button")].map((x) => x.textContent);
      return { erst: b[0], alle: b, drin: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; });
    check(L && L.erst === "⤵️Ablegen" && L.drin, `Ausrüstung → Schwert: Aktionsmenü an der Klickstelle, „Ablegen“ zuerst (${JSON.stringify(L)})`); }
  if (BILD) await anna.screenshot({ path: BILD + "ausruestung-tab.png" }); await anna.keyboard.press("Escape"); await anna.click('#ez-leiste [data-l="ausruestung"]');
  /* Ben steht vor der Sperre (Stand: bestätigt); für ihn ist sie noch zu, nach dem Gespräch mit Raban offen. Anna bleibt draußen. */
  const ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6446.5, 6642.5, "waldweg"]);
  await ben.goto(B + S); await ben.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen && window.EZW.welt3d.quest, null, { timeout: 120000 });
  await ben.waitForTimeout(3000);
  const durch = (p) => p.evaluate(() => { const W = window.EZW.welt3d; return W.raster.weg({ x: 6446.5, y: 6643 }, { x: 6446.5, y: 6655 }, 0.3).length > 0; });
  const kreuzung = (p) => p.evaluate(() => { const W = window.EZW.welt3d; return W.raster.weg({ x: 6443.5, y: 6608 }, { x: 6443.5, y: 6622 }, 0.3).length > 0; });
  check(await ben.evaluate(() => Math.abs(window.EZW.welt3d.ort.y - 6642.5) < 3) && !(await durch(ben)) && await ben.evaluate(() => window.EZW.welt3d.quest.sperreZu), "Ben steht vor der Straßensperre: kein Weg nach Süden");
  check(await kreuzung(ben), "Die Kreuzung im Kreuzwald ist offen – Ben ist auf dem Weg zu den Wachen (sonst käme er nicht zu ihnen)");
  if (BILD) await ben.screenshot({ path: BILD + "quest-sperre.png", timeout: 90000 }).catch(() => {});
  { const q = await ben.evaluate(() => { const W = window.EZW.welt3d; return W.motor.bildschirm(6442.5, W.motor.hoehe(6442.5, 6643.5) + 1, 6643.5); }); await ben.mouse.click(q.x, q.y, { button: "right" }); await ben.waitForTimeout(400);
    const m = await ben.evaluate(() => [...document.querySelectorAll(".ez-aktionen button")].map((b) => b.textContent)); check(m[0] === "💬Sprechen", `Rechtsklick auf Raban (ganze Figur, Brusthöhe): ${JSON.stringify(m)}`);
    await ben.click('.ez-aktionen button:has-text("Sprechen")', { force: true }); } /* kurz antippen läuft nur hin; reden über lange drücken / Rechtsklick */
  await ben.waitForFunction(() => { const d = document.getElementById("ez-gespraech"); return d && d.offsetHeight > 0; }, null, { timeout: 60000 }).catch(() => {});
  { const { gesehen, o } = await bisWahl(ben); check(gesehen.some((g) => /Bestätigung/.test(g.text)) && o && o.antworten.includes("durch"), "Raban: „Der Bote aus Waldmark hat uns die Bestätigung gebracht“ – Antwort „Nach Weidenhain weitergehen“");
    if (o) await ben.keyboard.press(String(o.antworten.indexOf("durch") + 1)); }
  await ben.waitForFunction(() => !window.EZW.welt3d.quest.sperreZu, null, { timeout: 8000 }).catch(() => {}); await ben.waitForTimeout(500);
  check(await durch(ben) && await kreuzung(ben) && await ben.evaluate(() => !window.EZW.welt3d.quest.sperreZu), "Danach sind beide Wege für Ben frei (Baumstämme weg, Gehraster offen)");
  if (BILD) await ben.screenshot({ path: BILD + "quest-offen.png", timeout: 90000 }).catch(() => {});
  check(await anna.evaluate(() => window.EZW.welt3d.quest.sperreZu), "Für Anna bleibt die Sperre zu");
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | ").slice(0, 300));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? fehler + " Fehler" : "Quest 01 in der 3D-Welt: alles in Ordnung"); process.exit(fehler ? 1 : 0);
