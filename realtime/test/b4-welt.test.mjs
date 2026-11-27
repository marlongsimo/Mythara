/*
 * Riftmere – Phase 4 Quest B4 „Das rote Banner“ Ende zu Ende: echter Spielserver, nachgebildete Supabase, echte Kampfwelt im Unterschlupf.
 * Ida spielt B4 ganz: Gesa, Schlüsselbund, Kartentisch, Truhe, zwei Wellen in ihrer Kopie der Halle, Rotmantel in ihrer Kopie der Kammer (Ansage, Ruf), Brief, Banner, Waffe nach Wahl.
 * Danach steht Rotmantel öffentlich in der Kammer. Tom (ohne B3) als Gegenprobe.
 * Aufruf: node test/b4-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUESTS, LAEDEN } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000b401", B = "00000000-0000-0000-0000-00000000b402";
const TA = "tok_ida__" + "x".repeat(30), TB = "tok_tom__" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B }, NAME = { [A]: "Ida", [B]: "Tom" };
const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const B3FERTIG = { die_gesperrte_strasse: { s: "fertig" }, obstwiesen_fallobst: { s: "fertig" } };
const STARK = 11079266; /* Level 99 */
const HELD = {
  /* Ida: Level 99, B3 fertig – erfüllt B4 (Defense 20) */
  [A]: { ...roh(), quests: { ...B3FERTIG }, skill_geschick: STARK, skill_staerke: STARK, skill_lp: STARK, skill_defense: STARK, inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 50 }], v: 2 } },
  /* Tom: ohne B3 */
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
  send(404, {}); }); }).listen(8771);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8772", SUPABASE_URL: "http://localhost:8771", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  BUCHUNG_RUHE_MS: "500", HAENGEN_MS: "2000", KAMPF_RUHE_MS: "2000" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8772/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
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
const Q = QUESTS.find((q) => q.id === "westmark_das_rote_banner"), O = (id) => Q.objekte.find((o) => o.id === id), F = (id) => Q.figuren.find((f) => f.id === id);
const GEBIET = { weidenhain: [6400, 6656, "welt_weidenhain"], unterschlupf: [10240, 9600, "unterschlupf"], rotmantel_kammer: [10432, 9600, "welt_rotmantel_kammer"] };
const kampf = (token, wx, wy, r) => new Promise((fertig) => { const G = GEBIET[r], ws = new WebSocket(`ws://localhost:8772/?kampf=${G[2]}&ort=${G[2]}&lx=${wx - G[0]}&ly=${wy - G[1]}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); });
/** alle lebenden Gegner (Arten) bekämpfen, bis bis() stimmt; liefert die Zahl der Siege */
async function kaempfen(z, arten, bis, ms = 180000, nur = () => true) { let siege = 0; const t0 = Date.now();
  while (!bis(siege) && Date.now() - t0 < ms) { const ich = z.w.find((w) => w[1] === 1), lebt = z.w.filter((w) => arten.includes(w[2]) && !w[10] && nur(w));
    if (!ich || !lebt.length) { await schlaf(300); continue; } const ziel = lebt.sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
    const ab = z.ev.length; /* nur Tode nach dem Anvisieren zählen (wiedergekehrte Gegner behalten ihre Kennung) */
    z.ws.send(JSON.stringify({ t: "ziel", id: ziel[0] })); for (let i = 0; i < 400; i++) { await schlaf(100); if (z.ev.slice(ab).some((e) => e.a === "tot" && e.id === ziel[0])) { siege++; break; } if (bis(siege)) break; } }
  return siege; }
const aufheben = async (s, g, wx, wy) => { sende(s, { t: "pos", x: 0, y: 0, wx, wy }); await schlaf(1500); const d = s.boden.find((b) => b.g === g); if (!d) return false;
  await stelle(s, d.x, d.y); sende(s, { t: "aufheben", id: d.i }); await warte(s, (m) => m.t === "inventar", 2500); await schlaf(300); return anzahl(s, g) > 0; };
const erl = (s, x) => QB.erledigt(Q, s.b[Q.id] || "", x);
try {
  const ida = await spieler(TA), tom = await spieler(TB);
  for (const s of [ida, tom]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);
  check(Boolean(Q), "B4 „Das rote Banner“ ist im Spiel");

  console.log("Annehmen und Gesa");
  const OTH = F("othmar"); let zo = await kampf(TA, OTH.x + 1, OTH.y, "weidenhain"); await schlaf(1200);
  await stelle(tom, OTH.x + 1, OTH.y); let d = await rede(tom, "othmar"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Tom (ohne B3): Othmar bietet B4 nicht an");
  await stelle(ida, OTH.x + 1, OTH.y); d = await rede(ida, "othmar"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "annehmen"), "Ida: Othmar bietet B4 an (Figur in mehreren Quests)");
  await sag(ida, "othmar", "annehmen"); await schlaf(300); check(stand(ida, Q).phase === "laeuft", "Angenommen");
  zo.ws.close(); await schlaf(300);
  await stelle(ida, F("gesa_huette").x + 1, F("gesa_huette").y); await rede(ida, "gesa_huette"); await sag(ida, "gesa_huette", "bereit"); await schlaf(300); check(erl(ida, "gesa"), "Gesa an der Hütte getroffen");

  console.log("Wachstube, Kartentisch, Beutelager");
  await stelle(ida, 10273, 9631); let z = await kampf(TA, 10273, 9631, "unterschlupf"); await schlaf(1500);
  const s1 = await kaempfen(z, ["bandit_schlaeger"], (n) => n >= 1); await schlaf(800);
  check(s1 >= 1 && await aufheben(ida, "schluesselbund", 10273, 9631) && erl(ida, "schluessel"), "Ein Schläger der Wachstube trug den Schlüsselbund");
  { const o = O("b4_karte"); await stelle(ida, o.x + 1, o.y); await ding(ida, "b4_karte"); }
  { const o = O("b4_truhe"); await stelle(ida, o.x + 1, o.y); await ding(ida, "b4_truhe"); } await schlaf(300);
  check(erl(ida, "karte") && erl(ida, "truhe") && anzahl(ida, "silberleuchter") === 1, "Kartentisch gelesen, Silberleuchter aus der Truhe");
  z.ws.close(); await schlaf(3000); /* der Held der alten Verbindung hängt nach einem Kampf noch kurz (HAENGEN_MS) */

  console.log("Versammlungshalle (eigene Kopie, zwei Wellen)");
  await stelle(ida, 10302, 9638); z = await kampf(TA, 10302, 9638, "unterschlupf"); await schlaf(2000);
  const wv = () => z.w.filter((w) => ["bandit_schlaeger", "bandit_armbrust", "bandit_spaeher"].includes(w[2]) && !w[10]);
  { const t0 = Date.now(); while (wv().length !== 3 && Date.now() - t0 < 20000) await schlaf(250); } /* der Server setzt sie im nächsten Schritt in ihre Kopie */
  check(wv().length === 3, `In Idas Kopie der Halle: nur die erste Welle zu dritt, die übrige Bande sieht sie nicht (${wv().length} Gegner sichtbar)`);
  const inHalle = (w) => w[4] + 10240 >= 10290 && w[4] + 10240 <= 10316 && w[5] + 9600 >= 9616 && w[5] + 9600 <= 9648; /* nur Gegner in der Halle (Idas Kopie) */
  const s2 = await kaempfen(z, ["bandit_schlaeger", "bandit_armbrust", "bandit_spaeher"], () => QB.zaehler(Q, ida.b[Q.id] || "", "halle") >= 2, 240000, inHalle);
  check(erl(ida, "halle") && z.ev.filter((e) => e.a === "welle").length >= 1, `Beide Wellen besiegt (${s2} Siege, Zähler ${QB.zaehler(Q, ida.b[Q.id] || "", "halle")})`);
  z.ws.close(); await schlaf(3000);

  console.log("Rotmantel (eigene Kopie der Kammer)");
  await stelle(ida, 10448, 9624); z = await kampf(TA, 10448, 9624, "rotmantel_kammer"); await schlaf(2000);
  const rm = () => z.w.find((w) => w[2] === "rotmantel"); check(Boolean(rm()), "Rotmantel steht in Idas Kopie");
  const s3 = await kaempfen(z, ["rotmantel", "bandit_schlaeger"], () => z.ev.some((e) => e.a === "tot" && rm() && e.id === rm()[0]) || !rm() || rm()[10], 300000);
  const ans = z.ev.filter((e) => e.a === "ansage"), ruf = z.ev.some((e) => e.a === "bossphase"), boss = z.ev.some((e) => e.a === "boss" && e.typ === "rotmantel");
  check(ans.length >= 1 && ans.every((e) => e.name === "Rundumschlag" && e.felder.length === 8), `Rundumschlag mit Ansage (8 Felder leuchten): ${ans.length}×`);
  check(ruf && z.w.concat([]).length >= 0 && z.ev.some((e) => e.a === "bossphase" && /Leuten/.test(e.text || "")), "Bei 50 %: Rotmantel ruft nach seinen Leuten");
  check(boss && erl(ida, "rotmantel"), `Rotmantel besiegt (Bosszähler-Ereignis, ${s3} Siege)`);
  check(await aufheben(ida, "rabenbrief", 10448, 9614) && erl(ida, "brief"), "Der Brief mit dem Rabensiegel aufgehoben");
  z.ws.close(); await schlaf(400);
  { const o = O("b4_banner"); await stelle(ida, o.x + 1, o.y); await ding(ida, "b4_banner"); await schlaf(300); }
  check(erl(ida, "banner") && anzahl(ida, "rotes_banner") === 1, "Das rote Banner abgenommen");

  console.log("Othmar, Lohn, danach");
  zo = await kampf(TA, OTH.x + 1, OTH.y, "weidenhain"); await schlaf(1000);
  await stelle(ida, OTH.x + 1, OTH.y); await rede(ida, "othmar"); await sag(ida, "othmar", "zeigen"); const vorSp = anzahl(ida, "splitter");
  d = await sag(ida, "othmar", "wahl_schwert"); await schlaf(600); zo.ws.close();
  check(stand(ida, Q).phase === "fertig" && anzahl(ida, "eidschwert") === 1 && anzahl(ida, "rabenbrief") === 0 && anzahl(ida, "silberleuchter") === 0, "Abschluss: das seltene Schwert gewählt, Brief und Leuchter abgegeben");
  check(anzahl(ida, "splitter") === vorSp + 500 && ABSCHLUSS.some((a) => a.p_quest === Q.id && a.p_xp && a.p_xp.staerke === 1000), `Lohn: 500 Splitter, je 1.000 XP (Splitter +${anzahl(ida, "splitter") - vorSp})`);
  await schlaf(500); z = await kampf(TA, 10448, 9624, "rotmantel_kammer"); await schlaf(2000);
  check(z.w.some((w) => w[2] === "rotmantel" && !w[10]), "Danach steht Rotmantel öffentlich in der Kammer"); z.ws.close();
  check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close(); if (f) console.log(log.slice(-2000));
console.log(f ? `${f} Fehler` : "Phase 4 B4 „Das rote Banner“: alles in Ordnung"); process.exit(f ? 1 : 0);
