/*
 * Riftmere – Phase 4 Quest B3 „Fallobst“ Ende zu Ende: echter Spielserver, nachgebildete Supabase, echte Kampfwelt der Westmark.
 * Ida spielt B3 ganz (Spuren, fünf Späher, Karrenbrief vom Boden, Kisten, Gisbert, Othmar), danach Gisberts Äpfel. Tom (unter Heldenlevel 15) als Gegenprobe.
 * Aufruf: node test/b3-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUESTS, LAEDEN } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000b301", B = "00000000-0000-0000-0000-00000000b302";
const TA = "tok_ida__" + "x".repeat(30), TB = "tok_tom__" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B }, NAME = { [A]: "Ida", [B]: "Tom" };
const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const STARK = 11079266; /* Level 99 */
const HELD = {
  /* Ida: Heldenlevel weit über 15, Quest 1 fertig – erfüllt B3 */
  [A]: { ...roh(), skill_geschick: STARK, skill_staerke: STARK, skill_lp: STARK, skill_defense: STARK, inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 50 }], v: 2 } },
  /* Tom: frisch – Heldenlevel unter 15 */
  [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 20 }], v: 2 } } };
const SETZEN = [], ABSCHLUSS = [], GUTSCHRIFT = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_skill_gutschrift") { const a = JSON.parse(b); GUTSCHRIFT.push(a); return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_lp_setzen") { const a = JSON.parse(b); HELD[a.p_user].lp_stand = a.p_lp === null ? null : { lp: a.p_lp, z: Date.now() / 1000 }; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); SETZEN.push(a); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss_v2") { const a = JSON.parse(b); const H = HELD[a.p_user]; if ((H.quests[a.p_quest] || {}).s === "fertig") return send(200, false); H.quests[a.p_quest] = { s: "fertig" }; H.questpunkte = (H.questpunkte || 0) + (a.p_punkte || 0); ABSCHLUSS.push(a); return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  send(404, {}); }); }).listen(8792);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8777", SUPABASE_URL: "http://localhost:8792", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  BUCHUNG_RUHE_MS: "500" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8777/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
  s = { ws, b: {}, punkte: 0, inv: null, chat: [], texte: [], dialoge: [], boden: [], fisch: [], wurm: [], handwerk: [], getrunken: [], ruht: new Set(), wruht: new Set(), warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") { s.b = m.b || {}; s.punkte = m.punkte; } if (m.t === "inventar") s.inv = m.inv; if (m.t === "boden") s.boden = m.liste; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); for (const k of ["fisch", "wurm", "handwerk", "getrunken"]) if (m.t === k) s[k].push(m); if (m.t === "fanggruende") s.ruht = new Set((m.weg || []).map((w) => w[0])); if (m.t === "wurmacker") s.wruht = new Set((m.weg || []).map((w) => w[0]));
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const faecher = (s, g) => (s.inv.rucksack || []).filter((x) => (typeof x === "string" ? x : x.g) === g).length;
const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await schlaf(150); };
const rede = async (s, npc) => { sende(s, { t: "rede", npc }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, npc, a) => { sende(s, { t: "antwort", npc, a }); const d = await warte(s, (m) => m.t === "dialog");
  /* #77: abgeschlossen – der Lohn wartet aufs Abholen („Okay“ im Abschlussfenster); hier gleich abholen, Lohn wie früher an der Antwort */
  if (d && d.abholen) { sende(s, { t: "abholen", id: d.abholen }); const g = await warte(s, (m) => m.t === "abgeholt"); if (g) Object.assign(d, { belohnung: g.belohnung, splitter: g.splitter, punkte: g.punkte, amBoden: d.amBoden || Boolean(g.amBoden) }); if (g && g.amBoden) d.zeilen = [...(d.zeilen || []), { wer: "", text: `(Dein Rucksack ist voll – ${g.amBoden} liegen am Boden.)` }]; }
  return d; };
const ding = async (s, id) => { const n = s.texte.length; sende(s, { t: "qding", id }); await warte(s, (m) => m.t === "qtext", 2000); return s.texte[n] || ""; };
const stand = (s, q) => QB.lage(q, s.b[q.id] || "");
const zaehler = (s, q, id) => QB.zaehler(q, s.b[q.id] || "", id);
/** sammeln (Holz, Bergbau, Pflanze) bis n Stück dieses Ertrags im Rucksack sind */
async function sammeln(s, art, id, x, y, g, n, ms = 120000) { await stelle(s, x + 1.2, y); const t0 = Date.now(); s[art] = []; sende(s, { t: art, tat: "start", id });
  while (anzahl(s, g) < n && Date.now() - t0 < ms) { await schlaf(300); if (s[art].some((m) => m.tat === "stop" || m.tat === "nein")) { s[art] = []; sende(s, { t: art, tat: "start", id }); } }
  sende(s, { t: art, tat: "stop" }); await schlaf(300); return anzahl(s, g) >= n; }
async function herstellen(s, x, y, rezept, menge = 1) { if (x !== null) await stelle(s, x + 1.2, y); s.handwerk = []; sende(s, { t: "handwerk", tat: "start", rezept, menge });
  const a = (await warte(s, (m) => m.t === "handwerk" && (m.tat === "nein" || m.tat === "start"))) || {}; if (a.tat !== "start") return a.text || "?";
  await (s.handwerk.find((m) => m.tat === "stop") || warte(s, (m) => m.t === "handwerk" && m.tat === "stop", 90000)); await schlaf(300); return "ok"; }
const kaufen = async (s, laden, g) => { const n = s.chat.length; sende(s, { t: "kaufen", laden, g }); await schlaf(500); return s.chat.slice(n).join(" "); };
const Q = QUESTS.find((q) => q.id === "obstwiesen_fallobst"), O = (id) => Q.objekte.find((o) => o.id === id), F = (id) => Q.figuren.find((f) => f.id === id);
/** Kampfwelt der Westmark (echte Simulation) an einer Stelle (Weltfelder) */
const GEBIET = { westmark: [6272, 6464], obstwiesen: [6528, 6656], weidenhain: [6400, 6656] };
const kampf = (token, wx, wy, r = "westmark") => new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8777/?kampf=welt_${r}&ort=welt_${r}&lx=${wx - GEBIET[r][0]}&ly=${wy - GEBIET[r][1]}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); });
try {
  const ida = await spieler(TA), tom = await spieler(TB);
  for (const s of [ida, tom]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);
  check(Boolean(Q) && Q.schritte.length === 7, "B3 „Fallobst“ ist im Spiel");

  console.log("Annehmen");
  await stelle(tom, F("gisbert").x + 1, F("gisbert").y); let d = await rede(tom, "gisbert"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Tom (unter Heldenlevel 15): kein Annehmen");
  /* das Heldenlevel kennt der Server aus der Kampfwelt (dort steht der Held im Spiel immer) */
  let zo = await kampf(TA, F("gisbert").x + 1, F("gisbert").y, "obstwiesen"); await schlaf(1200);
  await stelle(ida, F("gisbert").x + 1, F("gisbert").y); d = await rede(ida, "gisbert"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "annehmen"), "Ida: Gisbert bietet die Quest an " + JSON.stringify(d && d.dialog && d.dialog.antworten.map((a) => a.id)));
  await sag(ida, "gisbert", "annehmen"); await schlaf(300); check(stand(ida, Q).phase === "laeuft", "Angenommen");
  check(/geschlossen|nichts|leer/.test(await kaufen(ida, "obstwiesen", "apfel")), "Gisbert verkauft noch keine Äpfel");

  console.log("Spuren und Späher");
  for (const id of ["b3_stiefel", "b3_karren", "b3_apfel"]) { const o = O(id); await stelle(ida, o.x + 1, o.y); await ding(ida, id); }
  await schlaf(300); check(["spur_stiefel", "spur_karren", "spur_apfel"].every((x) => QB.erledigt(Q, ida.b[Q.id] || "", x)), "Drei Spuren untersucht");
  zo.ws.close(); await schlaf(300); await stelle(ida, 6286, 6566); const z = await kampf(TA, 6286, 6566); await schlaf(1500);
  const ich0 = z.w.find((w) => w[1] === 1), sp = () => z.w.filter((w) => w[2] === "bandit_spaeher" && !w[10] && Math.hypot(w[4] - ich0[4], w[5] - ich0[5]) < 20); /* nur das Lager (die Gegnerplätze der Welt #130 stehen weiter weg, der nächste Späher 22,5 Felder); 20 statt 18: Späher gehen im Lager umher */
  for (let t0 = Date.now(); sp().length < 6 && Date.now() - t0 < 6000;) await schlaf(250); /* langsamer Testrechner: kurz warten, bis alle da sind */
  check(sp().length === 6, `Im Westmark-Lager stehen sechs Banditen-Späher (${sp().length})`);
  let siege = 0; const t0 = Date.now();
  while (siege < 5 && Date.now() - t0 < 150000) { const ich = z.w.find((w) => w[1] === 1); const ziel = sp().sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
    if (!ziel) { await schlaf(500); continue; } z.ws.send(JSON.stringify({ t: "ziel", id: ziel[0] })); const id = ziel[0];
    for (let i = 0; i < 300; i++) { await schlaf(100); if (z.ev.some((e) => e.a === "tot" && e.id === id)) { siege++; break; } } }
  await schlaf(800);
  check(siege === 5 && QB.zaehler(Q, ida.b[Q.id], "spaeher") === 5, `Fünf Späher besiegt (${siege}, Zähler ${QB.zaehler(Q, ida.b[Q.id], "spaeher")})`);
  /* der Karrenbrief: spätestens beim fünften Späher – er liegt (nur für Ida) am Boden */
  sende(ida, { t: "pos", x: 0, y: 0, wx: 6286, wy: 6556 }); await schlaf(1500);
  const brief = ida.boden.find((b) => b.g === "karrenbrief"); check(Boolean(brief) && ida.boden.filter((b) => b.g === "karrenbrief").length === 1, "Genau ein Karrenbrief liegt am Boden: " + JSON.stringify(ida.boden.map((b) => b.g)));
  if (brief) { await stelle(ida, brief.x, brief.y); sende(ida, { t: "aufheben", id: brief.i }); await warte(ida, (m) => m.t === "quests", 2500); }
  z.ws.close(); await schlaf(300);
  check(anzahl(ida, "karrenbrief") === 1 && QB.erledigt(Q, ida.b[Q.id] || "", "brief"), "Karrenbrief aufgehoben");

  console.log("Kisten, Gisbert, Othmar");
  { const o = O("b3_kisten"); await stelle(ida, o.x + 1, o.y); await ding(ida, "b3_kisten"); await schlaf(300); }
  check(anzahl(ida, "apfelkisten") === 1 && QB.erledigt(Q, ida.b[Q.id] || "", "kisten"), "Gisberts Kisten hinter den Fässern gefunden");
  await stelle(ida, F("gisbert").x + 1, F("gisbert").y); await rede(ida, "gisbert"); await sag(ida, "gisbert", "kisten_geben"); await schlaf(300);
  check(anzahl(ida, "apfelkisten") === 0 && QB.erledigt(Q, ida.b[Q.id] || "", "zurueck"), "Kisten an Gisbert zurückgegeben");
  await stelle(ida, F("othmar").x + 1, F("othmar").y); d = await rede(ida, "othmar"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "brief_zeigen"), "Othmar fragt nach dem Brief (Figur in mehreren Quests)");
  const vorSp = anzahl(ida, "splitter"); d = await sag(ida, "othmar", "brief_zeigen"); await schlaf(600);
  check(stand(ida, Q).phase === "fertig" && anzahl(ida, "karrenbrief") === 0, "Othmar liest den Brief: Quest fertig");
  check(anzahl(ida, "apfel") === 10 && anzahl(ida, "splitter") === vorSp + 120 && ABSCHLUSS.some((a) => a.p_quest === Q.id && a.p_xp && a.p_xp.fernkampf === 500), `Lohn: 10 Äpfel, 120 Splitter, Fernkampf 500 (Äpfel ${anzahl(ida, "apfel")}, Splitter +${anzahl(ida, "splitter") - vorSp})`);
  await stelle(ida, ...LAEDEN.obstwiesen.vor); const vorA = anzahl(ida, "apfel"); await kaufen(ida, "obstwiesen", "apfel"); await schlaf(300);
  check(anzahl(ida, "apfel") === vorA + 1, "Danach verkauft Gisbert Äpfel");
  check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close(); if (f) console.log(log.slice(-1500));
console.log(f ? `${f} Fehler` : "Phase 4 B3 „Fallobst“: alles in Ordnung"); process.exit(f ? 1 : 0);
