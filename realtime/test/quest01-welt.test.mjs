/*
 * Mythara – Quest 01 „Die gesperrte Straße“ Ende zu Ende: echter Spielserver (server/dist/server.js), nachgebildete Supabase, zwei Spieler.
 * Anna spielt die Quest durch (Jori → Hagan → Fenna → Wachen → Schriftstück → Hagan → Wachen → Othmar), Ben steht daneben und sieht keinen Dialog;
 * Reihenfolge und Abstand werden geprüft, die Belohnung kommt genau einmal, hinter die Sperre kommt nur, wer frei ist.
 * Aufruf: node test/quest01-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
import { QB, QUEST1 } from "./sim.gebaut.mjs";
/** Stände seit dem Baukasten (26.11.2026): die alten Namen übersetzt die Quest selbst */
const N = (alt) => QB.gueltig(QUEST1, alt);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", D = "00000000-0000-0000-0000-00000000d004";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B, ["tok_dora_" + "x".repeat(30)]: D }, NAME = { [A]: "Anna", [B]: "Ben", [D]: "Dora" };
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 }, quests: {} },
  [B]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", inventar: null, quests: {} },
  /* Dora: alter Stand „wachen“ (vor dem Baukasten gespeichert) */
  [D]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", inventar: null, quests: { die_gesperrte_strasse: { s: "wachen" } } } }, SETZEN = [], ABSCHLUSS = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_held_setzen") || req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_position_setzen")) return send(200, { ok: true });
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); SETZEN.push(a); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  if (/^\/rest\/v1\/rpc\/rpg_held_quest_abschluss(_v2)?$/.test(req.url)) { const a = JSON.parse(b); a.v2 = req.url.endsWith("_v2"); if (a.v2 && (HELD[a.p_user].quests[a.p_quest] || {}).s !== "fertig") HELD[a.p_user].questpunkte = (HELD[a.p_user].questpunkte || 0) + Math.min(10, a.p_punkte || 0); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: "fertig" }; ABSCHLUSS.push(a); return send(200, true); }
  send(404, {}); }); }).listen(8798);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8788", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8788/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, q1: null, dialoge: [], chat: [], zurueck: null, inv: null, boden: [], warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "quests") s.q1 = (m.b || {}).die_gesperrte_strasse; if (m.t === "dialog") s.dialoge.push(m); if (m.t === "inventar") s.inv = m.inv; if (m.t === "zurueck") s.zurueck = m; if (m.t === "boden") s.boden = m.liste; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 3000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m));
