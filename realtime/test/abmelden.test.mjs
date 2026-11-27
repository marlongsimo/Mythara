/*
 * Mythara – Abmelden wie OSRS, mit dem echten Spielserver (server/dist/server.js) und nachgebildeter Supabase:
 *  · Verbindung weg im Kampf: der Held bleibt stehen und kämpft weiter (bis 10 s ohne Kampf, höchstens 60 s), dann geht er.
 *  · Dieselbe Seite verbindet neu (Funkloch, Neuladen) und übernimmt denselben Helden (keine zwei Helden); eine noch offene alte Verbindung bekommt 4409.
 *  · Ein anderes Gerät kommt nicht hinein (4410, Kontosperre sitz.ts – siehe ein-geraet.test.mjs).
 *  · Verbindung weg ohne Kampf: der Held geht sofort.
 * Aufruf: node test/abmelden.test.mjs   (nach node build.mjs; dauert gut eine Minute)
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
  if (/^\/rest\/v1\/rpc\/rpg_held_quest_abschluss(_v2)?$/.test(req.url)) { const a = JSON.parse(b); a.v2 = req.url.endsWith("_v2"); if (a.v2 && (HELD[a.p_user].quests[a.p_quest] || {}).s !== "fertig") HELD[a.p_user].questpunkte = (HELD[a.p_user].questpunkte || 0) + Math.min(10, a.p_punkte || 0); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: "fertig" }; ABSCHLUSS.push(a); return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true); /* Buchungen der Kampfzone (XP, Leben) */
  FEHLT.push(req.url); send(404, {}); }); }).listen(8798);
const FEHLT = [];
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, HAENGEN_MS: "12000", PORT: "8788", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const TOK = { anna: "tok_anna_" + "x".repeat(30), ben: "tok_ben__" + "x".repeat(30) };
function zone(token, lx, ly, geraet) { return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8788/?kampf=welt_osthof&ort=welt_osthof&lx=${lx}&ly=${ly}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [], namen: [], zu: null };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } if (m.t === "namen") Z.namen = m.liste; });
  ws.on("close", (code, grund) => { Z.zu = { code, grund: String(grund) }; });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet })); fertig(Z); }); }); }
const bens = (Z) => Z.namen.filter((n) => n.name === "Ben");
try {
  const anna = await zone(TOK.anna, 70.5, 14.5, "annaHandy01"); /* schaut zu */
  const BEN = "benHandy001"; const b1 = await zone(TOK.ben, 79.5, 11.5, BEN); await schlaf(1500);
  const id = b1.ich && b1.ich.id, moos = () => b1.w.filter((w) => w[2] === "mooshocker" && !w[10]), ich = b1.w.find((w) => w[0] === id);
  const ziel = moos().sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
  b1.ws.send(JSON.stringify({ t: "ziel", id: ziel[0] })); await schlaf(4000);
  check(b1.ev.some((e) => (e.a === "hieb" || e.a === "schaden" || e.a === "null" || e.a === "block") && (e.id === ziel[0] || e.id === id)), "Ben kämpft gegen einen Mooshocker");
  b1.ws.terminate(); await schlaf(3000); /* Verbindung bricht ab (Seite zu, Netz weg) */
  check(bens(anna).length === 1 && bens(anna)[0].id === id, `Verbindung weg im Kampf: Bens Held bleibt in der Welt (${bens(anna).length})`);
  /* ein anderes Gerät kommt nicht hinein – das Konto bleibt bis zur Frist belegt */
  const fremd = await zone(TOK.ben, 20.5, 20.5, "benIpad0001"); await schlaf(1500);
  check(fremd.zu && fremd.zu.code === 4410 && bens(anna).length === 1, `Anderes Gerät nach dem Abbruch: abgewiesen (${fremd.zu ? fremd.zu.code + " " + fremd.zu.grund : "nicht abgewiesen"})`);
  /* dieselbe Seite verbindet neu: übernimmt denselben Helden, an seiner Stelle – kein zweiter */
  const b2 = await zone(TOK.ben, 20.5, 20.5, BEN); await schlaf(1500);
  check(b2.ich && b2.ich.id === id && bens(anna).length === 1, `Dieselbe Seite verbindet neu und übernimmt denselben Helden (id ${b2.ich && b2.ich.id} = ${id}, ${bens(anna).length} Ben)`);
  const h2 = b2.w.find((w) => w[0] === id); check(h2 && Math.hypot(h2[4] - 20.5, h2[5] - 20.5) > 10, "… und er steht weiter am Moosrain, nicht an der Stelle des neuen Geräts");
  const b3 = await zone(TOK.ben, 79.5, 11.5, BEN); await schlaf(1500);
  check(b2.zu && b2.zu.code === 4409 && b3.ich && b3.ich.id === id && bens(anna).length === 1, `Dieselbe Seite noch einmal (zweiter Tab): die vorige Verbindung bekommt ${b2.zu ? b2.zu.code + " " + b2.zu.grund : "nichts"}, Held bleibt derselbe`);
  /* wieder in den Kampf, dann Abbruch: bleibt höchstens HAENGEN_MS (im Spiel 60 s, hier 12 s) */
  const z2 = moos()[0] || ziel; b3.ws.send(JSON.stringify({ t: "ziel", id: z2[0] })); await schlaf(2500); const t0 = Date.now(); b3.ws.terminate();
  await schlaf(5000); check(bens(anna).length === 1, "Erneut abgebrochen im Kampf: nach 5 s noch da");
  while (bens(anna).length && Date.now() - t0 < 25000) await schlaf(250);
  const s = (Date.now() - t0) / 1000; check(!bens(anna).length && s <= 14, `… und spätestens nach 12 s weg (nach ${s.toFixed(1)} s)`);
  /* ohne Kampf: sofort weg */
  const b4 = await zone(TOK.ben, 40.5, 30.5, BEN); await schlaf(1500); check(bens(anna).length === 1, "Ben wieder da (ohne Kampf)");
  const t1 = Date.now(); b4.ws.terminate(); while (bens(anna).length && Date.now() - t1 < 5000) await schlaf(100);
  check(!bens(anna).length && Date.now() - t1 < 1500, `Verbindung weg ohne Kampf: sofort weg (${Date.now() - t1} ms)`);
  anna.ws.close();
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").filter((l) => /Welt|Fehler|fehler/.test(l)).slice(-25).join("\n"));
console.log(f ? f + " Fehler" : "Abmelden: alles in Ordnung"); process.exit(f ? 1 : 0);
