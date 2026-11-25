/*
 * Mythara – Laufenergie übersteht Teleport, Neuladen und Abmelden: der Spielserver merkt sie sich je Konto und setzt sie beim Betreten wieder
 * (mit der Erholung seither) – was der Browser meldet (z. B. 100 % nach einem Neuladen), zählt dann nicht.
 * Gerüst aus abmelden.test.mjs. Aufruf: node test/ausdauer-welt.test.mjs (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 }, quests: {}, skill_geschick: 11079266, skill_staerke: 11079266, skill_lp: 11079266, skill_defense: 11079266 },
  [B]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", inventar: null, quests: {} } }, SETZEN = [], ABSCHLUSS = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_held_setzen") || req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_position_setzen")) return send(200, { ok: true });
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); SETZEN.push(a); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss") { const a = JSON.parse(b); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: "fertig" }; ABSCHLUSS.push(a); return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true); /* Buchungen der Kampfzone (XP, Leben) */
  FEHLT.push(req.url); send(404, {}); }); }).listen(8798);
const FEHLT = [];
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8788", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const TOK = { anna: "tok_anna_" + "x".repeat(30), ben: "tok_ben__" + "x".repeat(30) };
function zone(token, lx, ly) { return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8788/?kampf=welt_osthof&ort=welt_osthof&lx=${lx}&ly=${ly}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [], namen: [], zu: null };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } if (m.t === "namen") Z.namen = m.liste; });
  ws.on("close", (code, grund) => { Z.zu = { code, grund: String(grund) }; });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); }); }
const aus = (Z) => (Z.ich && Z.ich.ausdauer ? Z.ich.ausdauer[0] : null);
try {
  let a = await zone(TOK.anna, 70.5, 14.5); await schlaf(1500);
  check(aus(a) !== null && aus(a) >= 99, `Beim ersten Betreten: volle Laufenergie (${aus(a)})`);
  a.ws.send(JSON.stringify({ t: "sprint", an: true, wert: 100 })); a.ws.send(JSON.stringify({ t: "richtung", x: 1, y: 0 })); await schlaf(1200); a.ws.send(JSON.stringify({ t: "richtung", x: -1, y: 0 })); await schlaf(1200); a.ws.send(JSON.stringify({ t: "richtung", x: 1, y: 0 })); await schlaf(1200); a.ws.send(JSON.stringify({ t: "richtung", x: -1, y: 0 })); await schlaf(1200); a.ws.send(JSON.stringify({ t: "richtung", x: 0, y: 0 })); await schlaf(300);
  const vorher = aus(a); check(vorher !== null && vorher < 98, `Gesprintet: Laufenergie gesunken (${vorher})`);
  a.ws.close(); await schlaf(1500);
  a = await zone(TOK.anna, 70.5, 14.5); await schlaf(400); a.ws.send(JSON.stringify({ t: "sprint", an: false, wert: 100 })); /* wie ein frisch geladener Browser */ await schlaf(1200);
  const nachher = aus(a); check(nachher !== null && nachher < 99 && nachher >= vorher, `Neu verbunden (wie nach Teleport/Neuladen): nicht aufgefüllt (${vorher} → ${nachher}, nur die Erholung seither)`);
  a.ws.close();
} catch (e) { check(false, "Ausnahme: " + e.stack); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-1500)); console.log(f ? `\n${f} Prüfungen fehlgeschlagen` : "\nAlle Prüfungen bestanden"); process.exit(f ? 1 : 0);
