/*
 * Riftmere – Phase 3b „Fischen, Kochen, Wirkungen“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Fred (Anfänger) fängt Bachlinge mit Angelrute und Würmern, brät am Erntefeuer (manches brennt an). Gina gräbt Würmer, hat keine Angelrute.
 * Hugo (Fischen 25, Kochen 40) fängt Moorhechte mit der Reuse (Strömung lesen), schöpft Wasser, kocht Fischsuppe am Kessel und isst Eintopf und Suppe (Wirkungen).
 * Aufruf: node test/fischen-kochen-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUESTS, xpFuer, kampfwerte, FISCHE, FANGGRUENDE, FANGSTELLEN, WURMSTELLEN, WIRKUNGEN, wirkungDazu, skillPlus, brennChance, REZEPTE, LAEDEN, MONSTER, BERUFE, VERBRAUCH, GEG } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000f001", B = "00000000-0000-0000-0000-00000000f002", C = "00000000-0000-0000-0000-00000000f003", D = "00000000-0000-0000-0000-00000000f004", E = "00000000-0000-0000-0000-00000000f005";
const TA = "tok_fred_" + "x".repeat(30), TB = "tok_gina_" + "x".repeat(30), TC = "tok_hugo_" + "x".repeat(30), TD = "tok_ida__" + "x".repeat(30), TE = "tok_jule_" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B, [TC]: C, [TD]: D, [TE]: E }, NAME = { [A]: "Fred", [B]: "Gina", [C]: "Hugo", [D]: "Ida", [E]: "Jule" };
const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const MERKER = ["schmieden"], BALD = Date.now() + 120_000;
const roheFische = (n) => Array.from({ length: n }, () => "fisch_bachling_roh");
const HELD = {
  /* Fred: Anfänger – Angelrute, 3 Würmer, 16 rohe Bachlinge zum Kochen */
  [A]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: ["angelrute", { g: "wurm", n: 3 }, ...roheFische(16)], v: 2, merker: MERKER } },
  /* Gina: nichts dabei; hat eine abgelaufene und keine laufende Wirkung */
  [B]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: [], v: 2, merker: MERKER, wirkungen: [{ id: "fischsuppe", bis: Date.now() - 1000 }] } },
  /* Hugo: Fischen 25, Kochen 40, Reuse, Krug, Mühlbarsch, Eintopf; eine Fischsuppe wirkt noch (aus dem Speicher) */
  [C]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: ["reuse", "angelrute", "krug", "fisch_muehlbarsch_roh", "fisch_muehlbarsch_roh", "bauerneintopf", ...roheFische(6)], v: 2, merker: MERKER,
    berufe: { fischen: xpFuer(25), kochen: xpFuer(40) }, wirkungen: [{ id: "fischsuppe", bis: BALD }] } },
  /* Ida: spielt „Schilf und Schnur“ von vorn (nichts dabei) */
  [D]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: roheFische(3) /* Reserve, falls beim Braten alles anbrennt */, v: 2, merker: MERKER } },
  /* Jule: Kochen 50 (nichts brennt an), bringt Brot und Bachling mit; Suppe kocht sie in der Taverne */
  [E]: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: ["brot", "fisch_bachling_gebraten", "fisch_muehlbarsch_roh", "krug_wasser"], v: 2, merker: MERKER, berufe: { kochen: xpFuer(50) } } } };
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
  send(404, {}); }); }).listen(8791);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8790", SUPABASE_URL: "http://localhost:8791", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  FISCH_KERN: "1", FISCH_FALL: "0", WURM_FALL: "0", FISCH_WANDER_MS: "5000", WURM_WANDER_MS: "0", HANDWERK_GLUT: "0",
  HANDWERK_STELLEN: JSON.stringify([{ id: "kessel_test", station: "kessel", x: 6440, y: 6440, ort: "waldmark" }, { id: "kessel_zu", station: "kessel", x: 6450, y: 6462, ort: "waldmark", schalter: "taverne_kueche", gesperrt: "Die Küche der Taverne ist noch zu." }]) }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8790/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
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
const FEUER = [6442, 6687.25], BRUNNEN = [6448, 6432.85], KESSEL = [6440, 6440], KESSEL_ZU = [6450, 6462];
const aktiveStelle = (s, grund) => FANGSTELLEN.find((x) => x.grund === grund && !s.ruht.has(x.id));
/** fischen an einem Grund, bis n Stück dieses Fisches da sind; zieht mit den Fischen um (wandernde Stellen) */
async function fischen(s, grund, g, n, ms = 150000, strom = false) { const t0 = Date.now(); let z = null; s.fisch = [];
  const tip = strom ? setInterval(() => { if (s.fisch.some((m) => m.tat === "stroemung" && !m.getippt)) { for (const m of s.fisch) if (m.tat === "stroemung") m.getippt = true; sende(s, { t: "fisch", tat: "stroemung" }); } }, 50) : null;
  while (anzahl(s, g) < n && Date.now() - t0 < ms) {
    if (!z || s.ruht.has(z.id) || s.fisch.some((m) => m.tat === "stop" || m.tat === "nein")) { if (s.fisch.some((m) => m.tat === "nein" && !/weiter/.test(m.text || ""))) break;
      z = aktiveStelle(s, grund); s.fisch = []; await stelle(s, z.x + 1.2, z.y); sende(s, { t: "fisch", tat: "start", id: z.id }); }
    await schlaf(250); }
  if (tip) clearInterval(tip); sende(s, { t: "fisch", tat: "stop" }); await schlaf(300); return anzahl(s, g) >= n; }
