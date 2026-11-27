/*
 * Riftmere – Phase 2 „Waldland“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Anna spielt A1 (Flachs, Sehnen, Eichen, Wachbögen, Zielscheibe in der Kampfwelt), den Anfang von A2 (Obelisk, Köhler, Gruft) und A3 ganz
 * (Kupfer, Eichen, Esse, Amboss, Mühle, Mehl, Grete). Dora steigt mit drei Steintafel-Bruchstücken in A2 ein (ordnen, Abschluss, Kapelle).
 * Ben (Fernkampf 12, A1 fertig) lernt an der Zielscheibe nichts mehr. Bäckerei zu/offen, Brot heilt 4 und stapelt nicht.
 * Aufruf: node test/waldland-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUEST_A1, QUEST_A2, QUEST_A3, xpFuer } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", D = "00000000-0000-0000-0000-00000000d004";
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30), TD = "tok_dora_" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B, [TD]: D }, NAME = { [A]: "Anna", [B]: "Ben", [D]: "Dora" };
const roh = () => ({ geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "grau", hautfarbe: "hell", waffe: "bogen", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const BERUFE = { holzfaellerei: 200_000, bergbau: 200_000 }, MERKER = ["schmieden"];
const HELD = {
  [A]: { ...roh(), inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: ["hammer", "spitzhacke_training"], v: 2, berufe: { ...BERUFE }, merker: MERKER } },
  [B]: { ...roh(), skill_fernkampf: xpFuer(12), quests: { die_gesperrte_strasse: { s: "fertig" }, [QUEST_A1.id]: { s: "fertig" } }, inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: [], v: 2, merker: MERKER } },
  [D]: { ...roh(), lp_stand: { lp: 3, z: Date.now() / 1000 }, quests: { die_gesperrte_strasse: { s: "fertig" }, [QUEST_A2.id]: { s: "auftrag_7" } },
    inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: [{ g: "steintafel", n: 3 }, "wappenabrieb"], v: 2, merker: MERKER } } };
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
  send(404, {}); }); }).listen(8796);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, HOLZ_TAKT_MS: "400", BERG_TAKT_MS: "400", PFLANZE_TAKT_MS: "400", HANDWERK_TICK_MS: "100", PORT: "8786", SUPABASE_URL: "http://localhost:8796", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  HOLZ_KERN: "0", BERG_KERN: "0", HOLZ_FALL: "0", BERG_FALL: "0", PFLANZE_FALL: "0", HANDWERK_GLUT: "0" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8786/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
  s = { ws, b: {}, punkte: 0, inv: null, chat: [], texte: [], dialoge: [], holz: [], berg: [], pflanze: [], handwerk: [], warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") { s.b = m.b || {}; s.punkte = m.punkte; } if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); for (const k of ["holz", "berg", "pflanze", "handwerk"]) if (m.t === k) s[k].push(m);
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
const WERKBANK = [6530.5, 6426.5], ESSE = [6467.4, 6427.8], AMBOSS = [6470.4, 6427.6], GESA = [6445.2, 6458.6], ANSELM = [6457.5, 6423.6], ULF = [6360.5, 6428.5], TILL = [6564.5, 6425.5], GRETE = [6454.5, 6451.8];
try {
  const anna = await spieler(TA), ben = await spieler(TB), dora = await spieler(TD);
  await warte(anna, (m) => m.t === "inventar"); await warte(dora, (m) => m.t === "inventar"); await schlaf(400);

  console.log("A1 „Sehnen für den Wachturm“");
  await stelle(anna, ...GESA); let d = await rede(anna, "gesa"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "annehmen"), "Gesa Brandt am Südtor bietet den Auftrag an");
  d = await sag(anna, "gesa", "annehmen"); await schlaf(400); check(stand(anna, QUEST_A1).phase === "laeuft" && anzahl(anna, "holzbeil_training") === 1, "Angenommen; Gesa gibt das fehlende Beil");
  check(await sammeln(anna, "pflanze", "flachs_1", 6506.5, 6412.5, "flachs", 2), "Zwei Flachs gepflückt"); await schlaf(300);
  check(zaehler(anna, QUEST_A1, "flachs") === 2, `Schritt „Flachs“ erledigt (${anna.b[QUEST_A1.id]})`);
  check(await herstellen(anna, ...WERKBANK, "bogensehne", 2) === "ok" && zaehler(anna, QUEST_A1, "sehnen") === 2, "Zwei Bogensehnen an der Werkbank (2/2)");
  check(await sammeln(anna, "holz", "eiche_11", 6411.5, 6477.5, "stamm_eiche", 2), "Zwei Eichen gefällt"); await schlaf(300);
  check(zaehler(anna, QUEST_A1, "eichen") === 2, "Schritt „Eichen“ erledigt (2/2)");
  check(await herstellen(anna, ...WERKBANK, "wachbogen_ungespannt") === "ok" && await herstellen(anna, ...WERKBANK, "wachbogen_ungespannt") === "ok" && anzahl(anna, "wachbogen_ungespannt") === 2, "Quest-Rezept: zwei Wachbögen geschnitzt");
  check(/genug/.test(await herstellen(anna, ...WERKBANK, "wachbogen_ungespannt")), "Ein dritter Wachbogen: abgelehnt");
  check(await herstellen(anna, null, null, "wachbogen") === "ok" && await herstellen(anna, null, null, "wachbogen") === "ok" && anzahl(anna, "wachbogen") === 2, "Im Rucksack bespannt: zwei Wachbögen");
  check(QB.moeglich(QUEST_A1, anna.b[QUEST_A1.id], "schiessen"), "Jetzt: fünf Treffer an der Zielscheibe");
  /* Kampfwelt: Anna schießt mit dem Bogen auf eine Zielscheibe am Südtor */
  const kampf = (token, lx, ly) => new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8786/?kampf=welt_waldmark&ort=welt_waldmark&lx=${lx}&ly=${ly}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [] };
    ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(Z); }); });
  const za = await kampf(TA, 36.5, 57); await schlaf(1500);
  const scheiben = za.w.filter((w) => w[2] === "zielscheibe"); check(scheiben.length === 2, `Zwei Zielscheiben am Südtor (${scheiben.length})`);
  if (scheiben[0]) { za.ws.send(JSON.stringify({ t: "ziel", id: scheiben[0][0] })); const t0 = Date.now(); while (zaehler(anna, QUEST_A1, "schiessen") < 5 && Date.now() - t0 < 60000) await schlaf(300); }
  za.ws.send(JSON.stringify({ t: "ziel", id: 0 })); await schlaf(1500);
  const sch = za.w.find((w) => w[2] === "zielscheibe"); check(zaehler(anna, QUEST_A1, "schiessen") === 5 && QB.lage(QUEST_A1, anna.b[QUEST_A1.id]).bits === (1 << QUEST_A1.schritte.length) - 1, `Fünf Treffer gezählt (${anna.b[QUEST_A1.id]})`);
  check(sch && !za.ev.some((e) => e.a === "tot" && e.id === sch[0]) && !za.ev.some((e) => e.a === "hieb" && e.id === sch[0]), "Die Zielscheibe fällt nie und greift nicht an");
  const fernXp = () => GUTSCHRIFT.filter((g) => g.p_user === A).reduce((n, g) => n + (g.p_fernkampf || 0), 0); { const t0 = Date.now(); while (!fernXp() && Date.now() - t0 < 15000) await schlaf(200); } /* warten, bis gebucht ist (#27) */ const fernA = GUTSCHRIFT.filter((g) => g.p_user === A).reduce((n, g) => n + (g.p_fernkampf || 0), 0); check(fernA > 0, `Unter Fernkampf 10: Fernkampf-XP an der Scheibe (${fernA})`);
  za.ws.close();
  await stelle(anna, ...GESA); await rede(anna, "gesa"); d = await sag(anna, "gesa", "abgeben"); await schlaf(600);
  const abA1 = ABSCHLUSS.find((a) => a.p_quest === QUEST_A1.id);
  check(anna.b[QUEST_A1.id] === "fertig" && abA1 && abA1.p_xp.fernkampf === 300 && abA1.p_punkte === 1 && anzahl(anna, "wachbogen") === 1 && anzahl(anna, "splitter") >= 40, `A1 fertig: ein Wachbogen bleibt, 300 Fernkampf-XP, 40 Splitter, 1 Questpunkt (${anna.punkte})`);
  /* Ben: Fernkampf 12, A1 fertig – an der Scheibe keine XP, Hinweis */
  const zb = await kampf(TB, 33.5, 57); await schlaf(1500); const sb2 = zb.w.find((w) => w[2] === "zielscheibe"); const vorB = GUTSCHRIFT.length;
  if (sb2) { { const t0 = Date.now(); while ((!zb.ich || zb.ich.zielId !== sb2[0]) && Date.now() - t0 < 20000) { zb.ws.send(JSON.stringify({ t: "ziel", id: sb2[0] })); await schlaf(500); } } /* die Scheibe gilt noch kurz als „im Kampf mit Anna“ */ { const t0 = Date.now(); while (!ben.chat.some((t) => /nichts mehr/.test(t)) && Date.now() - t0 < 15000) await schlaf(200); } await schlaf(2000); zb.ws.send(JSON.stringify({ t: "ziel", id: 0 })); }
  await schlaf(2500); /* Buchungsruhe 0,8 s: was gebucht würde, wäre jetzt da */ const fernB = GUTSCHRIFT.slice(vorB).filter((g) => g.p_user === B).reduce((n, g) => n + (g.p_fernkampf || 0), 0);
  check(fernB === 0 && ben.chat.some((t) => /nichts mehr/.test(t)), `Über Fernkampf 10: keine XP, „Hier lernst du nichts mehr.“ (${fernB})`); zb.ws.close();
  /* #55: Dora (ohne A1) – für sie gibt es die Zielscheibe nicht: antippen, Fähigkeit darauf → kein Ziel, kein Treffer, keine Trefferzahl, kein Hinweis */
  { const zd = await kampf(TD, 36.5, 57); await schlaf(1500); const sd = zd.w.find((w) => w[2] === "zielscheibe"), c0 = dora.chat.length, e0 = zd.ev.length;
    if (sd) { zd.ws.send(JSON.stringify({ t: "ziel", id: sd[0] })); await schlaf(300); zd.ws.send(JSON.stringify({ t: "faehig", taste: "q", x: sd[4], y: sd[5] })); await schlaf(4000); }
    const ich = zd.ich && zd.ich.id, ev = zd.ev.slice(e0).filter((e) => (e.a === "treffer" && e.von === ich) || ((e.a === "schaden" || e.a === "null") && sd && e.id === sd[0]));
    check(sd && zd.ich && !zd.ich.zielId && ev.length === 0 && !dora.chat.slice(c0).some((t) => /nur üben/.test(t)), `Ohne Freigabe: die Zielscheibe wird kein Ziel, keine Treffer, kein Hinweis (Ziel ${zd.ich && zd.ich.zielId}, ${ev.length} Ereignisse)`); zd.ws.close(); }

  console.log("A2 „Das Wappen mit dem Turm“");
  await stelle(anna, ...ANSELM); await rede(anna, "anselm"); await sag(anna, "anselm", "annehmen"); await schlaf(400);
  check(stand(anna, QUEST_A2).phase === "laeuft" && anzahl(anna, "pergament") === 1, "Bruder Anselm: angenommen, ein leeres Pergament");
  await stelle(anna, 6373.5, 6375.5); let t = await ding(anna, "a2_obelisk"); check(/ausgekratzt/.test(t) && QB.erledigt(QUEST_A2, anna.b[QUEST_A2.id], "obelisk"), "Obelisk untersucht: „Die Zahl der Gefallenen ist ausgekratzt.“");
  await stelle(anna, 6373.5, 6362.5); t = await ding(anna, "a2_gruft"); check(/Gruft|Kohle/.test(t) && !QB.erledigt(QUEST_A2, anna.b[QUEST_A2.id], "abrieb"), "Gruft ohne Kohle: noch kein Abrieb");
  check(await sammeln(anna, "holz", "eiche_11", 6411.5, 6477.5, "stamm_eiche", 3), "Drei Eichenstämme für den Meiler");
  await stelle(anna, ...ULF); d = await rede(anna, "ulf"); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "eichen"), "Köhler Ulf will drei Eichen");
  d = await sag(anna, "ulf", "eichen"); await schlaf(400); check(anzahl(anna, "kohle") === 1 && anzahl(anna, "stamm_eiche") === 0 && d.zeilen.some((z) => /Schwarzen/.test(z.text)), "Drei Eichen gegen Kohle – und die Sage von den Schwarzen über dem Moor");
  await stelle(anna, 6373.5, 6362.5); t = await ding(anna, "a2_gruft"); await schlaf(400);
  check(/drei Wellen/.test(t) && anzahl(anna, "wappenabrieb") === 1 && anzahl(anna, "kohle") === 0 && anzahl(anna, "pergament") === 0, "An der Gruft: Wappenabrieb (Turm über drei Wellen)");
  check(QB.gilt(QUEST_A2, anna.b[QUEST_A2.id], QUEST_A2.beute.a2_steintafel), "Jetzt fallen Steintafel-Bruchstücke bei Waldgolems (nur in diesem Schritt)");
  /* Dora: schon drei Bruchstücke dabei → zählen sofort */
  await stelle(dora, ...ANSELM); d = await rede(dora, "anselm"); await schlaf(300);
  check(zaehler(dora, QUEST_A2, "tafeln") === 3, `Dora hatte die Bruchstücke schon dabei: 3/3 (${dora.b[QUEST_A2.id]})`); check(d && d.dialog && ["legen_a", "legen_b", "legen_c"].every((x) => d.dialog.antworten.some((a) => a.id === x)), "Anselm: die Bruchstücke ordnen (drei Möglichkeiten)");
  d = await sag(dora, "anselm", "legen_a"); check(d && d.dialog && !QB.erledigt(QUEST_A2, dora.b[QUEST_A2.id], "ordnen"), "Falsche Reihenfolge: freundlicher Hinweis, noch einmal");
  d = await sag(dora, "anselm", "legen_b"); await schlaf(400); check(QB.erledigt(QUEST_A2, dora.b[QUEST_A2.id], "ordnen") && anzahl(dora, "steintafel") === 0 && d.zeilen.some((z) => /schwarzer Schnee/.test(z.text)), "Richtig gelegt: „…und die Federn fielen wie schwarzer Schnee.“");
  sende(dora, { t: "beten" }); await schlaf(500); check(dora.chat.some((x) => /verschlossen/.test(x)), "Kapelle vor dem Abschluss: verschlossen");
  await rede(dora, "anselm"); d = await sag(dora, "anselm", "abschluss"); await schlaf(600);
  const abA2 = ABSCHLUSS.find((a) => a.p_quest === QUEST_A2.id); check(dora.b[QUEST_A2.id] === "fertig" && abA2 && abA2.p_xp.staerke === 300 && abA2.p_xp.defense === 300 && abA2.p_xp.lp === 200 && anzahl(dora, "splitter") === 60, "A2 fertig: 300 Stärke, 300 Defense, 200 LP-XP, 60 Splitter");
  await stelle(dora, 6457, 6423.5); const n0 = dora.chat.length; sende(dora, { t: "beten" }); await schlaf(600);
  check(dora.chat.slice(n0).some((x) => /Wunden schließen/.test(x)) && HELD[D].lp_stand === null, "Beten in der Kapelle heilt (LP voll)");
  HELD[D].lp_stand = null; sende(dora, { t: "beten" }); await schlaf(500); check(dora.chat.slice(n0).some((x) => /eben erst gebetet/.test(x)), "Zweites Beten binnen 10 Minuten: abgelehnt (Server)");
  sende(anna, { t: "beten" }); await schlaf(300); await stelle(anna, 6457, 6423.5); const n1 = anna.chat.length; sende(anna, { t: "beten" }); await schlaf(500); check(anna.chat.slice(n1).some((x) => /verschlossen/.test(x)), "Anna ohne A2: Kapelle verschlossen");

  console.log("A3 „Die Mühle steht still“");
  await stelle(anna, ...GRETE); sende(anna, { t: "kaufen", laden: "baeckerei", g: "brot" }); await schlaf(500); check(anna.chat.some((x) => /Bäckerei hat geschlossen/.test(x)) && anzahl(anna, "brot") === 0, "Bäckerei ohne A3: geschlossen");
  await stelle(anna, ...TILL); await rede(anna, "till"); await sag(anna, "till", "annehmen"); await schlaf(300); check(stand(anna, QUEST_A3).phase === "laeuft", "Till Mahler: angenommen");
  check(await sammeln(anna, "berg", "kupfer_1", 6441.5, 6475.5, "erz_kupfer", 4), "Vier Kupfererz in der Senke"); await schlaf(300); check(zaehler(anna, QUEST_A3, "kupfer") === 4, "Schritt „Kupfer“ (4/4)");
  check(await sammeln(anna, "holz", "eiche_11", 6411.5, 6477.5, "stamm_eiche", 2), "Zwei Eichen fürs Feuer");
  check(await herstellen(anna, ...ESSE, "barren_kupfer", 2) === "ok" && anzahl(anna, "barren_kupfer") === 2 && zaehler(anna, QUEST_A3, "barren") === 2, "Zwei Kupferbarren an der Esse (Schmieden-XP)");
  check(await herstellen(anna, ...AMBOSS, "muehlenachslager") === "ok" && anzahl(anna, "muehlenachslager") === 1, "Mühlenachslager am Amboss (Quest-Rezept)");
  await stelle(anna, 6566.5, 6425); t = await ding(anna, "a3_muehle"); await schlaf(400); check(/dreht sich wieder/.test(t) && anzahl(anna, "muehlenachslager") === 0, "Lager eingebaut: die Mühle dreht sich");
  check(QB.schalter(QUEST_A3, anna.b[QUEST_A3.id], "muehle_dreht") === true && QB.schalter(QUEST_A3, ben.b[QUEST_A3.id] || "", "muehle_dreht") === false, "Schalter „muehle_dreht“: an bei Anna, aus bei Ben");
  await stelle(anna, ...TILL); await rede(anna, "till"); await sag(anna, "till", "mehlsack"); await schlaf(300); check(anzahl(anna, "mehlsack") === 1, "Till gibt einen Mehlsack");
  await stelle(anna, ...GRETE); await rede(anna, "grete"); d = await sag(anna, "grete", "abgeben"); await schlaf(600);
  check(anna.b[QUEST_A3.id] === "fertig" && anzahl(anna, "brot") === 5 && faecher(anna, "brot") === 5 && anzahl(anna, "mehlsack") === 0, "A3 fertig: fünf Brot (stapelt nicht: fünf Fächer)");
  check(anna.punkte === 3, `Questpunkte aus dem Stand: Quest 1 + A1 + A3 = 3 (${anna.punkte})`);
  sende(anna, { t: "kaufen", laden: "baeckerei", g: "brot" }); await warte(anna, (m) => m.t === "gekauft", 2000); await schlaf(400); check(anzahl(anna, "brot") === 6, "Bäckerei nach A3: Brot für 8 Splitter");
  /* Brot essen: heilt 4 */
  HELD[A].lp_stand = { lp: 3, z: Date.now() / 1000 }; const i = anna.inv.rucksack.findIndex((x) => (typeof x === "string" ? x : x.g) === "brot"); sende(anna, { t: "inv", tat: "trinken", i }); const g1 = await warte(anna, (m) => m.t === "getrunken" || (m.t === "chat" && m.kanal === "system"), 2000);
  check(g1 && g1.t === "getrunken" && g1.n === 4 && anzahl(anna, "brot") <= 6, `Brot essen: heilt 4 (${g1 && (g1.n ?? g1.text)})`);
  const i2 = anna.inv.rucksack.findIndex((x) => (typeof x === "string" ? x : x.g) === "brot"); sende(anna, { t: "inv", tat: "trinken", i: i2 }); const g2 = await warte(anna, (m) => m.t === "getrunken" || (m.t === "chat" && m.kanal === "system"), 2000);
  check(g2 && g2.t === "chat" && /kaust/.test(g2.text), "Gleich der nächste Bissen: „Du kaust noch.“");
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").filter((z) => /Fehler|Error|fehlt/.test(z)).slice(-15).join("\n"));
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Phase 2 „Waldland“: alles in Ordnung"); process.exit(f ? 1 : 0);
