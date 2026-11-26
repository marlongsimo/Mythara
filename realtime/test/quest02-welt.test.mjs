/*
 * Mythara – Quest 02 „Der stille Rain“ Ende zu Ende: echter Spielserver (server/dist/server.js), nachgebildete Supabase, zwei Spieler.
 * Anna spielt die Quest durch (Brida → Odo → Bruchstellen und Ruten → Odo → Mooshocker untersuchen → drei Mooshocker in der Osthof-Zone → Odo),
 * Ben sieht keinen Dialog; Abstand, Reihenfolge, Einmaligkeit, Fortschritt über eine neue Anmeldung, Belohnung genau einmal.
 * Aufruf: node test/quest02-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
import { QB, QUEST2 } from "./sim.gebaut.mjs";
/** Stände seit dem Baukasten (26.11.2026): die alten Namen übersetzt die Quest selbst */
const N = (alt) => QB.gueltig(QUEST2, alt);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", C = "00000000-0000-0000-0000-00000000c003";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B, ["tok_cora_" + "x".repeat(30)]: C }, NAME = { [A]: "Anna", [B]: "Ben", [C]: "Cora" };
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 }, quests: {}, skill_geschick: 11079266, skill_staerke: 11079266, skill_lp: 11079266, skill_defense: 11079266 },
  /* Cora: alter Stand „bereit“ (vor dem Baukasten gespeichert) und ein voller Rucksack */
  [C]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "schwert", inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: Array(24).fill("ritterschwert"), v: 2 }, quests: { osthof_der_stille_rain: { s: "bereit" } } },
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
  FEHLT.push(req.url); send(404, {}); }); }).listen(8799);
