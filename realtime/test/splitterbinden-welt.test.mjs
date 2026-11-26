/*
 * Riftmere – Phase 3a „Splitterbinden und Wegstein“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Anna spielt B1 „Der Wegstein“ ganz (Quelle, Totholz der Linde, 250 Splitter, Werkbank, Erntefeuer, Agnes), lädt am Bindestein (Splitter, Seelenlicht, Resonanz),
 * fängt Seelenlichter (Wiesenlicht unter Stufe 10 gesperrt) und reist mit dem Wegstein (Ladung weg, Abklingzeit, gesperrtes Ziel).
 * Ben (B1 fertig, 99 Ladungen): höchstens 100, im Kampf schweigt der Stein. Cora (B1 fertig, leer): kein Teleport. Dora (ohne B1): Bindestein gesperrt.
 * Eva hat ihren Wegstein verloren: Agnes macht einen neuen, die Ladungen bleiben.
 * Aufruf: node test/splitterbinden-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUEST_A1, QUEST_A3, QUEST_B1, LADUNG_MAX, xpFuer } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", C = "00000000-0000-0000-0000-00000000c003", D = "00000000-0000-0000-0000-00000000d004", E = "00000000-0000-0000-0000-00000000e005";
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30), TC = "tok_cora_" + "x".repeat(30), TD = "tok_dora_" + "x".repeat(30), TE = "tok_eva__" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B, [TC]: C, [TD]: D, [TE]: E }, NAME = { [A]: "Anna", [B]: "Ben", [C]: "Cora", [D]: "Dora", [E]: "Eva" };
const roh = () => ({ geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "grau", hautfarbe: "hell", waffe: "bogen", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const MERKER = ["schmieden"], B1F = { die_gesperrte_strasse: { s: "fertig" }, [QUEST_B1.id]: { s: "fertig" } };
const HELD = {
  [A]: { ...roh(), inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: ["holzbeil_training", "hammer", { g: "splitter", n: 600 }], v: 2, berufe: { holzfaellerei: 200_000, handwerk: xpFuer(12) }, merker: MERKER } },
  [B]: { ...roh(), quests: { ...B1F, [QUEST_A1.id]: { s: "fertig" } }, inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: ["wegstein", { g: "splitter", n: 20 }], v: 2, merker: MERKER, ladungen: { wegstein: 99 } } },
  [C]: { ...roh(), quests: { ...B1F }, inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: ["wegstein"], v: 2, merker: MERKER } },
  [D]: { ...roh(), inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: ["wegstein", { g: "splitter", n: 20 }], v: 2, merker: MERKER } },
  [E]: { ...roh(), quests: { ...B1F }, inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: [], v: 2, merker: MERKER, ladungen: { wegstein: 7 } } } };
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
  send(404, {}); }); }).listen(8797);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8797", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  HOLZ_KERN: "0", BERG_KERN: "0", HOLZ_FALL: "0", BERG_FALL: "0", PFLANZE_FALL: "0", HANDWERK_GLUT: "1", WEGSTEIN_PAUSE_MS: "4000", LICHT_FALL: "0" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8787/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
  s = { ws, b: {}, punkte: 0, inv: null, chat: [], texte: [], dialoge: [], holz: [], berg: [], pflanze: [], licht: [], handwerk: [], wegstein: [], warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") { s.b = m.b || {}; s.punkte = m.punkte; } if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); for (const k of ["holz", "berg", "pflanze", "licht", "handwerk", "wegstein"]) if (m.t === k) s[k].push(m);
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const faecher = (s, g) => (s.inv.rucksack || []).filter((x) => (typeof x === "string" ? x : x.g) === g).length;
const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await schlaf(150); };
const rede = async (s, npc) => { sende(s, { t: "rede", npc }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, npc, a) => { sende(s, { t: "antwort", npc, a }); return warte(s, (m) => m.t === "dialog"); };
const ding = async (s, id) => { const n = s.texte.length; sende(s, { t: "qding", id }); await warte(s, (m) => m.t === "qtext", 2000); return s.texte[n] || ""; };
const stand = (s, q) => QB.lage(q, s.b[q.id] || "");
const zaehler = (s, q, id) => QB.zaehler(q, s.b[q.id] || "", id);
/** sammeln (Holz, Bergbau, Pflanze) bis n Stück dieses Ertrags im Rucksack sind */
async function sammeln(s, art, id, x, y, g, n, ms = 120000) { await stelle(s, x + 1.2, y); const t0 = Date.now(); s[art] = []; sende(s, { t: art, tat: "start", id });
  while (anzahl(s, g) < n && Date.now() - t0 < ms) { await schlaf(300); if (s[art].some((m) => m.tat === "stop" || m.tat === "nein")) { s[art] = []; sende(s, { t: art, tat: "start", id }); } }
  sende(s, { t: art, tat: "stop" }); await schlaf(300); return anzahl(s, g) >= n; }
