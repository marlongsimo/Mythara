/*
 * Mythara – Heim-Teleport: je Konto höchstens alle TELEPORT_PAUSE_MS (live 5 min; hier 2 s). Der Server merkt sich die Zeit – neue Verbindung oder anderes Gerät helfen nicht; Gäste: nur das Gerät.
 * Gerüst aus quest03-welt.test.mjs (Quest 03 „Der Säbel des Waldgottes“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Anna (ohne Werkzeug) nimmt beim Förster an → bekommt Beil, Spitzhacke, Hammer; fällt den Baum des Waldgottes, baut den Waldstein ab,
 * schmilzt an der Esse, schmiedet am Amboss, zeigt den Säbel → fertig. Ben ohne Auftrag: Baum, Stein und Rezepte gesperrt.
 * Aufruf: node test/quest03-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const roh = () => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } } });
const HELD = { [A]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 } }, [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: ["holzbeil_training", "spitzhacke_training", "hammer", "erz_waldstein", "holz_waldgott", "barren_waldstein"], v: 2 } } }, SETZEN = [], ABSCHLUSS = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); SETZEN.push(a); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss") { const a = JSON.parse(b); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: "fertig" }; ABSCHLUSS.push(a); return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  send(404, {}); }); }).listen(8797);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8797", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", HOLZ_KERN: "0", BERG_KERN: "0", HANDWERK_GLUT: "0", TELEPORT_PAUSE_MS: "2000" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8787/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, q3: null, inv: null, chat: [], holz: [], berg: [], handwerk: [], warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") s.q3 = m.q3; if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "boden") s.boden = m.liste; if (m.t === "holz") s.holz.push(m); if (m.t === "berg") s.berg.push(m); if (m.t === "handwerk") s.handwerk.push(m); if (m.t === "teleport") s.tp = m;
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await schlaf(150); };
const rede = async (s) => { sende(s, { t: "rede", npc: "foerster" }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, a) => { sende(s, { t: "antwort", npc: "foerster", a }); return warte(s, (m) => m.t === "dialog"); };
const start = async (s, t, msg) => { s[t] = []; sende(s, { t, tat: "start", ...msg }); return (await warte(s, (m) => m.t === t && (m.tat === "nein" || m.tat === "start"))) || {}; };
const ende = async (s, t, ms = 30000) => s[t].find((m) => m.tat === "stop") || warte(s, (m) => m.t === t && m.tat === "stop", ms);
const frag = async (s) => { s.tp = null; sende(s, { t: "teleport" }); return (await warte(s, (m) => m.t === "teleport", 2000)) || {}; };
try {
  let anna = await spieler("tok_anna_" + "x".repeat(30), "nordwald"); await warte(anna, (m) => m.t === "inventar");
  const a1 = await frag(anna); check(a1.ok === true, "Erster Teleport: erlaubt");
  const a2 = await frag(anna); check(a2.ok === false && a2.rest > 1000 && a2.rest <= 2000, `Gleich danach: gesperrt, Restzeit ${a2.rest} ms`);
  anna.ws.close(); await schlaf(200); anna = await spieler("tok_anna_" + "x".repeat(30), "osthof"); await warte(anna, (m) => m.t === "inventar");
  const a3 = await frag(anna); check(a3.ok === false, "Neu verbunden (anderes Gerät): weiter gesperrt");
  const ben = await spieler("tok_ben__" + "x".repeat(30), "nordwald"); await warte(ben, (m) => m.t === "inventar");
  check((await frag(ben)).ok === true, "Ein anderes Konto ist nicht betroffen");
  await schlaf(2100); check((await frag(anna)).ok === true, "Nach Ablauf der Pause: wieder erlaubt");
  const gast = await new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8787/?welt=1&ort=nordwald", { origin: "http://localhost:8765" }), g = { ws, warte: [], tp: null };
    ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "teleport") g.tp = m; for (const w of [...g.warte]) if (w.f(m)) { g.warte.splice(g.warte.indexOf(w), 1); w.r(m); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", gast: true })); fertig(g); }); });
  await schlaf(800); const g1 = await frag(gast); check(g1.ok === true && g1.gast === true, "Gast: der Server sagt „Gerät entscheidet“");
  anna.ws.close(); ben.ws.close(); gast.ws.close();
} catch (e) { check(false, "Ausnahme: " + e.stack); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-2000)); console.log(f ? `\n${f} Prüfungen fehlgeschlagen` : "\nAlle Prüfungen bestanden"); process.exit(f ? 1 : 0);
