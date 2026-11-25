/*
 * Mythara – Ein Konto, ein Gerät (server/src/sitz.ts), mit dem echten Spielserver (server/dist/server.js) und nachgebildeter Supabase:
 *  · Wer zuerst in der Welt ist, bleibt – auch wenn er nur dasteht (früher kam ein zweites Gerät nach 20 s Stille hinein und warf das erste hinaus).
 *  · Das spätere Gerät wird abgewiesen (4410), in der Welt wie im Kampfgebiet; „Ins Spiel“ erfährt es vorab über /konto/belegt.
 *  · Dasselbe Gerät (gleiche Seitenkennung) darf jederzeit neu verbinden.
 *  · Verbindungsabbruch: erst nach der Frist frei (hier SITZ_FRIST_MS = 4 s); Abmelden („abmelden“): sofort frei.
 *  · Zwei gleichzeitige Anmeldungen: genau eine kommt durch.
 * Aufruf: node test/ein-geraet.test.mjs   (nach node build.mjs; dauert etwa eine halbe Minute)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", TOK = "tok_anna_" + "x".repeat(30);
const HELD = { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2 }, quests: {} };
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") return (req.headers.authorization || "") === "Bearer " + TOK ? send(200, { id: A, is_anonymous: false }) : send(401, {});
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, [{ handle: "Anna" }]);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, [HELD]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  if (req.url.startsWith("/rest/v1/")) return send(200, []);
  send(404, {}); }); }).listen(8799);
const PORT = 8789, srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: String(PORT), SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", SITZ_FRIST_MS: "4000" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
/** Welt-Verbindung: wartet auf „ich“ (drin) oder das Schließen (abgewiesen) */
function welt(geraet) { return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:${PORT}/?welt=1&ort=waldmark`, { origin: "http://localhost:8765" }), V = { ws, drin: false, zu: null };
  const t = setTimeout(() => fertig(V), 8000);
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "ich") { V.drin = true; clearTimeout(t); fertig(V); } });
  ws.on("close", (code, grund) => { V.zu = { code, grund: String(grund) }; clearTimeout(t); fertig(V); });
  ws.on("open", () => ws.send(JSON.stringify({ t: "anmeldung", token: TOK, geraet }))); }); }
function zone(geraet) { return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:${PORT}/?kampf=welt_osthof&ort=welt_osthof&lx=40.5&ly=30.5`, { origin: "http://localhost:8765" }), V = { ws, drin: false, zu: null };
  const t = setTimeout(() => fertig(V), 8000);
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "hallo") { V.drin = true; clearTimeout(t); fertig(V); } });
  ws.on("close", (code, grund) => { V.zu = { code, grund: String(grund) }; clearTimeout(t); fertig(V); });
  ws.on("open", () => ws.send(JSON.stringify({ t: "anmeldung", token: TOK, geraet }))); }); }
const zuWarten = (V) => new Promise((r) => { if (V.zu) return r(); V.ws.on("close", () => setTimeout(r, 50)); });
const belegt = (geraet) => fetch(`http://localhost:${PORT}/konto/belegt`, { method: "POST", headers: { origin: "http://localhost:8765", "content-type": "application/json", authorization: "Bearer " + TOK }, body: JSON.stringify({ geraet }) }).then((r) => r.json());
try {
  const handy = await welt("handyAAAA01"); check(handy.drin, "Handy kommt in die Welt");
  const z1 = await zone("handyAAAA01"); check(z1.drin, "… und ins Kampfgebiet (dieselbe Seitenkennung)");
  await schlaf(21000); /* das Handy steht nur da – früher galt es nach 20 s als frei */
  const ipad = await welt("ipadBBBB01");
  check(!ipad.drin && ipad.zu && ipad.zu.code === 4410 && ipad.zu.grund === "bereits angemeldet", `iPad (nach 21 s Stille des Handys): abgewiesen (${ipad.zu ? ipad.zu.code + " " + ipad.zu.grund : "nicht abgewiesen"})`);
  check(handy.ws.readyState === WebSocket.OPEN && !handy.zu, "Handy bleibt drin, wird nicht verdrängt");
  const z2 = await zone("ipadBBBB01"); check(!z2.drin && z2.zu && z2.zu.code === 4410, "iPad im Kampfgebiet: ebenso abgewiesen");
  const zo = await zone(undefined); check(!zo.drin && zo.zu && zo.zu.code === 4410, "Verbindung ohne Seitenkennung: abgewiesen");
  const v1 = await belegt("ipadBBBB01"), v2 = await belegt("handyAAAA01");
  check(v1.ok && v1.belegt === true && v1.rest === null, "„Ins Spiel“ auf dem iPad: /konto/belegt sagt belegt " + JSON.stringify(v1));
  check(v2.ok && v2.belegt === false, "… auf dem Handy selbst: frei " + JSON.stringify(v2));
  /* dasselbe Gerät verbindet neu (Funkloch, Neuladen): darf, die alte Verbindung geht */
  const handy2 = await welt("handyAAAA01"); await schlaf(300);
  check(handy2.drin && handy.zu && handy.zu.code === 4409, "Handy verbindet neu: darf hinein, alte Verbindung bekommt 4409");
  /* Verbindungsabbruch: erst nach der Frist frei */
  handy2.ws.terminate(); z1.ws.terminate(); await schlaf(500);
  const ipad2 = await welt("ipadBBBB01"); const rest = Number((/rest=(\d+)/.exec(ipad2.zu ? ipad2.zu.grund : "") || [])[1]);
  check(!ipad2.drin && ipad2.zu && ipad2.zu.code === 4410 && rest >= 2 && rest <= 4, `Nach dem Abbruch: iPad noch abgewiesen, mit Restzeit (${ipad2.zu && ipad2.zu.grund})`);
  const v3 = await belegt("ipadBBBB01"); check(v3.belegt === true && v3.rest >= 1 && v3.rest <= 4, "/konto/belegt nennt die Restzeit " + JSON.stringify(v3));
  const handy3 = await welt("handyAAAA01"); check(handy3.drin, "Während der Frist: das Handy selbst darf zurück");
  handy3.ws.terminate(); await schlaf(4500);
  const ipad3 = await welt("ipadBBBB01"); check(ipad3.drin, "Nach Ablauf der Frist: iPad kommt hinein");
  /* Abmelden: sofort frei */
  ipad3.ws.close(1000, "abmelden"); await zuWarten(ipad3); await schlaf(200);
  const handy4 = await welt("handyAAAA01"); check(handy4.drin, "iPad meldet sich ab → Handy kommt sofort hinein");
  /* zwei gleichzeitig */
  handy4.ws.close(1000, "abmelden"); await zuWarten(handy4); await schlaf(200);
  const [g1, g2] = await Promise.all([welt("gleichX0001"), welt("gleichY0001")]);
  check([g1, g2].filter((v) => v.drin).length === 1 && [g1, g2].some((v) => v.zu && v.zu.code === 4410), `Zwei Geräte gleichzeitig: genau eines kommt hinein (${g1.drin}/${g2.drin})`);
  for (const v of [g1, g2]) try { v.ws.close(); } catch { /* zu */ }
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").slice(-30).join("\n"));
console.log(f ? f + " Fehler" : "Ein Gerät: alles in Ordnung"); process.exit(f ? 1 : 0);