async function herstellen(s, x, y, rezept, menge = 1) { if (x !== null) await stelle(s, x + 1.2, y); s.handwerk = []; sende(s, { t: "handwerk", tat: "start", rezept, menge });
  const a = (await warte(s, (m) => m.t === "handwerk" && (m.tat === "nein" || m.tat === "start"))) || {}; if (a.tat !== "start") return a.text || "?";
  await (s.handwerk.find((m) => m.tat === "stop") || warte(s, (m) => m.t === "handwerk" && m.tat === "stop", 30000)); await schlaf(300); return "ok"; }
const AGNES = [6450.5, 6681.6], QUELLE = [6567.8, 6696.4], FEUER = [6442, 6687.9], WERKBANK = [6530.5, 6426.5], BINDESTEIN = [6453.2, 6679.4], TOTHOLZ = [6446.5, 6677.5];
const lad = (s) => (s.inv && s.inv.ladungen && s.inv.ladungen.wegstein) || 0;
const reiben = async (s, ziel) => { sende(s, { t: "wegstein", ziel }); return (await warte(s, (m) => m.t === "wegstein")) || {}; };
/** Glut/Resonanz: jedes Fenster sofort antippen */
const resonanz = (s) => { const f = setInterval(() => { if (s.handwerk.some((m) => m.tat === "glut" && !m.getippt)) { for (const m of s.handwerk) if (m.tat === "glut") m.getippt = true; sende(s, { t: "handwerk", tat: "glut" }); } }, 50); return () => clearInterval(f); };
try {
  const anna = await spieler(TA), ben = await spieler(TB), cora = await spieler(TC), dora = await spieler(TD), eva = await spieler(TE);
  for (const s of [anna, ben, cora, dora, eva]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);

  console.log("B1 „Der Wegstein“");
  await stelle(dora, ...AGNES); let d = await rede(dora, "agnes"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Ohne Holzfällerei 15 und Handwerk 10: Agnes bietet die Quest noch nicht an");
  await stelle(anna, ...AGNES); d = await rede(anna, "agnes"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "annehmen"), "Anna (Voraussetzungen erfüllt): Agnes erzählt von den Wegsteinen");
  await sag(anna, "agnes", "annehmen"); await schlaf(400); check(stand(anna, QUEST_B1).phase === "laeuft", "Angenommen");
  await stelle(anna, ...QUELLE); let t = await ding(anna, "b1_quelle"); await schlaf(300);
  check(/glatten Stein/.test(t) && anzahl(anna, "quellstein") === 1 && anzahl(anna, "quellwasser") === 1, "Quelle der Obstwiesen: Quellstein und Quellwasser");
  check(await sammeln(anna, "holz", "linde_totholz_1", ...TOTHOLZ, "lindenspan", 1), "Totholz der Linde: ein Span"); await schlaf(300);
  check(QB.erledigt(QUEST_B1, anna.b[QUEST_B1.id], "span"), "Schritt „Span“ erledigt");
  await stelle(anna, ...AGNES); await rede(anna, "agnes"); await sag(anna, "agnes", "opfern"); await schlaf(400);
  check(anzahl(anna, "splitter") === 350 && anzahl(anna, "geweihter_splitter") === 1, `250 Splitter für die Wurzeln, ein geweihter Splitter (${anzahl(anna, "splitter")} übrig)`);
  check(await herstellen(anna, ...WERKBANK, "wegstein_ungeweiht") === "ok" && anzahl(anna, "wegstein_ungeweiht") === 1 && anzahl(anna, "quellstein") === 0, "Werkbank: Wegstein (ungeweiht) gefügt (Quest-Rezept, Handwerk 10)");
  await stelle(anna, ...FEUER); t = await ding(anna, "b1_feuer"); await schlaf(300);
  check(/Lindenblüten/.test(t) && anzahl(anna, "wegstein") === 1 && anzahl(anna, "quellwasser") === 0, "Erntefeuer: geweiht – der Wegstein");
  check(/noch warm|nicht|Agnes/i.test((await reiben(anna, "weidenhain_linde")).text || ""), "Vor dem Abschluss: das Ziel „Linde“ ist noch nicht frei");
  await stelle(anna, ...AGNES); await rede(anna, "agnes"); await sag(anna, "agnes", "abgeben"); await schlaf(700);
  const ab = ABSCHLUSS.find((a) => a.p_quest === QUEST_B1.id);
  check(anna.b[QUEST_B1.id] === "fertig" && ab && ab.p_xp.magie === 400 && ab.p_punkte === 1 && lad(anna) === 10, `B1 fertig: 400 Magie-XP, 1 Questpunkt, 10 Ladungen (${lad(anna)})`);
  check(((anna.inv.berufe || {}).splitterbinden || 0) >= 20, `Splitterbinden-XP aus dem ersten Laden (${(anna.inv.berufe || {}).splitterbinden})`);

  console.log("Bindestein");
  check(/Agnes/.test(await herstellen(dora, ...BINDESTEIN, "wegstein_laden")), "Dora (ohne B1): der Bindestein ist gesperrt");
  const vorS = anzahl(anna, "splitter"), vorXp = (anna.inv.berufe || {}).splitterbinden || 0;
  const aus = resonanz(anna); check(await herstellen(anna, ...BINDESTEIN, "wegstein_laden", 5) === "ok", "Anna lädt fünfmal am Bindestein"); aus();
  const fertigL = anna.handwerk.filter((m) => m.tat === "fertig"), extra = fertigL.filter((m) => m.glut).length;
  check(anzahl(anna, "splitter") === vorS - 10, `2 Splitter je Ladung (${vorS} → ${anzahl(anna, "splitter")})`);
  check(lad(anna) === 15 + extra && extra >= 1, `Resonanz: ${extra}× doppelt – ${lad(anna)} Ladungen für 10 Splitter`);
  check(((anna.inv.berufe || {}).splitterbinden || 0) > vorXp, `Splitterbinden-XP beim Laden (+${((anna.inv.berufe || {}).splitterbinden || 0) - vorXp})`);
  console.log("Seelenlichter");
  check(await sammeln(anna, "licht", "matt_1", 6448.5, 6679.5, "seelenlicht", 2), "Mattes Licht an der Linde: zwei Seelenlichter");
  await stelle(anna, 6228.5 + 1.2, 6428.5); sende(anna, { t: "licht", tat: "start", id: "wiese_1" }); const nl = await warte(anna, (m) => m.t === "licht" && m.tat === "nein");
  check(nl && /Splitterbinden 10/.test(nl.text), "Wiesenlicht unter Splitterbinden 10: gesperrt (" + (nl && nl.text) + ")");
  const vorL = lad(anna), vorS2 = anzahl(anna, "splitter");
  check(await herstellen(anna, ...BINDESTEIN, "wegstein_laden_licht", 1) === "ok" && anzahl(anna, "seelenlicht") === 1 && anzahl(anna, "splitter") === vorS2 - 1 && lad(anna) >= vorL + 1, "1 Splitter + 1 Seelenlicht → 1 Ladung");

  console.log("Wegstein");
  await stelle(anna, 6530.5, 6430.5); const vor = lad(anna); let w = await reiben(anna, "weidenhain_linde");
  check(w.ok && w.x === 6452.5 && w.y === 6684.5 && w.region === "weidenhain" && lad(anna) === vor - 1, `Reiben → Linde: Position vom Server, eine Ladung weniger (${vor} → ${lad(anna)})`);
  w = await reiben(anna, "weidenhain_linde"); check(!w.ok && /noch warm/.test(w.text || ""), "Gleich noch einmal: Abklingzeit (" + w.text + ")");
  await schlaf(4200); w = await reiben(anna, "osthof_muehle"); check(!w.ok && /Mühle/.test(w.text || ""), "Ziel Osthof ohne A3: gesperrt");
  w = await reiben(anna, "graufurt"); check(!w.ok, "Unbekanntes Ziel: abgelehnt");
  w = await reiben(cora, "weidenhain_linde"); check(!w.ok && /leer/.test(w.text || ""), "Cora (keine Ladung): der Stein ist leer");
  w = await reiben(dora, "weidenhain_linde"); check(!w.ok && /Agnes/.test(w.text || ""), "Dora (ohne B1): Ziel nicht frei");
  /* Ben: 99 Ladungen – mehr als 100 gehen nicht */
  const r = await herstellen(ben, ...BINDESTEIN, "wegstein_laden", 5); check(r === "ok" && lad(ben) === LADUNG_MAX, `Ben lädt: bei ${LADUNG_MAX} ist Schluss (${lad(ben)})`);
  check(/voll/.test(await herstellen(ben, ...BINDESTEIN, "wegstein_laden")), "Voller Stein: Laden abgelehnt");
  /* Ben im Kampf an der Zielscheibe: der Stein schweigt */
  const kampf = (token, lx, ly) => new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8787/?kampf=welt_waldmark&ort=welt_waldmark&lx=${lx}&ly=${ly}`, { origin: "http://localhost:8765" }), Z = { ws, w: [] };
    ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "z") Z.w = m.z.w; });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); });
  const zb = await kampf(TB, 33.5, 57); await schlaf(1500); const sch = zb.w.find((x) => x[2] === "zielscheibe");
  if (sch) { zb.ws.send(JSON.stringify({ t: "ziel", id: sch[0] })); await schlaf(3000); }
  w = await reiben(ben, "weidenhain_linde"); check(sch && !w.ok && /Kampf/.test(w.text || ""), "Ben schießt auf die Zielscheibe: „Mitten im Kampf schweigt der Stein.“");
  zb.ws.send(JSON.stringify({ t: "ziel", id: 0 })); zb.ws.close();
  /* Eva: Wegstein verloren – Agnes macht einen neuen, die Ladungen bleiben */
  await stelle(eva, ...AGNES); d = await rede(eva, "agnes"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "neuer"), "Eva ohne Wegstein: Agnes bietet einen neuen an");
  await sag(eva, "agnes", "neuer"); await schlaf(400); check(anzahl(eva, "wegstein") === 1 && lad(eva) === 7, `Neuer Wegstein, die 7 Ladungen sind noch da (${lad(eva)})`);
  /* Gespeichert: Ladungen im Inventar (nachgebildete Datenbank) */
  await schlaf(2500); check((HELD[A].inventar.ladungen || {}).wegstein === lad(anna), `Ladungen im gespeicherten Inventar (${JSON.stringify(HELD[A].inventar.ladungen)})`);
} catch (e) { console.log("✗ Abbruch: " + e.message); f++; console.log(log.slice(-1500)); }
srv.kill(); sb.close();
console.log(f ? `${f} Fehler` : "Phase 3a „Splitterbinden und Wegstein“: alles in Ordnung"); process.exit(f ? 1 : 0);
