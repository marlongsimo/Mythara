/*
 * Riftmere – Schiffslinien Ende zu Ende (Ausgabe 2; shared/schiffe.ts, server/src/schiffe.ts): echter Spielserver, nachgebildete Supabase, Welt-Verbindung.
 * Anna steht am Kapitän in Kielmund: das erste Gespräch merkt den Hafen (gespeichert), Grauwacht kennt sie (Merker), Netzbucht nicht.
 * Überfahrt nach Grauwacht (wie ein Teleport): 60 Splitter weg, Ankunft in der Antwort, die Stelle am Ziel gespeichert (wie beim Wegstein).
 * Aufruf: node test/schiffe-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module"; import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", TA = "tok_anna_" + "x".repeat(30), NUTZER = { [TA]: A };
const HAEFEN = JSON.parse(readFileSync("shared/haefen.json", "utf8")).haefen, SEE = Object.fromEntries(HAEFEN.map((h) => [h.id, h]));
const K = SEE.kielmund.kapitaen, G = SEE.grauwacht;
const HELD = { [A]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } },
  inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 70 }], v: 2, merker: ["hafen_grauwacht"] } } }, POS = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, [{ handle: "Anna" }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) { if (req.method === "POST" || req.method === "PATCH") POS.push(JSON.parse(b || "{}")); return send(200, []); }
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) { if (/position/.test(req.url)) POS.push(JSON.parse(b || "{}")); return send(200, true); }
  send(404, {}); }); }).listen(8906);
let srv, log = "";
srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8905", SUPABASE_URL: "http://localhost:8906", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" } });
srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200));
function spieler(ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8905/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, alle: [], warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); s.alle.push(m); if (m.t === "inventar") s.inv = m.inv; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token: TA, geraet: "test-schiffe" })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const splitter = (s) => (s.inv.rucksack || []).reduce((n, x) => n + (typeof x !== "string" && x.g === "splitter" ? x.n : 0), 0);
const frage = async (s, m) => { const w = warte(s, (x) => x.t === "schiff"); sende(s, { t: "schiff", ...m }); return (await w) || {}; };
try {
  const anna = await spieler(SEE.kielmund.region); await warte(anna, (m) => m.t === "inventar"); await schlaf(300);
  sende(anna, { t: "pos", x: 0, y: 0, wx: K.x + 8, wy: K.y }); await schlaf(150);
  check(!(await frage(anna, { tat: "ziele" })).ok, "zu weit vom Kapitän: keine Antwort mit Zielen");
  sende(anna, { t: "pos", x: 0, y: 0, wx: K.x + 1, wy: K.y + 1 }); await schlaf(150);
  const z = await frage(anna, { tat: "ziele" });
  check(z.ok && z.neu && z.von === "kielmund" && (z.ziele || []).map((x) => x.id).join() === "grauwacht" && z.ziele[0].preis === 60, "am Kapitän: Kielmund neu besucht, Ziel Grauwacht für 60 Splitter (Netzbucht unbekannt)");
  await schlaf(1800); check((HELD[A].inventar.merker || []).includes("hafen_kielmund"), "der besuchte Hafen ist gespeichert (Merker hafen_kielmund)");
  check(!(await frage(anna, { tat: "fahren", nach: "netzbucht" })).ok && splitter(anna) === 70, "nach Netzbucht (unbekannt): keine Fahrt, nichts bezahlt");
  const r = await frage(anna, { tat: "fahren", nach: "grauwacht" }); await warte(anna, (m) => m.t === "inventar", 2000);
  check(r.ok && r.tat === "fahren" && r.preis === 60 && r.name === "Grauwacht" && r.weg === undefined, "Überfahrt nach Grauwacht: 60 Splitter, sofort (keine Fahrt an Deck)");
  check(r.x === G.ankunft[0] && r.y === G.ankunft[1] && r.region === G.region, "Ankunft am Zielsteg in Grauwacht");
  check(splitter(anna) === 10, `Splitter abgezogen (70 → ${splitter(anna)})`);
  check(!(await frage(anna, { tat: "fahren", nach: "grauwacht" })).ok, "die Stelle steht schon in Grauwacht – am Kapitän in Kielmund geht nichts mehr");
  await schlaf(500); const p = POS.map((x) => JSON.stringify(x)).find((t) => t.includes(String(G.ankunft[0])) && t.includes(String(G.ankunft[1])));
  check(Boolean(p) && p.includes(G.region), "die Stelle am Ziel ist gespeichert (Region und Ankunft, wie beim Wegstein)");
  anna.ws.close();
} catch (e) { console.error(e); f++; }
finally { srv.kill(); sb.close(); }
if (f && log) console.log(log.slice(-2500));
console.log(f ? `\nSchiffe-Welt: ${f} FEHLER` : "\nSchiffe-Welt: alles in Ordnung"); process.exit(f ? 1 : 0);