const FEHLT = [];
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8789", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8789/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, q1: null, q2: null, texte: [], dialoge: [], chat: [], zurueck: null, inv: null, boden: [], warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "quests") { s.q1 = (m.b || {}).die_gesperrte_strasse; s.q2 = (m.b || {}).osthof_der_stille_rain; } if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); if (m.t === "inventar") s.inv = m.inv; if (m.t === "zurueck") s.zurueck = m; if (m.t === "boden") s.boden = m.liste; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 3000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m));
const NPC = { jori: [6452.5, 6444.5], hagan: [6438.5, 6423.5], fenna: [6534.5, 6438.5], raban: [6442.5, 6643.5], othmar: [6451.5, 6688.5] };
const hin = async (s, id, d = 1) => { sende(s, { t: "pos", x: 0, y: 0, wx: NPC[id][0] + d, wy: NPC[id][1] }); await new Promise((r) => setTimeout(r, 120)); };
const rede = async (s, id) => { sende(s, { t: "rede", npc: id }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, id, a) => { sende(s, { t: "antwort", npc: id, a }); return warte(s, (m) => m.t === "dialog"); };

const NPC2 = { brida: [6452.5, 6462.5], odo: [6546.5, 6441.5], wenzel: [6544.5, 6443.5] };
const DINGE = { zaun1: [6556.5, 6428.5], zaun2: [6562.5, 6416.5], zaun3: [6560.5, 6409.5], rute1: [6543.5, 6437.5], rute2: [6551.5, 6435.5], rute3: [6559.5, 6431.5], rute4: [6566.5, 6426.5] };
const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await new Promise((r) => setTimeout(r, 120)); };
const q2warte = (s, soll) => warte(s, (m) => m.t === "quests" && (m.b || {}).osthof_der_stille_rain === soll, 1500);
const ding = async (s, id) => { const [x, y] = DINGE[id]; await stelle(s, x + 1, y); const n = s.texte.length; sende(s, { t: "qding", id, x: x + 1, y }); await warte(s, (m) => m.t === "qtext"); return s.texte[n]; };
try {
  const anna = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna, (m) => m.t === "quests"); const ben = await spieler("tok_ben__" + "x".repeat(30)); await warte(ben, (m) => m.t === "quests");
  check(anna.q2 === "" && ben.q2 === "", "Quest 2: beide ohne Stand");
  /* Odo vor dem Auftrag: verweist auf Brida */
  await stelle(anna, ...NPC2.odo); let d = await rede(anna, "odo"); check(d && d.dialog && /Brida/.test(d.dialog.zeilen[0].text), "Odo vor dem Auftrag: verweist an Brida in Waldmark");
  check(/nicht|Odo Kern/.test(await ding(anna, "zaun1")) && anna.q2 === "", "Bruchstelle vor dem Auftrag: zählt nicht");
  await stelle(anna, NPC2.brida[0] + 1, NPC2.brida[1]); d = await rede(anna, "brida"); check(d && d.dialog && d.dialog.name === "Brida Wegner" && d.dialog.antworten.some((a) => a.id === "annehmen"), "Brida bietet den Auftrag an");
  await stelle(ben, NPC2.brida[0] + 2, NPC2.brida[1]); await new Promise((r) => setTimeout(r, 200)); check(ben.dialoge.length === 0, "Ben daneben sieht keinen Dialog");
  d = await sag(anna, "brida", "gefahr"); check(d && d.zeilen && d.dialog, "Nachfrage: gefährliche Kreaturen?");
  await sag(anna, "brida", "annehmen"); await q2warte(anna, N("angenommen")); check(anna.q2 === N("angenommen") && HELD[A].quests.osthof_der_stille_rain.s === N("angenommen"), "Quest 2 angenommen (gespeichert)");
  check(ben.q2 === "", "Bens Stand bleibt leer");
  await stelle(anna, ...NPC2.odo); d = await rede(anna, "odo"); check(d && d.dialog && /Brida hat dich/.test(d.dialog.zeilen[0].text), "Odo begrüßt Anna am Hofrain");
  await sag(anna, "odo", "mooshocker"); await sag(anna, "odo", "auftrag"); await q2warte(anna, N("spuren_0_0")); check(anna.q2 === N("spuren_0_0"), "Auftrag: Bruchstellen und Ruten");
  /* Abstand */
  await stelle(anna, 6500.5, 6450.5); const n0 = anna.texte.length; sende(anna, { t: "qding", id: "zaun2", x: 6500.5, y: 6450.5 }); await warte(anna, (m) => m.t === "qtext");
  check(/näher/.test(anna.texte[n0]) && anna.q2 === N("spuren_0_0"), "Zu weit weg: zählt nicht");
  let t = await ding(anna, "zaun1"); await q2warte(anna, N("spuren_1_0")); check(/Wurzel/.test(t) && /1\/3/.test(t) && anna.q2 === N("spuren_1_0"), "Bruchstelle 1 untersucht (1/3)");
  t = await ding(anna, "zaun1"); check(/schon/.test(t) && anna.q2 === N("spuren_1_0"), "Dieselbe Stelle zählt nicht doppelt");
  await ding(anna, "rute3"); await q2warte(anna, N("spuren_1_4")); check(anna.q2 === N("spuren_1_4"), "Ruten in beliebiger Reihenfolge (1/4)");
  await ding(anna, "zaun2"); t = await ding(anna, "zaun3"); await q2warte(anna, N("spuren_7_4")); check(/Moosrain/.test(t), "Nach der dritten Bruchstelle: „Die Spuren führen zum Moosrain“");
  for (const r of ["rute1", "rute2"]) await ding(anna, r); await q2warte(anna, N("spuren_7_7")); t = await ding(anna, "rute4"); await q2warte(anna, N("abgabe")); check(anna.q2 === N("abgabe") && /4\/4/.test(t), "Alles beisammen: zurück zu Odo");
  /* Regionswechsel / Neuanmeldung verliert nichts */
  anna.ws.close(); await new Promise((r) => setTimeout(r, 300)); const anna2 = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna2, (m) => m.t === "quests");
  check(anna2.q2 === N("abgabe"), "Nach neuer Anmeldung: Stand bleibt erhalten");
  await stelle(anna2, ...NPC2.odo); await rede(anna2, "odo"); await sag(anna2, "odo", "abgeben"); await q2warte(anna2, N("beobachten")); check(anna2.q2 === N("beobachten"), "Ruten abgegeben: Mooshocker beobachten");
  /* Untersuchen: nur am Moosrain */
  await stelle(anna2, 6520.5, 6450.5); sende(anna2, { t: "untersucht", typ: "mooshocker", x: 6520.5, y: 6450.5 }); await new Promise((r) => setTimeout(r, 300)); check(anna2.q2 === N("beobachten"), "Untersuchen weit weg vom Moosrain zählt nicht");
  await stelle(anna2, 6576.5, 6412.5); sende(anna2, { t: "untersucht", typ: "mooshocker", x: 6576.5, y: 6412.5 }); await q2warte(anna2, N("kampf_0")); check(anna2.q2 === N("kampf_0"), "Mooshocker untersucht: Kampfphase (0/3)");
  /* Kämpfe in der Osthof-Zone (echte Simulation): Anna (Level 99) besiegt drei Mooshocker */
  const z = await new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8789/?kampf=welt_osthof&ort=welt_osthof&lx=79.5&ly=11.5", { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [] };
    ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token: "tok_anna_" + "x".repeat(30), geraet: "test-" + String("tok_anna_" + "x".repeat(30)).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); });
  await new Promise((r) => setTimeout(r, 1500));
  const moos = () => z.w.filter((w) => w[2] === "mooshocker" && !w[10]);
  check(moos().length === 7, `Am Moosrain stehen sieben Mooshocker (${moos().length})`);
  const passiv = z.ev.filter((e) => e.a === "hieb").length; check(passiv === 0, "Sie greifen nicht von selbst an");
  let siege = 0; const t0 = Date.now();
  while (siege < 3 && Date.now() - t0 < 120000) { const ich = z.w.find((w) => w[1] === 1); const ziel = moos().sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
    if (!ziel) break; z.ws.send(JSON.stringify({ t: "ziel", id: ziel[0] })); const id = ziel[0];
    for (let i = 0; i < 300; i++) { await new Promise((r) => setTimeout(r, 100)); if (z.ev.some((e) => e.a === "tot" && e.id === id)) { siege++; break; } } }
  await new Promise((r) => setTimeout(r, 600));
  check(siege === 3 && anna2.q2 === N("bereit") && HELD[A].quests.osthof_der_stille_rain.s === N("bereit"), `Drei Mooshocker besiegt: Stand „bereit“ (${siege} Siege in ${Math.round((Date.now() - t0) / 1000)} s, Stand ${anna2.q2})`);
  z.ws.close();
  const splitter0 = (HELD[A].inventar.rucksack || []).reduce((n, f) => n + (f && (f.g || f) === "splitter" ? (f.n || 1) : 0), 0);
  await stelle(anna2, ...NPC2.odo); await rede(anna2, "odo"); await sag(anna2, "odo", "wieder"); d = await sag(anna2, "odo", "lohn"); await q2warte(anna2, "fertig");
  check(d && d.ende && d.splitter === 20 && anna2.q2 === "fertig" && ABSCHLUSS.filter((a) => a.p_quest === "osthof_der_stille_rain").length === 1, "Abschluss bei Odo: 20 Splitter, Quest fertig");
  { const ab = ABSCHLUSS.find((x) => x.p_user === A && x.p_quest === "osthof_der_stille_rain"); check(ab && ab.v2 && ab.p_punkte === 1 && HELD[A].questpunkte === 1, `Gebucht über rpg_held_quest_abschluss_v2 mit 1 Questpunkt (${HELD[A].questpunkte})`); }
  await new Promise((r) => setTimeout(r, 2500)); /* das Inventar wird verzögert gespeichert */
  const splitter1 = (anna2.inv && anna2.inv.rucksack || []).reduce((n, f) => n + (f && (f.g || f) === "splitter" ? (f.n || 1) : 0), 0); check(splitter1 - splitter0 >= 20, `Splitter im Rucksack (+${splitter1 - splitter0})`);
  await rede(anna2, "odo"); d = await sag(anna2, "odo", "lohn"); check(!d || d.ende, "Zweiter Abschluss: nichts"); check(ABSCHLUSS.filter((a) => a.p_quest === "osthof_der_stille_rain").length === 1, "Die Belohnung gibt es genau einmal");
  check(HELD[A].quests.die_gesperrte_strasse === undefined, "Quest 01 bleibt unberührt");
  /* Cora: alter Stand wird übersetzt; voller Rucksack → der Lohn liegt neben ihr am Boden (nur für sie), nichts geht verloren */
  const cora = await spieler("tok_cora_" + "x".repeat(30)); await warte(cora, (m) => m.t === "quests", 4000);
  check(cora.q2 === N("bereit") && cora.q2 === "auftrag_2047_3", `Alter Stand „bereit“ wird beim Laden übersetzt (${cora.q2})`);
  await stelle(cora, ...NPC2.odo); await rede(cora, "odo"); d = await sag(cora, "odo", "lohn"); await q2warte(cora, "fertig");
  const bodenTxt = d && (d.zeilen || []).map((z) => z.text).join(" ");
  check(d && d.splitter === 20 && cora.q2 === "fertig" && ABSCHLUSS.filter((a) => a.p_user === C).length === 1 && /am Boden/.test(bodenTxt), "Voller Rucksack: Abschluss gebucht, Hinweis „liegt neben dir am Boden“");
  await new Promise((r) => setTimeout(r, 1500)); const amBoden = cora.boden.filter((x) => x.g === "splitter").reduce((n, x) => n + x.n, 0);
  check(amBoden === 20 && Math.hypot(cora.boden[0].x - (NPC2.odo[0] + 0), cora.boden[0].y - NPC2.odo[1]) < 3, `20 Splitter liegen bei ihr am Boden (${amBoden})`);
  await new Promise((r) => setTimeout(r, 300)); check(!(anna2.boden || []).some((x) => x.g === "splitter"), "Anna sieht Coras Splitter nicht");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close(); if (f) console.log("404:", [...new Set(FEHLT)].join(" ")); if (f) console.log(log.split("\n").slice(-30).join("\n"));
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Quest 02 „Der stille Rain“: alles in Ordnung"); process.exit(f ? 1 : 0);
