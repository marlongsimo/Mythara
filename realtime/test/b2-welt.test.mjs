/*
 * Riftmere – Phase 3c Quest B2 „Wasser auf die Mühle“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Kai spielt B2 ganz (Überläufe, Tafeln, Bänder, Tau, Reihenfolge-Rätsel, Hanne, Tebbe); vorher und nachher: Werkbank im Schuppen, Wehrkolk, Hannes Mehl. Lea (ohne B2) als Gegenprobe.
 * Aufruf: node test/b2-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUESTS, xpFuer, FANGSTELLEN, REZEPTE, LAEDEN } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000b201", B = "00000000-0000-0000-0000-00000000b202";
const TA = "tok_kai__" + "x".repeat(30), TB = "tok_lea__" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B }, NAME = { [A]: "Kai", [B]: "Lea" };
const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const MERKER = ["schmieden"], viel = (g, n) => Array.from({ length: n }, () => g);
const HELD = {
  /* Kai: erfüllt die Voraussetzungen, hat alles für die Tafeln, Bänder und das Tau dabei (6 Tannen, 3 Eisenbarren, 4 Garn, Hammer), dazu Angelrute und Würmer */
  [A]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: ["hammer", "angelrute", { g: "wurm", n: 5 }, ...viel("stamm_tanne", 6), ...viel("barren_eisen", 3), { g: "garn", n: 4 }, { g: "splitter", n: 20 }], v: 2, merker: MERKER,
    berufe: { holzfaellerei: xpFuer(10), bergbau: xpFuer(10), handwerk: xpFuer(15), schmieden: xpFuer(15) } } },
  /* Lea: ohne Voraussetzungen */
  [B]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: [{ g: "splitter", n: 20 }], v: 2, merker: MERKER } } };
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
  send(404, {}); }); }).listen(8793);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8784", SUPABASE_URL: "http://localhost:8793", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  FISCH_KERN: "0", FISCH_FALL: "0", FISCH_WANDER_MS: "0", HANDWERK_GLUT: "0" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8784/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
  s = { ws, b: {}, punkte: 0, inv: null, chat: [], texte: [], dialoge: [], fisch: [], wurm: [], handwerk: [], getrunken: [], ruht: new Set(), wruht: new Set(), warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") { s.b = m.b || {}; s.punkte = m.punkte; } if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); for (const k of ["fisch", "wurm", "handwerk", "getrunken"]) if (m.t === k) s[k].push(m); if (m.t === "fanggruende") s.ruht = new Set((m.weg || []).map((w) => w[0])); if (m.t === "wurmacker") s.wruht = new Set((m.weg || []).map((w) => w[0]));
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
  await (s.handwerk.find((m) => m.tat === "stop") || warte(s, (m) => m.t === "handwerk" && m.tat === "stop", 90000)); await schlaf(300); return "ok"; }
