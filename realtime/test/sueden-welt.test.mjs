/*
* Riftmere – Süden (#124): Quests S5 „Die Furt“, S9 „Briefe nach Süden“ und S6 „Schafe zählen“ Ende zu Ende, S4 „Klemmende Säge“ bis zu den Eisenbändern – echter Spielserver, nachgebildete Supabase, Lohn mit „abholen“ (#77).
 * Ute spielt beide ganz, Bea (ohne Bergbau 15, Heldenlevel 1) ist die Gegenprobe.
 * Aufruf: node test/sueden-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { QB, QUESTS, xpFuer } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000c501", B = "00000000-0000-0000-0000-00000000c502";
const TA = "tok_ute__" + "x".repeat(30), TB = "tok_bea__" + "x".repeat(30);
const NUTZER = { [TA]: A, [TB]: B }, NAME = { [A]: "Ute", [B]: "Bea" };
const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
const MERKER = ["schmieden"], viel = (g, n) => Array.from({ length: n }, () => g);
const KAMPF = { skill_staerke: xpFuer(12), skill_geschick: xpFuer(12), skill_defense: xpFuer(12), skill_lp: xpFuer(12), skill_fernkampf: xpFuer(12), skill_magie: xpFuer(12) };
const HELD = {
  /* Ute: Bergbau 15, Heldenlevel ab 10 – darf S5 und S9 */
  [A]: { ...roh(), ...KAMPF, inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: ["hammer", "sichel", { g: "leeres_flaeschchen", n: 2 }, { g: "splitter", n: 20 }], v: 2, merker: MERKER, berufe: { bergbau: xpFuer(15), holzfaellerei: xpFuer(10), schmieden: xpFuer(12), kraeuterkunde: xpFuer(20) } }, quests: { die_gesperrte_strasse: { s: "fertig" }, weidenhain_wasser_auf_die_muehle: { s: "fertig" } } },
  /* Bea: ohne Bergbau, Heldenlevel 1 */
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
  send(404, {}); }); }).listen(8797);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8788", SUPABASE_URL: "http://localhost:8797", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
  FISCH_KERN: "0", FISCH_FALL: "0", KRAUT_KERN: "0", KRAUT_FALL: "0", KRAUT_TAKT_MS: "200", FISCH_WANDER_MS: "0", HANDWERK_GLUT: "0", HANDWERK_BRENN: "0" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort = "waldmark") { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8788/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }),
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
const S5 = QUESTS.find((q) => q.id === "lehmfurt_die_furt"), S9 = QUESTS.find((q) => q.id === "weidenhain_briefe_nach_sueden");
const S4 = QUESTS.find((q) => q.id === "erlengrund_klemmende_saege"), S6 = QUESTS.find((q) => q.id === "heckenhof_schafe_zaehlen");
const AMBOSS = [6470.4, 6427.6], S2 = QUESTS.find((q) => q.id === "summweide_der_verschwundene_stock");
const RINGEL = [[6410.5, 6914.5, "sueden_ringelblume_1"], [6416.5, 6914.5, "sueden_ringelblume_2"], [6422.5, 6914.5, "sueden_ringelblume_3"]];
const fig = (Q, id) => Q.figuren.find((x) => x.id === id), obj = (Q, id) => Q.objekte.find((o) => o.id === id);
const zu = async (s, F) => stelle(s, F.x + 1, F.y);
/** Kampfverbindung in Weidenhain (Gebiet welt_weidenhain, Ursprung 6400 | 6656) */
const kampf = (token, wx, wy) => new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8788/?kampf=welt_weidenhain&ort=welt_weidenhain&lx=${wx - 6400}&ly=${wy - 6656}`, { origin: "http://localhost:8765" });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig({ ws }); }); });
const ding5 = async (s, id) => { const o = obj(S5, id); await stelle(s, o.x, o.y - 1); return ding(s, id); };
try {
  const ute = await spieler(TA), bea = await spieler(TB);
  for (const s of [ute, bea]) await warte(s, (m) => m.t === "inventar"); await schlaf(400);
  check(Boolean(S5 && S9), "S5 „Die Furt“ und S9 „Briefe nach Süden“ sind im Spiel");

  console.log("S5 „Die Furt“");
  await zu(bea, fig(S5, "kuno")); let d = await rede(bea, "kuno");
  check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Bea (ohne Bergbau 15): kein Annehmen");
  await zu(ute, fig(S5, "kuno")); await rede(ute, "kuno"); await sag(ute, "kuno", "annehmen"); await schlaf(400);
  check(stand(ute, S5).phase === "laeuft", "Ute nimmt S5 an");
  { const t = await ding5(ute, "s5_stein_2"); check(!QB.erledigt(S5, ute.b[S5.id], "stein_2"), "Vor dem Steinbruch: kein Trittstein (" + t.slice(0, 50) + ")"); }
  await ding5(ute, "s5_bruch"); check(QB.erledigt(S5, ute.b[S5.id], "bruch"), "Blöcke im Steinbruch gebrochen");
  { await ding5(ute, "s5_stein_3"); check(!QB.erledigt(S5, ute.b[S5.id], "stein_3"), "Der dritte Stein nicht vor dem ersten"); }
  for (let i = 1; i <= 5; i++) await ding5(ute, "s5_stein_" + i);
  check([1, 2, 3, 4, 5].every((i) => QB.erledigt(S5, ute.b[S5.id], "stein_" + i)), "Fünf Trittsteine der Reihe nach gesetzt");
  const sp0 = anzahl(ute, "splitter");
  await zu(ute, fig(S5, "kuno")); await rede(ute, "kuno"); d = await sag(ute, "kuno", "fertig"); await schlaf(600);
  check(ute.b[S5.id] === "fertig" && anzahl(ute, "barren_eisen") === 3 && anzahl(ute, "splitter") >= sp0 + 80, `S5 fertig, Lohn abgeholt: 3 Eisenbarren, 80 Splitter (${anzahl(ute, "barren_eisen")}, ${anzahl(ute, "splitter") - sp0})`);
  const K0 = { hat: () => false, verloren: () => false }, an = (st) => [].concat(S5.schalter.lehmfurt_trittsteine).some((b) => QB.gilt(S5, st, b, K0));
  check(an(ute.b[S5.id]) && !an(bea.b[S5.id] || ""), "Schalter lehmfurt_trittsteine: bei Ute an, bei Bea aus");

  console.log("S9 „Briefe nach Süden“");
  await zu(bea, fig(S9, "othmar")); d = await rede(bea, "othmar");
  check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "annehmen"), "Bea (Heldenlevel unter 10): kein Annehmen");
  /* Das Heldenlevel kennt der Server aus der Kampfverbindung (wie im Spiel: der Held steht in der Welt) */
  { const O = fig(S9, "othmar"), z = await kampf(TA, O.x + 1, O.y); await schlaf(1000);
    await zu(ute, O); await rede(ute, "othmar"); await sag(ute, "othmar", "annehmen"); await schlaf(400); z.ws.close(); }
  check(stand(ute, S9).phase === "laeuft", "Ute nimmt S9 an");
  await zu(ute, fig(S9, "kranich")); d = await rede(ute, "kranich");
  check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "brief_kranich"), "Kranich nimmt den letzten Brief erst nach den sechs anderen");
  const GABE = { rike: ["brot", 1], imme: ["kleiner_heiltrank", 1], ebba: ["fisch_muehlbarsch_gebraten", 1], bodo: ["stamm_eiche", 1], odila: ["seelenlicht", 1], kuno: ["barren_kupfer", 1] };
  for (const [id, [g, n]] of Object.entries(GABE)) { const vor = anzahl(ute, g); await zu(ute, fig(S9, id)); await rede(ute, id); await sag(ute, id, "brief_" + id); await schlaf(700);
    check(QB.erledigt(S9, ute.b[S9.id], "brief_" + id) && anzahl(ute, g) === vor + n, `Brief an ${fig(S9, id).name}: ${n}× ${g} (${vor} → ${anzahl(ute, g)})`); }
  const sp1 = anzahl(ute, "splitter");
  await zu(ute, fig(S9, "kranich")); await rede(ute, "kranich"); d = await sag(ute, "kranich", "brief_kranich"); await schlaf(600);
  const ab = ABSCHLUSS.find((a) => a.p_user === A && a.p_quest === S9.id);
  check(ute.b[S9.id] === "fertig" && ab && ab.p_punkte === 1 && anzahl(ute, "splitter") >= sp1 + 100, `S9 fertig bei Kranich in Kielmund: 1 Questpunkt, 100 Splitter (${anzahl(ute, "splitter") - sp1})`);

  console.log("S6 „Schafe zählen“");
  await zu(ute, fig(S6, "tamme")); await rede(ute, "tamme"); await sag(ute, "tamme", "annehmen"); await schlaf(400);
  check(stand(ute, S6).phase === "laeuft", "Ute nimmt S6 an");
  const sch = S6.figuren.filter((x) => x.id.startsWith("schaf_"));
  check(sch.length === 5 && sch.every((x) => x.modell === "schaf3d" && x.folgt && x.beiseite), "Fünf Schafe als Questfiguren (schaf3d), sie folgen und stehen danach im Pferch");
  { const g = obj(S6, "s6_gatter"); await stelle(ute, g.x, g.y - 1); const t = await ding(ute, "s6_gatter"); check(!QB.erledigt(S6, ute.b[S6.id], "gatter") && /Noch nicht alle/.test(t), "Gatter vor den Schafen: noch nicht alle da"); }
  for (const x of sch) { await zu(ute, x); await rede(ute, x.id); await sag(ute, x.id, "locken"); await schlaf(250); }
  check(sch.every((x) => QB.erledigt(S6, ute.b[S6.id], x.id)), "Alle fünf Schafe gelockt");
  const K1 = { hat: () => false, verloren: () => false };
  check(sch.every((x) => QB.figurFolgt(S6, x, ute.b[S6.id], K1)), "… und sie folgen Ute");
  { const g = obj(S6, "s6_gatter"); await stelle(ute, g.x, g.y - 1); await ding(ute, "s6_gatter"); }
  check(QB.erledigt(S6, ute.b[S6.id], "gatter") && sch.every((x) => !QB.figurFolgt(S6, x, ute.b[S6.id], K1)), "Gatter zu: die Schafe folgen nicht mehr (sie stehen im Pferch)");
  const km = anzahl(ute, "kuhfleisch");
  await zu(ute, fig(S6, "tamme")); await rede(ute, "tamme"); await sag(ute, "tamme", "fertig"); await schlaf(600);
  check(ute.b[S6.id] === "fertig" && anzahl(ute, "kuhfleisch") === km + 2, `S6 fertig, Lohn abgeholt: 2 Kuhfleisch (${anzahl(ute, "kuhfleisch") - km})`);

  console.log("S4 „Klemmende Säge“ (bis zu den Eisenbändern)");
  await zu(ute, fig(S4, "bodo")); await rede(ute, "bodo"); await sag(ute, "bodo", "annehmen"); await schlaf(400);
  check(stand(ute, S4).phase === "laeuft", "Ute nimmt S4 an (nach B2, Holzfällerei 10)");
  await zu(ute, fig(S4, "tebbe")); await rede(ute, "tebbe"); await sag(ute, "tebbe", "baender_fragen"); await schlaf(300);
  check(QB.erledigt(S4, ute.b[S4.id], "tebbe"), "Tebbe verrät, wie man Eisenbänder legt");
  { const r = await herstellen(ute, ...AMBOSS, "eisenbaender"); check(r === "ok" && anzahl(ute, "eisenband") === 2 && QB.erledigt(S4, ute.b[S4.id], "baender"), `Eisenbänder am Amboss auch während S4 (${r}, ${anzahl(ute, "eisenband")})`); }
  { const o = obj(S4, "s4_rad"); await stelle(ute, o.x, o.y - 1); const t = await ding(ute, "s4_rad"); check(!QB.erledigt(S4, ute.b[S4.id], "rad") && anzahl(ute, "eisenband") === 2, "Ohne Eichenstämme: das Rad bleibt kaputt, die Bänder bleiben (" + t.slice(0, 40) + ")"); }

  console.log("S2 „Der verschwundene Stock“");
  await zu(ute, fig(S2, "imme")); await rede(ute, "imme"); await sag(ute, "imme", "annehmen"); await schlaf(400);
  check(stand(ute, S2).phase === "laeuft", "Ute nimmt S2 an (Kräuterkunde 10)");
  for (const id of ["s2_summen_1", "s2_summen_2", "s2_summen_3", "s2_stock"]) { const o = S2.objekte.find((x) => x.id === id); await stelle(ute, o.x, o.y - 1); await ding(ute, id); }
  check(QB.erledigt(S2, ute.b[S2.id], "stock"), "Dem Summen gefolgt, den Stock aufgerichtet");
  { let i = 0; const t0 = Date.now(); while (anzahl(ute, "ringelblume") < 6 && Date.now() - t0 < 90000) { const [x, y, id] = RINGEL[i++ % 3]; await sammeln(ute, "kraut", id, x, y, "ringelblume", Math.min(6, anzahl(ute, "ringelblume") + 1), 15000); }
    check(anzahl(ute, "ringelblume") >= 6 && QB.erledigt(S2, ute.b[S2.id], "blumen"), `Sechs Ringelblumen mit der Sichel (${anzahl(ute, "ringelblume")})`); }
  /* auf langsamen Rechnern kommt beim Sammeln manchmal eine Blume mehr – darum relativ prüfen */
  { const rb = anzahl(ute, "ringelblume"); await zu(ute, fig(S2, "mira")); await rede(ute, "mira"); await sag(ute, "mira", "blumen_mira"); await schlaf(300);
    check(QB.erledigt(S2, ute.b[S2.id], "mira") && anzahl(ute, "ringelblume") === rb - 3, "Drei Ringelblumen an Mira in der Waldmark"); }
  { const vor = anzahl(ute, "kleiner_heiltrank"), rb = anzahl(ute, "ringelblume"); await zu(ute, fig(S2, "imme")); await rede(ute, "imme"); await sag(ute, "imme", "abgeben"); await schlaf(600);
    check(ute.b[S2.id] === "fertig" && anzahl(ute, "ringelblume") === rb - 3 && anzahl(ute, "kleiner_heiltrank") === vor + 1, "S2 fertig, Lohn abgeholt: ein kleiner Heiltrank"); }

  console.log("Miras Rezeptbuch (Waldmark, Rabenmoor)");
  { const M = QUESTS.find((q) => q.id === "waldmark_miras_rezeptbuch"), WEG = [[6458.5, 6429.5, "wegerich_1"], [6453.5, 6437.5, "wegerich_3"], [6423.5, 6431.5, "wegerich_4"]];
    await zu(ute, fig(M, "mira")); await rede(ute, "mira"); await sag(ute, "mira", "annehmen"); await schlaf(400);
    check(stand(ute, M).phase === "laeuft" && anzahl(ute, "leeres_flaeschchen") >= 1, "Ute nimmt Miras Rezeptbuch an und bekommt ein leeres Fläschchen");
    let i = 0; const t0 = Date.now(); while (anzahl(ute, "wegerich") < 5 && Date.now() - t0 < 90000) { const [x, y, id] = WEG[i++ % 3]; await sammeln(ute, "kraut", id, x, y, "wegerich", Math.min(5, anzahl(ute, "wegerich") + 1), 15000); }
    check(QB.erledigt(M, ute.b[M.id], "wegerich"), `Fünf Wegerich mit der Sichel (${anzahl(ute, "wegerich")})`);
    const r = await herstellen(ute, 6420.9 - 1.2, 6438.6, "brauen_kleiner_heiltrank");
    check(r === "ok" && QB.erledigt(M, ute.b[M.id], "trank"), `Kleiner Heiltrank am Kessel im Kräuterhaus (${r})`);
    await zu(ute, fig(M, "hedda")); await rede(ute, "hedda"); await sag(ute, "hedda", "kraut_blau"); await schlaf(300);
    check(QB.erledigt(M, ute.b[M.id], "hedda") && anzahl(ute, "rezeptheft") === 1, "Hedda prüft und gibt das Rezeptheft heraus");
    const ht = anzahl(ute, "heiltrank"); await zu(ute, fig(M, "mira")); await rede(ute, "mira"); await sag(ute, "mira", "abgeben"); await schlaf(600);
    check(ute.b[M.id] === "fertig" && anzahl(ute, "rezeptheft") === 0 && anzahl(ute, "heiltrank") === ht + 3, `Miras Rezeptbuch fertig, Lohn abgeholt: 3 Heiltränke (${anzahl(ute, "heiltrank") - ht})`); }

  console.log("Der Kräuterhof (Küste, Waldmark, Rabenmoor)");
  { const K = QUESTS.find((q) => q.id === "kueste_der_kraeuterhof"), kob = (id) => K.objekte.find((o) => o.id === id);
    await zu(ute, fig(K, "frieda")); await rede(ute, "frieda"); await sag(ute, "frieda", "annehmen"); await schlaf(400);
    check(stand(ute, K).phase === "laeuft", "Ute nimmt den Kräuterhof an (nach Miras Rezeptbuch, Kräuterkunde 20)");
    /* Platz im Rucksack (24) schaffen: Reste aus S4/S9, die der Kräuterhof nicht braucht – ein voller Rucksack verschluckt sonst Questgegenstände (Issue) */
    for (const g of ["brot", "barren_kupfer", "stamm_eiche", "fisch_muehlbarsch_gebraten"]) { const i = (ute.inv.rucksack || []).findIndex((x) => (typeof x === "string" ? x : x.g) === g); if (i < 0) continue;
      sende(ute, { t: "inv", tat: "fallen", i }); await warte(ute, (m) => m.t === "inventar"); }
    await zu(ute, fig(K, "mira")); await rede(ute, "mira"); await sag(ute, "mira", "samen_nehmen"); await schlaf(300);
    await zu(ute, fig(K, "hedda")); await rede(ute, "hedda"); await sag(ute, "hedda", "ableger_bitten"); await schlaf(300);
    check(anzahl(ute, "ringelblumensamen") === 1 && anzahl(ute, "moorgloeckchen_ableger") === 1, "Samen von Mira, Ableger von Hedda");
    for (const id of ["kh_beet_1", "kh_beet_2"]) { const o = kob(id); await stelle(ute, o.x, o.y - 1); await ding(ute, id); }
    check(QB.erledigt(K, ute.b[K.id], "beet_1") && QB.erledigt(K, ute.b[K.id], "beet_2"), "Beide Beete angelegt");
    let i = 0; const t0 = Date.now(); while (anzahl(ute, "ringelblume") < 2 && Date.now() - t0 < 60000) { const [x, y, id] = RINGEL[i++ % 3]; await sammeln(ute, "kraut", id, x, y, "ringelblume", anzahl(ute, "ringelblume") + 1, 15000); }
    const ht = anzahl(ute, "heiltrank"); const r = await herstellen(ute, 6422 - 1.2, 7063.4, "brauen_heiltrank", 2);
    check(r === "ok" && QB.erledigt(K, ute.b[K.id], "traenke") && anzahl(ute, "heiltrank") >= ht + 2, `Zwei Heiltränke am Kessel des Kräuterhofs (${r})`);
    await zu(ute, fig(K, "frieda")); await rede(ute, "frieda"); await sag(ute, "frieda", "abgeben"); await schlaf(600);
    check(ute.b[K.id] === "fertig", "Der Kräuterhof ist fertig, Lohn abgeholt"); }
  check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close();
console.log(f ? `\nSüden (S2, S4, S5, S6, S9) Miras Rezeptbuch und Kräuterhof: ${f} FEHLER` : "\nSüden (S2, S4, S5, S6, S9) Miras Rezeptbuch und Kräuterhof: alles in Ordnung");
process.exit(f ? 1 : 0);