const nein = async (s, t, id) => { s[t] = []; sende(s, { t, tat: "start", id }); const m = await warte(s, (m) => m.t === t && (m.tat === "nein" || m.tat === "start")); sende(s, { t, tat: "stop" }); await schlaf(200); return m && m.tat === "nein" ? m.text : ""; };
const essen = async (s, g) => { const i = s.inv.rucksack.findIndex((x) => (typeof x === "string" ? x : x.g) === g); sende(s, { t: "inv", tat: "trinken", i }); return warte(s, (m) => m.t === "getrunken" || (m.t === "chat" && m.kanal === "system"), 3000); };
try {
  const fred = await spieler(TA), gina = await spieler(TB), hugo = await spieler(TC), ida = await spieler(TD), jule = await spieler(TE);
  for (const s of [fred, gina, hugo, ida, jule]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);

  console.log("Wirkungen");
  { const x = { geschick: 0, staerke: 0, fernkampf: 0, magie: 0, lp: 0, defense: 0 }, an = { waffe: "trainingsschwert" };
    const ohne = kampfwerte(x, an, 1), mit = kampfwerte(x, an, 1, skillPlus(wirkungDazu([], "fischsuppe"))), drei = kampfwerte({ ...x, defense: xpFuer(3) }, an, 1);
    check(mit.abwehr.nah > ohne.abwehr.nah && mit.abwehr.nah === drei.abwehr.nah && mit.abwehr.fern === drei.abwehr.fern, `Fischsuppe: Abwehr im Kampf wie Defense +2 (${ohne.abwehr.nah} → ${mit.abwehr.nah}, Level 3: ${drei.abwehr.nah})`);
    const w = wirkungDazu(wirkungDazu([], "fischsuppe"), "bauerneintopf"); check(w.length === 1 && w[0].id === "bauerneintopf", "Neue Essens-Wirkung ersetzt die alte (eine je Art)"); }
  check(!(gina.inv.wirkungen || []).length, "Abgelaufene Wirkung aus dem Speicher fällt weg");
  check((hugo.inv.wirkungen || []).some((w) => w.id === "fischsuppe" && w.bis === BALD), "Laufende Wirkung bleibt über das Anmelden erhalten (Uhrzeit, nicht Spielzeit)");
  let r = await essen(hugo, "bauerneintopf");
  check(r && r.t === "getrunken" && r.n === 0 && r.wirkung === "bauerneintopf", `Eintopf mit vollem Leben: nur die Wirkung (${r && (r.text || r.wirkung)})`);
  await schlaf(300); check(hugo.inv.wirkungen.length === 1 && hugo.inv.wirkungen[0].id === "bauerneintopf" && hugo.inv.wirkungen[0].bis > Date.now() + 9 * 60_000, "Eintopf ersetzt die Fischsuppe, 10 Minuten");
  check(anzahl(hugo, "bauerneintopf") === 0, "Der Eintopf ist gegessen");
  await schlaf(1600);

  console.log("Würmer graben");
  const acker = () => WURMSTELLEN.filter((x) => !gina.wruht.has(x.id));
  check(acker().length === 3 && WURMSTELLEN.length === 8, `Wurmacker: 3 von 8 Stellen offen (${acker().length})`);
  { const z = WURMSTELLEN.find((x) => gina.wruht.has(x.id)); await stelle(gina, z.x + 1, z.y); check(/umgegraben/.test(await nein(gina, "wurm", z.id)), "Ruhende Ackerstelle: hier ist die Erde schon umgegraben"); }
  { const z = acker()[0]; await stelle(gina, z.x + 1, z.y); gina.wurm = []; sende(gina, { t: "wurm", tat: "start", id: z.id }); const t0 = Date.now();
    while (anzahl(gina, "wurm") < 3 && Date.now() - t0 < 30000) await schlaf(200); sende(gina, { t: "wurm", tat: "stop" }); await schlaf(300);
    check(anzahl(gina, "wurm") >= 3 && anzahl(gina, "splitter") === 0, `Ohne Werkzeug gegraben: ${anzahl(gina, "wurm")} Würmer, keine Splitter`); }

  console.log("Fischen");
  check(FANGGRUENDE.every((g) => FANGSTELLEN.filter((x) => x.grund === g.id && !fred.ruht.has(x.id)).length === g.aktiv), "Je Fanggrund sind genau „aktiv“ Stellen da");
  { const z = aktiveStelle(gina, "muehlgraben"); await stelle(gina, z.x + 1.2, z.y); check(/Angelrute/.test(await nein(gina, "fisch", z.id)), "Ohne Angelrute: kein Fischen"); }
  { const z = aktiveStelle(fred, "muehlgraben_unten"); await stelle(fred, z.x + 1.2, z.y); check(/Fischen 10/.test(await nein(fred, "fisch", z.id)), "Mühlbarsch erst ab Fischen 10"); }
  { const z = aktiveStelle(fred, "muehlgraben"); await stelle(fred, z.x + 6, z.y); check(/näher/.test(await nein(fred, "fisch", z.id)), "Zu weit vom Wasser"); }
  const ruhtVorher = [...fred.ruht].sort().join();
  const ok = await fischen(fred, "muehlgraben", "fisch_bachling_roh", 19); if (process.env.DBG) console.log(JSON.stringify(fred.fisch.slice(-6)), fred.chat.slice(-3));
  check(ok && anzahl(fred, "wurm") === 0, `Drei Bachlinge mit drei Würmern (${anzahl(fred, "fisch_bachling_roh") - 16} gefangen, ${anzahl(fred, "wurm")} Würmer übrig)`);
  check(((fred.inv.berufe || {}).fischen || 0) >= 60, `Fischen-XP: ${(fred.inv.berufe || {}).fischen} (20 je Bachling)`);
  check(fred.fisch.some((m) => m.tat === "stop" && m.grund === "koeder") || /Würmer/.test(fred.chat.join(" ")) || anzahl(fred, "wurm") === 0, "Würmer alle: das Fischen hört auf");
  { let t = ""; for (let i = 0; i < 5 && !/Ohne Wurm/.test(t); i++) { const z = aktiveStelle(fred, "muehlgraben"); await stelle(fred, z.x + 1.2, z.y); t = await nein(fred, "fisch", z.id); } /* die Stelle kann gerade weitergezogen sein (#69) */
    check(/Ohne Wurm/.test(t), "Ohne Würmer beißt nichts"); }
  check([...fred.ruht].sort().join() !== ruhtVorher, "Die Fische wandern: andere Stellen als am Anfang");
  check(FANGGRUENDE.every((g) => FANGSTELLEN.filter((x) => x.grund === g.id && !fred.ruht.has(x.id)).length === g.aktiv), "… und je Grund weiterhin genau „aktiv“ Stellen");
  { let t = ""; for (let i = 0; i < 5 && !/Ohne Wurm/.test(t); i++) { const z = aktiveStelle(hugo, "muehlgraben"); await stelle(hugo, z.x + 1.2, z.y); t = await nein(hugo, "fisch", z.id); }
    check(/Ohne Wurm/.test(t), "Hugo ohne Würmer: Bachling geht nicht (Angelrute braucht Köder)"); }
  const hechtVor = anzahl(hugo, "fisch_moorhecht_roh"), fV = (hugo.inv.berufe || {}).fischen;
  check(await fischen(hugo, "rabenmoor_steg", "fisch_moorhecht_roh", hechtVor + 3, 150000, true), `Moorhecht mit der Reuse, ohne Köder (${anzahl(hugo, "fisch_moorhecht_roh")})`);
  check(hugo.fisch.some((m) => m.tat === "fang" && m.stroemung && m.n === 2), "Strömung lesen: zwei Fische auf einmal");
  check(hugo.fisch.filter((m) => m.tat === "fang").every((m) => m.xp === 60 * m.n * (m.stroemung ? 1.5 : 1)), "XP je Moorhecht 60, mit Strömung +50 %");

  console.log("Kochen");
  check(/näher/.test(await herstellen(fred, 6470, 6690, "fisch_bachling_gebraten")), "Kochen nur am Feuer");
  const kVor = (fred.inv.berufe || {}).kochen || 0;
  check(await herstellen(fred, ...FEUER, "fisch_bachling_gebraten", 16) === "ok", "Am Erntefeuer: 16 Bachlinge braten");
  await schlaf(800); const gut = anzahl(fred, "fisch_bachling_gebraten"), schwarz = anzahl(fred, "fisch_bachling_verbrannt"); if (process.env.DBG) console.log("roh übrig", anzahl(fred, "fisch_bachling_roh"), fred.handwerk.filter((m) => m.tat === "fertig").length, JSON.stringify(fred.handwerk.filter((m) => m.tat !== "fertig" && m.tat !== "schlag")));
  check(gut + schwarz >= 16 && gut > 0 && schwarz > 0, `Kochen 1: manches brennt an (${gut} gebraten, ${schwarz} verbrannt)`);
  check((fred.inv.berufe || {}).kochen - kVor === gut * 30, `XP nur für Gelungenes: ${(fred.inv.berufe || {}).kochen - kVor} = ${gut} × 30`);
  check(fred.handwerk.filter((m) => m.tat === "fertig" && m.verbrannt).every((m) => m.xp === 0), "Verbrannt: keine XP");
  check(brennChance(1, REZEPTE.find((x) => x.id === "fisch_bachling_gebraten")) > 0.3 && brennChance(31, REZEPTE.find((x) => x.id === "fisch_bachling_gebraten")) === 0, "Anbrennen sinkt mit dem Level, ab +30 nie");
  check(await herstellen(hugo, ...FEUER, "fisch_bachling_gebraten", 6) === "ok" && anzahl(hugo, "fisch_bachling_gebraten") === 6 && anzahl(hugo, "fisch_bachling_verbrannt") === 0, "Kochen 40: kein Bachling brennt an");
  check(/Kochen 20/.test(await herstellen(fred, ...FEUER, "fisch_moorhecht_gebraten")), "Moorhecht braten erst ab Kochen 20");
  check(/Krug mit Wasser/.test(await herstellen(hugo, ...KESSEL, "fischsuppe")), "Suppe ohne Wasser: es fehlt der Krug mit Wasser");
  check(await herstellen(hugo, ...BRUNNEN, "krug_wasser") === "ok" && anzahl(hugo, "krug_wasser") === 1 && anzahl(hugo, "krug") === 0, "Am Brunnen: Krug mit Wasser gefüllt");
  check(/Taverne/.test(await herstellen(hugo, ...KESSEL_ZU, "fischsuppe")), "Kessel mit Schalter (Taverne): gesperrt");
  check(await herstellen(hugo, ...KESSEL, "fischsuppe") === "ok" && anzahl(hugo, "fischsuppe") + anzahl(hugo, "suppe_verbrannt") === 1, "Am Kessel: Fischsuppe aus Mühlbarsch und Wasser");
  if (anzahl(hugo, "fischsuppe")) { r = await essen(hugo, "fischsuppe"); await schlaf(300);
    check(r && r.wirkung === "fischsuppe" && hugo.inv.wirkungen.length === 1 && hugo.inv.wirkungen[0].id === "fischsuppe" && hugo.inv.wirkungen[0].bis > Date.now() + 4 * 60_000, "Fischsuppe gegessen: Defense +2 für 5 Minuten, ersetzt den Eintopf"); }
  r = await essen(fred, "fisch_bachling_gebraten"); check(r && /voll/.test(r.text || ""), "Gebratener Fisch bei vollem Leben bleibt im Rucksack");

  console.log("Quest „Schilf und Schnur“");
  { const Q = QUESTS.find((q) => q.id === "weidenhain_schilf_und_schnur"), L = Q.figuren[0]; check(Boolean(Q), "Die Quest ist im Spiel (shared/quests.ts)");
    await stelle(ida, L.x + 1, L.y); let d = await rede(ida, "lambert"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "annehmen"), "Lambert bietet die Quest an");
    await sag(ida, "lambert", "annehmen"); await schlaf(500); check(stand(ida, Q).phase === "laeuft" && anzahl(ida, "angelrute") === 1, "Angenommen – Lambert gibt seine alte Angelrute");
    await sag(ida, "lambert", "rute"); await schlaf(300); check(anzahl(ida, "angelrute") === 1, "Eine zweite Rute gibt es nicht");
    const z = WURMSTELLEN.find((x) => !ida.wruht.has(x.id)); await stelle(ida, z.x + 1, z.y); ida.wurm = []; sende(ida, { t: "wurm", tat: "start", id: z.id }); let t0 = Date.now();
    while (anzahl(ida, "wurm") < 3 && Date.now() - t0 < 30000) await schlaf(200); sende(ida, { t: "wurm", tat: "stop" }); await schlaf(400);
    check(QB.erledigt(Q, ida.b[Q.id], "wuermer"), `Drei Hände voll Würmer (${anzahl(ida, "wurm")})`);
    check(await fischen(ida, "muehlgraben", "fisch_bachling_roh", 6), "Drei Bachlinge aus dem Mühlgraben"); await schlaf(300);
    check(QB.erledigt(Q, ida.b[Q.id], "fang"), "Schritt „fang“ erledigt");
    for (let i = 0; i < 6 && !anzahl(ida, "fisch_bachling_gebraten"); i++) await herstellen(ida, ...FEUER, "fisch_bachling_gebraten");
    check(anzahl(ida, "fisch_bachling_gebraten") === 1 && QB.erledigt(Q, ida.b[Q.id], "braten"), `Ein Bachling gebraten (verbrannte zählen nicht: ${anzahl(ida, "fisch_bachling_verbrannt")})`);
    await stelle(ida, L.x + 1, L.y); await rede(ida, "lambert"); await sag(ida, "lambert", "abgeben"); await schlaf(800);
    const ab = ABSCHLUSS.find((a) => a.p_user === D && a.p_quest === Q.id);
    check(ida.b[Q.id] === "fertig" && ab && ab.p_punkte === 1 && anzahl(ida, "wurm") >= 20 && anzahl(ida, "fisch_bachling_gebraten") === 0, `Fertig: 1 Questpunkt, 20 Würmer (${anzahl(ida, "wurm")})`);
    check(((ida.inv.berufe || {}).fischen || 0) >= 250 + 60 && ((ida.inv.berufe || {}).kochen || 0) >= 120 + 30, `Lohn: Fischen- und Kochen-XP (${(ida.inv.berufe || {}).fischen} / ${(ida.inv.berufe || {}).kochen})`); }

  console.log("Quest „Die Taverne öffnet“");
  { const Q = QUESTS.find((q) => q.id === "waldmark_die_taverne_oeffnet"), H = Q.figuren[0], TK = [6428.5, 6426];
    check(Boolean(Q), "Die Quest ist im Spiel");
    check(/Wirtin/.test(await herstellen(jule, 6428.5, 6427.8 - 1.2, "fischsuppe")), "Vor der Quest: Hildes Kessel ist gesperrt");
    await stelle(jule, H.x + 1, H.y); await rede(jule, "hilde"); await sag(jule, "hilde", "annehmen"); await schlaf(500);
    check(stand(jule, Q).phase === "laeuft", "Angenommen (Kochen 10)");
    for (const a of ["brot_geben", "fisch_geben"]) { await rede(jule, "hilde"); await sag(jule, "hilde", a); await schlaf(300); }
    check(QB.erledigt(Q, jule.b[Q.id], "brot") && QB.erledigt(Q, jule.b[Q.id], "fisch") && !anzahl(jule, "brot"), "Brot und Bachling abgegeben");
    check(await herstellen(jule, 6428.5, 6427.8 - 1.2, "fischsuppe") === "ok" && anzahl(jule, "fischsuppe") === 1, "Fischsuppe am Kessel der Taverne (Schalter taverne_kueche an, solange die Quest läuft)");
    await stelle(jule, H.x + 1, H.y); await rede(jule, "hilde"); await sag(jule, "hilde", "suppe_geben"); await schlaf(300);
    await rede(jule, "hilde"); await sag(jule, "hilde", "aufmachen"); await schlaf(800);
    const ab = ABSCHLUSS.find((a) => a.p_user === E && a.p_quest === Q.id);
    check(jule.b[Q.id] === "fertig" && ab && ab.p_punkte === 1 && anzahl(jule, "splitter") >= 80, `Fertig: 1 Questpunkt, 80 Splitter (${anzahl(jule, "splitter")})`); }

  console.log("Bausteine");
  check(BERUFE.some((b) => b.id === "fischen") && BERUFE.some((b) => b.id === "kochen" && b.stationen.includes("feuer") && b.stationen.includes("kessel")), "Berufe Fischen und Kochen (Skill-Tab)");
  check(MONSTER.kuh.drops.some((d) => d.wurf.some((w) => w.g === "kuhfleisch" && w.chance === 100)), "Kuh: zweite Beute Kuhfleisch (100 %)");
  check(LAEDEN.handwerker.waren.some((w) => w.g === "angelrute") && LAEDEN.handwerker.waren.some((w) => w.g === "krug") && LAEDEN.baeckerei.waren.some((w) => w.g === "mehl"), "Händler: Angelrute und Krug; Grete: Mehl");
  check(REZEPTE.some((x) => x.id === "angelrute" && x.station === "werkbank" && x.level === 1) && REZEPTE.some((x) => x.id === "reuse" && x.level === 20), "Angelrute (Handwerk 1) und Reuse (Handwerk 20) an der Werkbank");
  check(Object.values(FISCHE).every((F) => GEG[F.ertrag] && GEG[F.ertrag.replace("_roh", "_gebraten")] && VERBRAUCH[F.ertrag.replace("_roh", "_gebraten")]), "Alle Fische roh, gebraten (Essen) und verbrannt");
  check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close();
console.log(f ? `${f} Fehler` : "Phase 3b „Fischen, Kochen, Wirkungen“: alles in Ordnung"); process.exit(f ? 1 : 0);