const Q = QUESTS.find((q) => q.id === "weidenhain_wasser_auf_die_muehle"), O = (id) => Q.objekte.find((o) => o.id === id), F = (id) => Q.figuren.find((f) => f.id === id);
const WERKBANK = [6530.5, 6426.5], AMBOSS = [6470.4, 6427.6], SCHUPPEN = [6446, 6673.3]; /* vorn im Schuppen (herstellen rückt 1,2 nach Osten): nur von vorn bedienbar (#57, #64) */
const einsetzen = async (s, id) => { const o = O(id); await stelle(s, o.x, o.y - 1); return ding(s, id); };
const kaufen = async (s, laden, g) => { const n = s.chat.length; sende(s, { t: "kaufen", laden, g }); await schlaf(500); return s.chat.slice(n).join(" "); };
try {
  const kai = await spieler(TA), lea = await spieler(TB);
  for (const s of [kai, lea]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);
  check(Boolean(Q) && Q.drehen.some((d) => d.schalter === "wehr_heil"), "B2 ist im Spiel, das Mühlrad hängt am Schalter wehr_heil");

  console.log("Vor der Quest");
  await stelle(lea, F("tebbe").x + 1, F("tebbe").y); let d = await rede(lea, "tebbe"); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Lea (ohne Holz 10, Bergbau 10, Handwerk 15): kein Annehmen");
  check(/Wehr wieder hält|Tebbes Werkbank/.test(await herstellen(kai, ...SCHUPPEN, "garn")), "Werkbank in Tebbes Schuppen: gesperrt");
  { const z = FANGSTELLEN.filter((x) => x.grund === "wehrkolk")[0]; await stelle(kai, z.x + 1.2, z.y); kai.fisch = []; sende(kai, { t: "fisch", tat: "start", id: z.id }); const m = await warte(kai, (m) => m.t === "fisch" && (m.tat === "nein" || m.tat === "start")); sende(kai, { t: "fisch", tat: "stop" });
    check(m && (m.tat === "nein" && /Wehr|ruh|weiter|Fische/.test(m.text)), `Wehrkolk vor B2: keine Fische (${m && (m.text || m.tat)})`); }
  check(/leer|Mühle/.test(await (async () => { await stelle(kai, 6433.4, 6680.6); return kaufen(kai, "kornspeicher", "mehl"); })()), "Hanne verkauft noch kein Mehl");

  console.log("Quest");
  await stelle(kai, F("tebbe").x + 1, F("tebbe").y); await rede(kai, "tebbe"); await sag(kai, "tebbe", "annehmen"); await schlaf(500);
  check(stand(kai, Q).phase === "laeuft", "Kai nimmt an");
  { const t0 = await einsetzen(kai, "tafel_mitte"); check(/Ohne Schütztafel|Überl|Wehr/.test(t0) && !QB.erledigt(Q, kai.b[Q.id], "setzen_mitte"), "Ohne Tafel: nichts einzusetzen (" + t0.slice(0, 60) + ")"); }
  for (const u of ["ueberlauf_oben", "ueberlauf_mitte", "ueberlauf_unten"]) { const o = O(u); await stelle(kai, o.x, o.y - 1); await ding(kai, u); }
  check(["ueberlauf_oben", "ueberlauf_mitte", "ueberlauf_unten"].every((u) => QB.erledigt(Q, kai.b[Q.id], u)), "Drei Überläufe untersucht");
  check(await herstellen(kai, ...WERKBANK, "schuetztafel", 3) === "ok" && anzahl(kai, "schuetztafel") === 3, "Drei Schütztafeln an der Werkbank im Osthof (Quest-Rezept)");
  check(await herstellen(kai, ...AMBOSS, "eisenbaender", 3) === "ok" && anzahl(kai, "eisenband") === 6, `Sechs Eisenbänder am Amboss: 1 Barren → 2 Bänder (${anzahl(kai, "eisenband")})`);
  check(await herstellen(kai, ...WERKBANK, "hanftau") === "ok" && anzahl(kai, "hanftau") === 1, "Ein Hanftau aus vier Garn");
  check(["tafeln", "baender", "tau"].every((x) => QB.erledigt(Q, kai.b[Q.id], x)), "Schritte Tafeln, Bänder, Tau erledigt");
  let t = await einsetzen(kai, "tafel_oben");
  check(/So nicht/.test(t) && anzahl(kai, "schuetztafel") === 3 && anzahl(kai, "eisenband") === 6, "Falsche Reihenfolge (oben zuerst): nur ein Spritzer, nichts verloren");
  await einsetzen(kai, "tafel_mitte"); await einsetzen(kai, "tafel_unten"); t = await einsetzen(kai, "tafel_oben"); await schlaf(300);
  check(["setzen_mitte", "setzen_unten", "setzen_oben"].every((x) => QB.erledigt(Q, kai.b[Q.id], x)) && anzahl(kai, "schuetztafel") === 0 && anzahl(kai, "eisenband") === 0 && anzahl(kai, "hanftau") === 0, "Mitte, unten, oben: alle Tafeln sitzen (Tafeln, Bänder und Tau verbraucht)");
  const K0 = { hat: () => false, verloren: () => false }, an = (st) => [].concat(Q.schalter.wehr_heil).some((b) => QB.gilt(Q, st, b, K0));
  check(an(kai.b[Q.id]) && !an(lea.b[Q.id] || ""), "Schalter wehr_heil: bei Kai an, bei Lea aus (Mühlrad dreht nur bei Kai)");
  await stelle(kai, F("hanne").x + 1, F("hanne").y); await rede(kai, "hanne"); await sag(kai, "hanne", "bescheid"); await schlaf(300);
  await stelle(kai, F("tebbe").x + 1, F("tebbe").y); await rede(kai, "tebbe"); await sag(kai, "tebbe", "fertig"); await schlaf(800);
  const ab = ABSCHLUSS.find((a) => a.p_user === A && a.p_quest === Q.id);
  check(kai.b[Q.id] === "fertig" && ab && ab.p_punkte === 1 && anzahl(kai, "splitter") >= 320, `B2 fertig: 1 Questpunkt, 300 Splitter (${anzahl(kai, "splitter")})`);

  console.log("Nach der Quest");
  check(await herstellen(kai, ...SCHUPPEN, "garn") !== "?" && !/gesperrt|Wehr wieder hält|näher/.test(await herstellen(kai, ...SCHUPPEN, "garn")), "Werkbank in Tebbes Schuppen: jetzt nutzbar");
  check(/näher an die Werkbank/.test(await herstellen(kai, 6446.9 - 1.2, 6670.9, "garn")), "Werkbank in Tebbes Schuppen von hinten durch die Rückwand: nicht bedienbar (#57)");
  { const z = FANGSTELLEN.filter((x) => x.grund === "wehrkolk").find((x) => !kai.ruht.has(x.id)); await stelle(kai, z.x + 1.2, z.y); kai.fisch = []; sende(kai, { t: "fisch", tat: "start", id: z.id }); const m = await warte(kai, (m) => m.t === "fisch" && (m.tat === "nein" || m.tat === "start")); sende(kai, { t: "fisch", tat: "stop" });
    check(m && (m.tat === "start" || /Fischen 10/.test(m.text || "")), `Wehrkolk nach B2: Fische da (${m && (m.text || m.tat)})`); }
  { const z = FANGSTELLEN.filter((x) => x.grund === "wehrkolk").find((x) => !lea.ruht.has(x.id)); await stelle(lea, z.x + 1.2, z.y); lea.fisch = []; sende(lea, { t: "fisch", tat: "start", id: z.id }); const m = await warte(lea, (m) => m.t === "fisch" && (m.tat === "nein" || m.tat === "start")); sende(lea, { t: "fisch", tat: "stop" });
    check(m && m.tat === "nein" && /Wehr/.test(m.text), "… für Lea (ohne B2) weiterhin nicht"); }
  await stelle(kai, 6433.4, 6680.6); const vor = anzahl(kai, "mehl"); await kaufen(kai, "kornspeicher", "mehl"); await schlaf(300);
  check(anzahl(kai, "mehl") === vor + 1, "Hanne verkauft jetzt Mehl");
  check(REZEPTE.find((r) => r.id === "eisenbaender").menge === 2 && LAEDEN.kornspeicher.questFigur === "hanne", "Bausteine: Rezept mit Menge, Laden an der Questfigur");
  check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close();
console.log(f ? `${f} Fehler` : "Phase 3c „Wasser auf die Mühle“: alles in Ordnung"); process.exit(f ? 1 : 0);