const NPC = { jori: [6452.5, 6444.5], hagan: [6438.5, 6423.5], fenna: [6534.5, 6438.5], raban: [6442.5, 6643.5], othmar: [6451.5, 6688.5] };
const hin = async (s, id, d = 1) => { sende(s, { t: "pos", x: 0, y: 0, wx: NPC[id][0] + d, wy: NPC[id][1] }); await new Promise((r) => setTimeout(r, 120)); };
const rede = async (s, id) => { sende(s, { t: "rede", npc: id }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, id, a) => { sende(s, { t: "antwort", npc: id, a }); return warte(s, (m) => m.t === "dialog"); };
try {
  const anna = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna, (m) => m.t === "quests"); const ben = await spieler("tok_ben__" + "x".repeat(30)); await warte(ben, (m) => m.t === "quests");
  check(anna.q1 === "" && ben.q1 === "", "Beide kommen mit leerem Queststand an");
  await hin(anna, "jori"); await hin(ben, "jori", 2); let d = await rede(anna, "jori");
  check(d && d.dialog && d.dialog.name === "Jori" && d.dialog.antworten.some((a) => a.id === "annehmen"), `Jori spricht Anna an: „${d && d.dialog && d.dialog.zeilen[0].text}“`);
  await new Promise((r) => setTimeout(r, 300)); check(ben.dialoge.length === 0, "Ben steht daneben und sieht keinen Dialog");
  d = await sag(anna, "jori", "warum"); check(d && d.zeilen && d.dialog && d.dialog.antworten.length, "Nachfragen: Jori antwortet, das Gespräch geht weiter");
  d = await sag(anna, "jori", "annehmen"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("angenommen"), 1500); check(d && d.ende && anna.q1 === N("angenommen") && HELD[A].quests.die_gesperrte_strasse.s === N("angenommen"), "Quest angenommen (gespeichert)");
  check(ben.q1 === "", "Bens Stand bleibt unberührt");
  /* Reihenfolge: Fenna und die Wachen wissen noch nichts */
  await hin(anna, "fenna"); d = await rede(anna, "fenna"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "weiter"), "Fenna hat vor dem Auftrag nichts zu sagen");
  /* Abstand */
  await hin(anna, "jori", 30); d = await rede(anna, "hagan"); check(d && d.ende && anna.chat.some((t) => /näher/.test(t)), "Zu weit weg: „Geh näher heran“");
  await hin(anna, "hagan"); d = await rede(anna, "hagan"); check(d && d.dialog && d.dialog.name === "Hagan Voss", "Der Bürgermeister erklärt den Auftrag");
  d = await sag(anna, "hagan", "banditen"); check(d && d.dialog, "Nachfrage zu den Banditen"); d = await sag(anna, "hagan", "osthof"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("auftrag"), 1500); check(anna.q1 === N("auftrag"), "Stand: zum Osthof");
  d = await sag(anna, "hagan", "osthof"); check(d && d.ende && anna.chat.some((t) => /vorbei/.test(t)), "Antwort ohne offenes Gespräch: abgelehnt");
  /* Schriftstück früh fallen lassen geht noch nicht – Anna hat keins. Fenna */
  await hin(anna, "fenna"); await rede(anna, "fenna"); await sag(anna, "fenna", "karren"); await sag(anna, "fenna", "weiter"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("osthof"), 1500); check(anna.q1 === N("osthof"), "Fenna berichtet: weiter zu den Wachen");
  await hin(anna, "raban"); d = await rede(anna, "raban"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "lager"), "Die Wachen erzählen von der Lichtung");
  await sag(anna, "raban", "lager"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("wachen"), 1500); check(anna.q1 === N("wachen"), "Stand: zum Banditenlager");
  /* Beweis: vor dem Schriftstück lässt Hagan sich nicht überzeugen */
  await hin(anna, "hagan"); d = await rede(anna, "hagan"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "zeigen"), "Ohne Schriftstück: nichts vorzuzeigen");
  d = await sag(anna, "hagan", "zeigen"); check(d && d.ende && anna.q1 === N("wachen"), "Vorzeigen ohne Schriftstück wird abgelehnt");
  anna.ws.close(); await new Promise((r) => setTimeout(r, 400));
  const anna2 = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna2, (m) => m.t === "quests"); check(anna2.q1 === N("wachen"), "Neu angemeldet: der Stand bleibt (wachen)"); anna2.ws.close();
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); console.log(log.slice(-1500)); }
srv.kill(); await new Promise((r) => setTimeout(r, 500));
/* zweiter Lauf (frischer Server, Inventar neu geladen): Anna hat ein Schriftstück im Rucksack, Stand „osthof“ */
HELD[A].inventar = { angelegt: { waffe: "ritterschwert" }, rucksack: ["hinweispergament"], v: 2 };
const srv2 = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8788", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
srv2.stdout.on("data", (d) => (log += d)); srv2.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200));
try {
  HELD[A].quests.die_gesperrte_strasse = { s: "osthof" }; /* alter Stand aus der Zeit vor dem Baukasten */
  const anna = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna, (m) => m.t === "quests"); await warte(anna, (m) => m.t === "inventar", 1500);
  check(anna.q1 === "auftrag_3", `Alter Stand „osthof“ in der Datenbank wird beim Laden übersetzt (${anna.q1})`);
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6500, wy: 6500 }); await new Promise((r) => setTimeout(r, 150)); sende(anna, { t: "inv", tat: "fallen", i: 0 }); await warte(anna, (m) => m.t === "inventar");
  check(!anna.inv.rucksack.length, "Anna lässt das Schriftstück vor dem Lager fallen (noch Stand osthof)");
  await hin(anna, "raban"); await rede(anna, "raban"); await sag(anna, "raban", "lager"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("wachen"), 1500);
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6500.5, wy: 6500 }); await new Promise((r) => setTimeout(r, 1300)); check(anna.boden.length === 1 && anna.boden[0].g === "hinweispergament", "Das Schriftstück liegt (nur für Anna sichtbar) am Boden");
  if (anna.boden[0]) sende(anna, { t: "aufheben", id: anna.boden[0].i }); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("beweis"), 2500);
  check(anna.q1 === N("beweis") && anna.inv.rucksack.includes("hinweispergament"), "Schriftstück aufgehoben, während die Wachen den Beweis verlangen: weiter zum Bürgermeister");
  await hin(anna, "hagan"); let d = await rede(anna, "hagan"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "zeigen"), "Hagan: „Hast du etwas gefunden?“ – Schriftstück vorzeigen");
  d = await sag(anna, "hagan", "zeigen"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("bestaetigt"), 1500); await warte(anna, (m) => m.t === "inventar" && !m.inv.rucksack.includes("hinweispergament"), 1500);
  check(anna.q1 === N("bestaetigt") && !anna.inv.rucksack.includes("hinweispergament"), "Beweis übergeben: aus dem Rucksack, Stand bestätigt");
  /* hinter die Sperre? noch nicht */
  const b1 = await spieler("tok_ben__" + "x".repeat(30), "weidenhain"); await warte(b1, (m) => m.t === "zurueck", 2500); check(b1.zurueck && /gesperrt/.test(b1.zurueck.text), "Ben (ohne Freigabe) in Weidenhain: der Server schickt ihn zurück vor die Sperre"); b1.ws.close();
  await hin(anna, "raban"); await rede(anna, "raban"); await sag(anna, "raban", "festnehmen"); await sag(anna, "raban", "durch"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === N("frei"), 1500); check(anna.q1 === N("frei"), "Die Wachen lassen Anna durch");
  anna.ws.close(); await new Promise((r) => setTimeout(r, 400));
  const a3 = await spieler("tok_anna_" + "x".repeat(30), "weidenhain"); await warte(a3, (m) => m.t === "quests"); await new Promise((r) => setTimeout(r, 400)); check(!a3.zurueck, "Anna darf nach Weidenhain");
  await hin(a3, "othmar"); d = await rede(a3, "othmar"); check(d && d.dialog && d.dialog.name === "Othmar Rehn", "Othmar Rehn nimmt den Bericht entgegen");
  d = await sag(a3, "othmar", "helfen"); await warte(a3, (m) => m.t === "quests" && (m.b || {}).die_gesperrte_strasse === "fertig", 1500);
  check(d && d.ende && d.belohnung && d.belohnung.geschick === 150 && d.belohnung.defense === 200 && a3.q1 === "fertig" && ABSCHLUSS.length === 1, `Quest abgeschlossen, Belohnung ${JSON.stringify(d && d.belohnung)}`);
  d = await rede(a3, "othmar"); d = d && d.dialog ? await sag(a3, "othmar", "helfen") : d; check(ABSCHLUSS.length === 1 && !(d && d.belohnung), "Noch einmal: keine zweite Belohnung");
  check(SETZEN.every((x) => x.p_stand !== "fertig"), "„fertig“ nur über den Abschluss gespeichert");
  a3.ws.close();
  /* Dora: alter Stand „wachen“ in der Datenbank, meldet sich in Weidenhain an → richtig geladen, aber zurück vor die Sperre */
  const b2 = await spieler("tok_dora_" + "x".repeat(30), "weidenhain"); await warte(b2, (m) => m.t === "quests"); await warte(b2, (m) => m.t === "zurueck", 1500);
  check(b2.q1 === "auftrag_7" && b2.zurueck && Math.abs(b2.zurueck.y - 6641.5) < 1, `Alter Stand „wachen“: lädt als auftrag_7, Weidenhain noch gesperrt (zurück vor die Sperre)`); b2.ws.close();
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); console.log(log.slice(-1500)); }
srv2.kill(); sb.close(); console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Quest 01 mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
