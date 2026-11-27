/*
 * Mythara – Holzfällerei Ende zu Ende (shared/holz.ts, server/src/holz.ts): echter Spielserver, nachgebildete Supabase, Welt-Verbindung.
 * Ohne Beil / zu weit / zu niedriges Level → abgelehnt; mit Trainings-Holzbeil an der Eiche: Hiebe im Takt, Stamm in den Rucksack, XP im Inventar (berufe),
 * Kernschlag (zwei Stämme, 50 % mehr XP), Weggehen bricht ab; ein gefällter Baum ist für alle ein Stumpf; Gäste dürfen nicht.
 * Lauf 1 mit HOLZ_FALL=0 (fällt nie) und HOLZ_KERN=1 (Kernschlag nach jedem Hieb), Lauf 2 mit HOLZ_FALL=100 (fällt beim ersten Stamm).
 * Aufruf: node test/holz-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module"; import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const roh = () => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } } });
const HELD = { [A]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: ["holzbeil_training"], v: 2 } }, [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 } } }, GESPEICHERT = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); GESPEICHERT.push(JSON.parse(JSON.stringify(a))); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  send(404, {}); }); }).listen(8794);
let srv, log = "";
const starten = async (env) => { srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8784", SUPABASE_URL: "http://localhost:8794", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", ...env }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200)); };
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8785".replace("8785", "8784") + "/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], holz: [], baeume: null, warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "holz") s.holz.push(m); if (m.t === "baeume") s.baeume = m.weg; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") } : { t: "anmeldung", gast: true })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).filter((x) => (typeof x === "string" ? x : x.g) === g).length;
const ST = JSON.parse(readFileSync("shared/holz_standorte.json", "utf8")).lichtungen.flatMap((l) => l.baeume).filter((b) => b.art !== "waldgott") /* ohne den Questbaum (Quest 03) */, EICHE = ST.find((b) => b.art === "eiche"), TANNE = ST.find((b) => b.art === "tanne");
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30);
const bei = async (s, b, d = 1.2) => { sende(s, { t: "pos", x: 0, y: 0, wx: b.x + d, wy: b.y }); await schlaf(150); };
const nein = async (s, id) => { s.holz = []; sende(s, { t: "holz", tat: "start", id }); return (await warte(s, (m) => m.t === "holz" && (m.tat === "nein" || m.tat === "start"))) || {}; };
try {
  /* die Sammelstellen der Welt (#142) zählen extra – ALT sind die Stellen von vorher */
  const NEU_IDS = new Set(JSON.parse(readFileSync("welt/sammelstellen.json", "utf8")).lichtungen.flatMap((g) => g.baeume.map((p) => p.id))), ALT = ST.filter((b) => !NEU_IDS.has(b.id));
  check(ALT.length === 33 && ALT.filter((b) => b.art === "linde_totholz").length === 1 && ALT.filter((b) => b.art === "eiche").length === 17 && ALT.filter((b) => b.art === "moorweide").length === 8, `33 Holzfäller-Bäume: 17 Eichen, 6 Tannen, 1 Eibe, 8 Moorweiden, 1 Linden-Totholz (B1) (${ALT.length}, dazu ${ST.length - ALT.length} Sammelstellen aus welt/sammelstellen.json, #142)`);
  await starten({ HOLZ_FALL: "0", HOLZ_KERN: "1" });
  const anna = await spieler(TA, EICHE.region), ben = await spieler(TB, EICHE.region); await warte(anna, (m) => m.t === "inventar"); await warte(ben, (m) => m.t === "inventar");
  await bei(ben, EICHE); check((await nein(ben, EICHE.id)).text === "Du brauchst ein Holzbeil.", "Ohne Beil: „Du brauchst ein Holzbeil.“");
  await bei(anna, EICHE, 6); check(/näher/.test((await nein(anna, EICHE.id)).text), "Zu weit weg: „Geh näher an den Baum.“");
  await bei(anna, TANNE); check(/Holzfällerei 10/.test((await nein(anna, TANNE.id)).text), "Tanne mit Level 1: „… brauchst du Holzfällerei 10.“");
  await bei(anna, EICHE); const st = await nein(anna, EICHE.id); check(st.tat === "start" && st.werkzeug === "holzbeil_training", "Eiche mit Trainings-Holzbeil: es geht los");
  const t0 = Date.now(); const hieb = await warte(anna, (m) => m.t === "holz" && m.tat === "hieb", 3500); check(hieb && Date.now() - t0 > 1200 /* unter Last kommt er knapp vor 1500 ms */, `Erster Hieb nach etwa 2 Sekunden (${Date.now() - t0} ms)`);
  const kern = await warte(anna, (m) => m.t === "holz" && m.tat === "kern", 6000); check(kern && kern.ms === 1500, "Kernschlag: die Adern glühen auf (1,5 s)");
  sende(anna, { t: "holz", tat: "kern" }); const k = await warte(anna, (m) => m.t === "holz" && m.tat === "stamm" && m.kern, 2000);
  check(k && k.n === 2 && k.xp === 75, `Kernschlag angetippt: zwei Eichenstämme und 50 % mehr XP (${k && k.n} Stämme, ${k && k.xp} XP)`);
  const normal = await warte(anna, (m) => m.t === "holz" && m.tat === "stamm" && !m.kern, 40000);
  check(normal && normal.n === 1 && normal.xp === 25, `Ein normaler Stamm: 25 XP (${normal && normal.xp})`); await schlaf(200);
  const xp = anna.inv.berufe && anna.inv.berufe.holzfaellerei; check(xp >= 100 && anzahl(anna, "stamm_eiche") >= 3, `Im Rucksack ${anzahl(anna, "stamm_eiche")} Eichenstämme, Holzfällerei-XP ${xp} (im Inventar, Feld „berufe“)`);
  const spl = anna.holz.filter((m) => m.tat === "stamm").reduce((n, m) => n + m.splitter, 0), splR = (anna.inv.rucksack || []).filter((x) => x.g === "splitter").reduce((n, x) => n + x.n, 0);
  check(spl === splR && anna.holz.filter((m) => m.tat === "stamm").every((m) => m.splitter === 0 || (m.splitter >= 5 && m.splitter <= 30)), `Splitter je Stamm 0 oder 5–15 (bisher ${spl}, im Rucksack ${splR})`);
  anna.holz = []; await bei(anna, EICHE, 8); await schlaf(400); const stop = anna.holz.find((m) => m.tat === "stop"); check(stop && stop.grund === "weg", "Weggegangen: das Fällen hört auf");
  await schlaf(1800); const gesp = GESPEICHERT[GESPEICHERT.length - 1]; check(gesp && gesp.p_inventar.berufe && gesp.p_inventar.berufe.holzfaellerei === xp, "Die XP sind gespeichert (rpg_held_inventar_setzen, berufe.holzfaellerei)");
  const gast = await spieler(null, EICHE.region); await schlaf(400); await bei(gast, EICHE); check(/Konto/.test((await nein(gast, EICHE.id)).text || ""), "Gast: Holzfällen nur mit Konto"); gast.ws.close();
  anna.ws.close(); ben.ws.close(); srv.kill(); await schlaf(400);
  /* Lauf 2: der Baum fällt beim ersten Stamm – Stumpf für alle */
  await starten({ HOLZ_FALL: "100", HOLZ_KERN: "0" });
  const a2 = await spieler(TA, EICHE.region), b2 = await spieler(TB, EICHE.region); await warte(a2, (m) => m.t === "inventar"); await schlaf(300);
  check(Array.isArray(b2.baeume) && b2.baeume.length === 0, "Beim Anmelden: Stand der Bäume (alle stehen)");
  await bei(a2, EICHE); await nein(a2, EICHE.id); const gefallen = await warte(b2, (m) => m.t === "baeume" && m.weg.some(([id]) => id === EICHE.id), 40000);
  check(gefallen && gefallen.weg.find(([id]) => id === EICHE.id)[1] <= 20, `Die Eiche fällt: Ben sieht den Stumpf (wächst in ${gefallen && gefallen.weg[0][1]} s nach)`);
  const s2 = a2.holz.find((m) => m.tat === "stop"); check(s2 && s2.grund === "gefallen", "Anna hört auf: „gefallen“");
  check(/Stumpf/.test((await nein(a2, EICHE.id)).text || ""), "Am Stumpf: „Hier steht nur noch ein Stumpf …“");
  check(a2.inv.berufe.holzfaellerei === xp + 25, `Nach dem Neustart weiter gezählt: ${a2.inv.berufe.holzfaellerei} XP`);
  a2.ws.close(); b2.ws.close();
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").slice(-20).join("\n"));
console.log(f ? f + " Fehler" : "Holzfällerei mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
