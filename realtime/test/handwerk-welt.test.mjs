/*
 * Mythara – Handwerk Ende zu Ende (shared/handwerk.ts, server/src/handwerk.ts, server/src/pflanzen.ts): echter Spielserver, nachgebildete Supabase.
 * Werkbank: Bogensehne aus Flachs, Garn aus Hanf (stapelt), Raues Leder aus Kuhhaut + Stamm; Esse: Kupferbarren. Abgelehnt: Gast, zu weit, Level, Zutaten fehlen.
 * Lauf 2 mit HANDWERK_GLUT=1: Glut angetippt → eine Zutat gespart, 50 % mehr XP. Pflücken ohne Werkzeug (PFLANZE_FALL=0), kein Splitter.
 * Aufruf: node test/handwerk-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module"; import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const roh = () => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } } });
const HELD = { [A]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: ["flachs", "flachs", "hanf", "hanf", "hanf", "hanf", "kuhhaut", "stamm_eiche", "erz_kupfer", "stamm_eiche"], v: 2 } }, [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 } } }, GESPEICHERT = [];
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
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8785".replace("8785", "8784") + "/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], handwerk: [], pflanze: [], pflanzen: null, warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "handwerk") s.handwerk.push(m); if (m.t === "pflanze") s.pflanze.push(m); if (m.t === "pflanzen") s.pflanzen = m.weg; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token } : { t: "anmeldung", gast: true })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const faecher = (s, g) => (s.inv.rucksack || []).filter((x) => (typeof x === "string" ? x : x.g) === g).length;
const WERKBANK = { x: 6463.5, y: 6426.5 }, ESSE = { x: 6467.4, y: 6427.8 }, FLACHS = { id: "flachs_1", x: 6506.5, y: 6412.5 };
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30);
const bei = async (s, b, d = 1.2) => { sende(s, { t: "pos", x: 0, y: 0, wx: b.x + d, wy: b.y }); await schlaf(150); };
const mach = async (s, rezept, menge = 1) => { s.handwerk = []; sende(s, { t: "handwerk", tat: "start", rezept, menge }); return (await warte(s, (m) => m.t === "handwerk" && (m.tat === "nein" || m.tat === "start"))) || {}; };
const ende = async (s, ms = 15000) => s.handwerk.find((m) => m.tat === "stop") || warte(s, (m) => m.t === "handwerk" && m.tat === "stop", ms);   // der Stopp kann schon da sein
try {
  await starten({ HANDWERK_GLUT: "0", PFLANZE_FALL: "0" });
  const anna = await spieler(TA, "waldmark"), ben = await spieler(TB, "waldmark"); await warte(anna, (m) => m.t === "inventar"); await warte(ben, (m) => m.t === "inventar");
  check(Array.isArray(anna.pflanzen) && anna.pflanzen.length === 0, "Beim Anmelden: Stand der Pflanzen (alle voll)");
  await bei(anna, WERKBANK, 6); check(/näher/.test((await mach(anna, "bogensehne")).text || ""), "Zu weit weg: „Geh näher an die Werkbank.“");
  await bei(anna, WERKBANK); check(/Handwerk 10/.test((await mach(anna, "leder_weich")).text || ""), "Weiches Leder mit Level 1: „… brauchst du Handwerk 10.“");
  await bei(ben, WERKBANK); check(/fehlt/.test((await mach(ben, "garn")).text || ""), "Ohne Hanf: „Dir fehlt: 1 × Hanf.“");
  check((await mach(anna, "gibtsnicht")).text === "Dieses Rezept gibt es nicht.", "Unbekanntes Rezept abgelehnt");
  check((await mach(anna, "ritterschwert")).text === "Dieses Rezept gibt es nicht." && (await mach(anna, "jagdbogen")).text === "Dieses Rezept gibt es nicht.", "Trainingsteile (Ritterschwert, Trainingsbogen) kann man nicht herstellen");
  const t0 = Date.now(), s1 = await mach(anna, "bogensehne", 5); check(s1.tat === "start" && s1.menge === 5 && s1.station === "werkbank", "Bogensehne ab Level 1 an der Werkbank: es geht los");
  const e1 = await ende(anna); const fe = anna.handwerk.filter((m) => m.tat === "fertig");
  check(e1 && e1.grund === "zutaten" && fe.length === 2 && fe.every((m) => m.g === "bogensehne" && m.xp === 4), `Zwei Flachs → zwei Bogensehnen (je 4 XP), dann „Zutaten aus“ (${fe.length}, ${e1 && e1.grund})`);
  check(Date.now() - t0 > 1800, `Je Stück 2 Ticks (${Date.now() - t0} ms für zwei)`); await schlaf(200);
  check(anzahl(anna, "flachs") === 0 && faecher(anna, "bogensehne") === 2, `Rucksack: Flachs weg, zwei Bogensehnen in zwei Fächern (stapeln nicht: ${faecher(anna, "bogensehne")})`);
  await mach(anna, "garn", 4); const e2 = await ende(anna); await schlaf(200);
  check(e2 && e2.grund === "fertig" && anzahl(anna, "garn") === 4 && faecher(anna, "garn") === 1 && anzahl(anna, "hanf") === 0, `Vier Hanf → vier Garn in einem Fach (${anzahl(anna, "garn")} in ${faecher(anna, "garn")})`);
  await mach(anna, "leder_rau"); const e3 = await ende(anna); await schlaf(200);
  check(e3 && e3.grund === "fertig" && anzahl(anna, "leder_rau") === 1 && anzahl(anna, "kuhhaut") === 0 && anzahl(anna, "stamm_eiche") === 1, "Kuhhaut + Eichenstamm → Raues Leder");
  check((await mach(anna, "barren_kupfer")).text && /Esse/.test((await mach(anna, "barren_kupfer")).text), "Kupferbarren an der Werkbank: „Geh näher an die Esse.“");
  await bei(anna, ESSE); const s4 = await mach(anna, "barren_kupfer"); const e4 = s4.tat === "start" ? await ende(anna) : null; await schlaf(200);
  check(e4 && e4.grund === "fertig" && anzahl(anna, "barren_kupfer") === 1 && anzahl(anna, "erz_kupfer") === 0, `An der Esse: Kupfererz + Holz → Kupferbarren (${s4.text || s4.tat})`);
  const xp1 = anna.inv.berufe && anna.inv.berufe.handwerk; check(xp1 > 16, `Handwerk-XP im Inventar (berufe.handwerk): ${xp1}`);
  /* Weggehen bricht ab */
  await bei(anna, WERKBANK); const s5 = await mach(anna, "stoff_hanf", 2); await bei(anna, WERKBANK, 8); const w = await ende(anna, 3000); check(w && w.grund === "weg", `Weggegangen: das Herstellen hört auf (${s5.text || s5.tat}, ${w && w.grund})`);
  /* Pflücken */
  await bei(anna, FLACHS); anna.pflanze = []; sende(anna, { t: "pflanze", tat: "start", id: FLACHS.id }); const p0 = await warte(anna, (m) => m.t === "pflanze" && (m.tat === "start" || m.tat === "nein"));
  check(p0 && p0.tat === "start" && !p0.werkzeug, `Flachs pflücken ohne Werkzeug (${p0 && (p0.text || p0.tat)})`);
  const p1 = await warte(anna, (m) => m.t === "pflanze" && m.tat === "ernte", 30000); check(p1 && p1.g === "flachs" && !p1.xp && !p1.splitter, `Ein Flachs, keine XP, kein Splitter (${p1 && p1.xp})`);
  sende(anna, { t: "pflanze", tat: "stop" }); await schlaf(1800);
  const gesp = GESPEICHERT[GESPEICHERT.length - 1]; check(gesp && gesp.p_inventar.berufe && gesp.p_inventar.berufe.handwerk >= xp1, "Die XP sind gespeichert (rpg_held_inventar_setzen, berufe.handwerk)");
  const gast = await spieler(null, "waldmark"); await schlaf(400); await bei(gast, WERKBANK); check(/Konto/.test((await mach(gast, "bogensehne")).text || ""), "Gast: Handwerk nur mit Konto"); gast.ws.close();
  anna.ws.close(); ben.ws.close(); srv.kill(); await schlaf(400);
  /* Lauf 2: Glut; dazu zwei Eichenstämme und Handwerk 5 für den Bogen in zwei Schritten */
  HELD[A].inventar.rucksack.push("stamm_tanne", "stamm_tanne", "ungespannt_mondkurzbogen_gewoehnlich", "ungespannt_mondkurzbogen_gewoehnlich", "bogensehne", "bogensehne"); HELD[A].inventar.berufe = { ...(HELD[A].inventar.berufe || {}), handwerk: 5000 };
  await starten({ HANDWERK_GLUT: "1" });
  const a2 = await spieler(TA, "waldmark"); await warte(a2, (m) => m.t === "inventar"); await schlaf(300); const garn0 = anzahl(a2, "garn");
  await bei(a2, WERKBANK); await mach(a2, "stoff_hanf", 2); const g = await warte(a2, (m) => m.t === "handwerk" && m.tat === "glut", 6000);
  check(g && g.ms === 1500, "Glut: die Werkstatt glüht auf (1,5 s)"); sende(a2, { t: "handwerk", tat: "glut" });
  const e5 = await ende(a2); await schlaf(200); const f5 = a2.handwerk.filter((m) => m.tat === "fertig");
  check(e5 && f5.length === 2 && !f5[0].glut && f5[1].glut && f5[1].gespart && f5[1].xp === Math.round(f5[0].xp * 1.5), `Glut angetippt: zweites Hanftuch mit Glut, 50 % mehr XP (${f5.map((m) => m.xp)})`);
  check(anzahl(a2, "garn") === garn0 - 3 && faecher(a2, "stoff_hanf") === 2, `Garn ${garn0} → ${anzahl(a2, "garn")} (eins gespart), zwei Hanftücher`);
  /* Bogen in zwei Schritten: an der Werkbank schnitzen, dann im Rucksack die Sehne darauf (überall) */
  const sehnen0 = anzahl(a2, "bogensehne"), xp0 = a2.inv.berufe.handwerk;
  await bei(a2, WERKBANK); const u = await mach(a2, "ungespannt_mondkurzbogen_gewoehnlich"); const eu = u.tat === "start" ? await ende(a2) : null; await schlaf(200);
  const fu = a2.handwerk.find((m) => m.tat === "fertig");
  check(eu && eu.grund === "fertig" && anzahl(a2, "ungespannt_mondkurzbogen_gewoehnlich") === 3 && anzahl(a2, "stamm_tanne") === 0, `Werkbank: zwei Tannenstämme → ungespannter Kurzbogen (${u.text || u.tat}, ${fu && fu.xp} XP)`);
  await bei(a2, WERKBANK, 40); const z = await mach(a2, "mondkurzbogen_gewoehnlich"); const ez = z.tat === "start" ? await ende(a2) : null; await schlaf(200); const fz = a2.handwerk.find((m) => m.tat === "fertig");
  check(z.tat === "start" && ez && ez.grund === "fertig" && anzahl(a2, "mondkurzbogen_gewoehnlich") === 1 && anzahl(a2, "ungespannt_mondkurzbogen_gewoehnlich") === 2 && anzahl(a2, "bogensehne") === sehnen0 - 1,
    `Im Rucksack (weit weg von der Werkbank): Bogensehne auf den ungespannten Bogen → Kurzbogen (${z.text || z.tat}, ${fz && fz.xp} XP)`);
  /* Stück für Stück: zwei Bögen im Rucksack – nach dem ersten liegt das zweite Teil noch da, jedes Stück braucht seine 2 Ticks */
  const t2 = Date.now(), z2 = await mach(a2, "mondkurzbogen_gewoehnlich", 2); const erst = await warte(a2, (m) => m.t === "handwerk" && m.tat === "fertig", 5000); const t3 = Date.now(); await schlaf(150);
  const zwischen = anzahl(a2, "ungespannt_mondkurzbogen_gewoehnlich"); await ende(a2); const t4 = Date.now(); await schlaf(200);
  check(z2.menge === 2 && erst && erst.rest === 1 && zwischen === 1 && t3 - t2 >= 900 && t4 - t3 >= 800 && anzahl(a2, "ungespannt_mondkurzbogen_gewoehnlich") === 0,
    `Stück für Stück: erster Bogen nach ${t3 - t2} ms (das zweite Teil liegt noch im Rucksack: ${zwischen}), zweiter ${t4 - t3} ms später`);
  check(fu && fz && fu.xp > fz.xp && a2.inv.berufe.handwerk >= xp0 + fu.xp + fz.xp, `XP für beide Schritte: ${fu && fu.xp} + ${fz && fz.xp}`);
  a2.ws.close();
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").slice(-20).join("\n"));
console.log(f ? f + " Fehler" : "Handwerk mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
