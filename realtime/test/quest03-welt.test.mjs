/*
 * Mythara – Quest 03 „Der Säbel des Waldgottes“ Ende zu Ende: echter Spielserver, nachgebildete Supabase.
 * Anna (ohne Werkzeug) nimmt beim Förster an → bekommt Beil, Spitzhacke, Hammer; fällt den Baum des Waldgottes, baut den Waldstein ab,
 * schmilzt an der Esse, schmiedet am Amboss, zeigt den Säbel → fertig. Ben ohne Auftrag: Baum, Stein und Rezepte gesperrt.
 * Aufruf: node test/quest03-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const roh = () => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } } });
const HELD = { [A]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 } }, [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: ["holzbeil_training", "spitzhacke_training", "hammer", "erz_waldstein", "holz_waldgott", "barren_waldstein"], v: 2 } } }, SETZEN = [], ABSCHLUSS = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); SETZEN.push(a); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
  /* wie vor Migration 048: die neue Abschluss-Funktion fehlt noch – der Server nimmt die alte */
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss_v2") return send(404, { code: "PGRST202", message: "Could not find the function public.rpg_held_quest_abschluss_v2" });
  if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss") { const a = JSON.parse(b); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: "fertig" }; ABSCHLUSS.push(a); return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  send(404, {}); }); }).listen(8797);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8797", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", HOLZ_KERN: "0", BERG_KERN: "0", HANDWERK_GLUT: "0" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8787/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, q3: null, inv: null, chat: [], holz: [], berg: [], handwerk: [], warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") s.q3 = (m.b || {}).nordwald_waldsaebel; if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text);
    if (m.t === "boden") s.boden = m.liste; if (m.t === "holz") s.holz.push(m); if (m.t === "berg") s.berg.push(m); if (m.t === "handwerk") s.handwerk.push(m);
    for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await schlaf(150); };
const rede = async (s) => { sende(s, { t: "rede", npc: "foerster" }); return warte(s, (m) => m.t === "dialog"); };
const sag = async (s, a) => { sende(s, { t: "antwort", npc: "foerster", a }); return warte(s, (m) => m.t === "dialog"); };
const start = async (s, t, msg) => { s[t] = []; sende(s, { t, tat: "start", ...msg }); return (await warte(s, (m) => m.t === t && (m.tat === "nein" || m.tat === "start"))) || {}; };
const ende = async (s, t, ms = 30000) => s[t].find((m) => m.tat === "stop") || warte(s, (m) => m.t === t && m.tat === "stop", ms);
const FOERSTER = [6362.5, 6452.5], BAUM = [6350.5, 6442.5], STEIN = [6370.5, 6440.5], AMBOSS = [6470.4, 6427.6], ESSE = [6467.4, 6427.8];
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30), Q = "nordwald_waldsaebel";
try {
  let anna = await spieler(TA, "nordwald"), ben = await spieler(TB, "nordwald"); await warte(anna, (m) => m.t === "inventar"); await warte(ben, (m) => m.t === "inventar"); if (ben.q3 === null) await warte(ben, (m) => m.t === "quests", 1500);
  check(anna.q3 === "" && ben.q3 === "", `Quest 3: beide ohne Stand (${JSON.stringify(anna.q3)})`);
  /* Ben ohne Auftrag: alles gesperrt */
  await stelle(ben, BAUM[0] + 1.2, BAUM[1]); check(/Försters/.test((await start(ben, "holz", { id: "waldgott_1" })).text || ""), "Ohne Auftrag: Baum des Waldgottes gesperrt");
  await stelle(ben, STEIN[0] + 1.2, STEIN[1]); check(/Förster/.test((await start(ben, "berg", { id: "waldstein_1" })).text || ""), "Ohne Auftrag: Waldstein gesperrt");
  /* Förster: zu weit, dann Gespräch */
  await stelle(anna, FOERSTER[0] + 9, FOERSTER[1]); sende(anna, { t: "rede", npc: "foerster" }); await schlaf(300); check(anna.chat.some((t) => /näher|weit/i.test(t)), "Zu weit vom Förster: kein Gespräch");
  await stelle(anna, FOERSTER[0] + 1, FOERSTER[1]); let d = await rede(anna);
  check(d && d.dialog && d.dialog.name === "Förster Hartwig" && d.dialog.antworten.some((a) => a.id === "annehmen"), "Förster Hartwig bietet den Auftrag an");
  d = await sag(anna, "splitter"); check(d && d.zeilen && d.zeilen.some((z) => /stärker/.test(z.text)) && d.dialog, "Splitter-Gespräch: verändert und stärker, nicht besser");
  d = await sag(anna, "wald"); check(d && d.zeilen && d.zeilen.some((z) => /Waldgolem/.test(z.text)) && d.zeilen.some((z) => /Mooshocker/.test(z.text)), "Wald-Gespräch: Waldgolems und Mooshocker");
  d = await sag(anna, "wer"); check(d && d.zeilen && /Hartwig/.test(d.zeilen[0].text) && d.dialog, "Wer bist du? – Hartwig, Förster");
  d = await sag(anna, "annehmen"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).nordwald_waldsaebel === "auftrag_0", 1500); await schlaf(300);
  check(anna.q3 === "auftrag_0" && HELD[A].quests[Q].s === "auftrag_0", "Auftrag angenommen (gespeichert)");
  check(anzahl(anna, "holzbeil_training") === 1 && anzahl(anna, "spitzhacke_training") === 1 && anzahl(anna, "hammer") === 1 && d.zeilen.some((z) => /bekommst/.test(z.text)), "Fehlendes Werkzeug bekommen: Beil, Spitzhacke, Hammer");
  d = await rede(anna); check(d && d.dialog && /nordwestlich/.test(d.dialog.zeilen[0].text) && d.dialog.antworten.some((a) => a.id === "hilfe"), "Im Auftrag: Hartwig sagt, wohin (nordwestlich), „Wie war das noch mal?“");
  d = await sag(anna, "hilfe"); check(d && d.zeilen && d.zeilen.some((z) => /Holzfällerei/.test(z.text)) && d.zeilen.some((z) => /Bergbau/.test(z.text)) && d.zeilen.some((z) => /Schmieden/.test(z.text)), "Hilfe: alle Schritte mit ihren Berufen");
  d = await sag(anna, "werkzeug"); check(d && d.zeilen.some((z) => /alles/.test(z.text)) && anzahl(anna, "hammer") === 1, "Noch einmal nach Werkzeug fragen: nichts doppelt");
  sende(anna, { t: "dialogzu" });
  /* Baum fällen */
  await stelle(anna, BAUM[0] + 1.2, BAUM[1]); const h0 = (anna.inv.berufe || {}).holzfaellerei || 0; const sh = await start(anna, "holz", { id: "waldgott_1" }); check(sh.tat === "start", `Baum des Waldgottes: es geht los (${sh.text || sh.tat})`);
  const eh = await ende(anna, "holz"); await schlaf(300); const stamm = anna.holz.find((m) => m.tat === "stamm");
  check(eh && eh.grund === "fertig" && stamm && stamm.xp === 30 && anzahl(anna, "holz_waldgott") === 1 && ((anna.inv.berufe || {}).holzfaellerei || 0) - h0 === 30, `Ein Stück Holz des Waldgottes, 30 Holzfällerei-XP, danach Schluss (${eh && eh.grund})`);
  check(anna.q3 === "auftrag_1", `Schritt Holz erledigt (${anna.q3})`);
  check(/schon/.test((await start(anna, "holz", { id: "waldgott_1" })).text || ""), "Zweites Mal fällen: „Du hast schon Holz …“");
  /* Waldstein */
  await stelle(anna, STEIN[0] + 1.2, STEIN[1]); const sb2 = await start(anna, "berg", { id: "waldstein_1" }); check(sb2.tat === "start", `Waldstein: es geht los (${sb2.text || sb2.tat})`);
  const eb = await ende(anna, "berg"); await schlaf(300); const erz = anna.berg.find((m) => m.tat === "erz");
  check(eb && eb.grund === "fertig" && erz && erz.xp === 25 && anzahl(anna, "erz_waldstein") === 1 && anna.q3 === "auftrag_3", `Ein Stück Waldstein, 25 Bergbau-XP, Schritt erledigt (${anna.q3})`);
  /* Schmiede in der Waldmark */
  anna.ws.close(); await schlaf(300); anna = await spieler(TA, "waldmark"); await warte(anna, (m) => m.t === "inventar"); await schlaf(200);
  check(anna.q3 === "auftrag_3", `Neu angemeldet: Stand bleibt (${anna.q3})`);
  await stelle(anna, AMBOSS[0] + 1.2, AMBOSS[1]); check(/fehlt|Barren/i.test((await start(anna, "handwerk", { rezept: "waldsaebel", menge: 1 })).text || ""), "Säbel ohne Barren: abgelehnt");
  await stelle(anna, ESSE[0] + 1.2, ESSE[1]); const s3 = await start(anna, "handwerk", { rezept: "barren_waldstein", menge: 5 }); const e3 = s3.tat === "start" ? await ende(anna, "handwerk") : null; await schlaf(300);
  check(e3 && anzahl(anna, "barren_waldstein") === 1 && anzahl(anna, "erz_waldstein") === 0 && anna.handwerk.some((m) => m.tat === "fertig" && m.xp === 25 && m.beruf === "schmieden") && anna.q3 === "auftrag_7", `Esse: Waldsteinbarren (25 Schmieden-XP), Schritt erledigt (${s3.text || anna.q3})`);
  await stelle(anna, AMBOSS[0] + 1.2, AMBOSS[1]); const s4 = await start(anna, "handwerk", { rezept: "waldsaebel", menge: 1 }); const e4 = s4.tat === "start" ? await ende(anna, "handwerk") : null; await schlaf(300);
  check(e4 && anzahl(anna, "waldsaebel") === 1 && anzahl(anna, "barren_waldstein") === 0 && anzahl(anna, "holz_waldgott") === 0 && anna.handwerk.some((m) => m.tat === "fertig" && m.xp === 40 && m.beruf === "schmieden") && anna.q3 === "auftrag_15", `Amboss: Waldsäbel (40 Schmieden-XP) (${s4.text || anna.q3})`);
  check(/schon/.test((await start(anna, "handwerk", { rezept: "waldsaebel", menge: 1 })).text || ""), "Zweiter Säbel: abgelehnt");
  /* Ben: Rezepte ohne Auftrag gesperrt (hat alle Zutaten) */
  ben.ws.close(); ben = await spieler(TB, "waldmark"); await warte(ben, (m) => m.t === "inventar"); await stelle(ben, AMBOSS[0] + 1.2, AMBOSS[1]);
  check(/Förster/.test((await start(ben, "handwerk", { rezept: "waldsaebel", menge: 1 })).text || ""), "Ben ohne Auftrag: Säbel-Rezept gesperrt");
  /* zurück zum Förster */
  anna.ws.close(); await schlaf(300); anna = await spieler(TA, "nordwald"); await warte(anna, (m) => m.t === "inventar"); await stelle(anna, FOERSTER[0] + 1, FOERSTER[1]);
  d = await rede(anna); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "zeigen"), "Förster: „Zeig her.“");
  d = await sag(anna, "zeigen"); await warte(anna, (m) => m.t === "quests" && (m.b || {}).nordwald_waldsaebel === "fertig", 1500);
  check(anna.q3 === "fertig" && HELD[A].quests[Q].s === "fertig" && ABSCHLUSS.length === 1 && anzahl(anna, "waldsaebel") === 1, "Abgeschlossen: Stand fertig, Säbel bleibt im Rucksack");
  d = await rede(anna); check(d && d.dialog && /Golem/.test(d.dialog.zeilen[0].text) && !d.dialog.antworten.some((a) => a.id === "zeigen"), "Danach: Abschlussgespräch, kein zweites Zeigen");
  const x = HELD[A].inventar.berufe || {}; check(x.holzfaellerei === 30 && x.bergbau === 25 && x.schmieden === 65 && !x.handwerk, `XP gespeichert: Holz 30, Bergbau 25, Schmieden 65 (Handwerk 0) (${JSON.stringify(x)})`);
  /* nicht tauschbar: weggeworfen sieht ihn nur Anna; verloren → Hartwig gibt ihn zurück */
  ben.ws.close(); ben = await spieler(TB, "nordwald"); await warte(ben, (m) => m.t === "inventar"); await stelle(ben, FOERSTER[0] + 2, FOERSTER[1]);
  const fach = anna.inv.rucksack.findIndex((x) => (typeof x === "string" ? x : x.g) === "waldsaebel"); sende(anna, { t: "inv", tat: "fallen", i: fach }); await schlaf(1500);
  check(anzahl(anna, "waldsaebel") === 0 && anna.boden.some((b) => b.g === "waldsaebel") && !ben.boden.some((b) => b.g === "waldsaebel"), `Weggeworfen: Anna sieht ihn am Boden, Ben nicht (Anna ${anna.boden.length}, Ben ${ben.boden.length})`);
  d = await rede(anna); check(d && d.dialog && d.dialog.antworten.some((a) => a.id === "verloren"), "Ohne Säbel: „Ich habe den Waldsäbel verloren.“");
  d = await sag(anna, "verloren"); await schlaf(400); check(anzahl(anna, "waldsaebel") === 1 && d && d.ende, "Hartwig gibt den Säbel zurück");
  d = await rede(anna); check(d && d.dialog && !d.dialog.antworten.some((a) => a.id === "verloren"), "Mit Säbel: keine zweite Rückgabe");
  sende(anna, { t: "dialogzu" });
  anna.ws.close(); ben.ws.close();
} catch (e) { check(false, "Ausnahme: " + e.stack); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-3000)); console.log(f ? `\n${f} Prüfungen fehlgeschlagen` : "\nAlle Prüfungen bestanden"); process.exit(f ? 1 : 0);
