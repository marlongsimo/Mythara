/*
 * Riftmere – gemeinsames Gerüst für die Welt-Tests der Quest-Blöcke (C–G): echter Spielserver, nachgebildete Supabase, Kampfverbindung je Gebiet.
 * Kein Test für sich (steht nicht in server-tests.sh). Gebrauch:
 *   import { starte } from "./questwelt.mjs";
 *   const W = await starte({ sb: 8811, srv: 8812, helden: { ida: { ...W0.held, ... } } });   (Ports im Test als „localhost:NNNN“ nennen, damit parallel.mjs sie sieht)
 * Helden: Name → Zeile wie rpg_held (skill_*, inventar, quests). Rückgabe: Helfer (spieler, stelle, rede, sag, ding, kampf, kaempfen, aufheben, sammeln, herstellen, fischen …).
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
import { build } from "esbuild"; import { tmpdir } from "node:os"; import { join } from "node:path"; import { pathToFileURL } from "node:url";
import { QB, QUESTS, xpFuer, FANGSTELLEN } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), WebSocket = require("ws");

/* Kampfgebiete der Welt (shared/weltzonen.ts, gebaut mit werkzeug/weltzonen.py): welches Gebiet liegt an einer Weltstelle? */
const ZONEN_DATEI = join(tmpdir(), `riftmere-questwelt-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { WELTKAMPF } from "./shared/weltzonen"; export { INSTANZEN } from "./shared/bosse";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" },
  bundle: true, platform: "node", format: "esm", outfile: ZONEN_DATEI, logLevel: "error" });
const { WELTKAMPF, INSTANZEN } = await import(pathToFileURL(ZONEN_DATEI).href);
export const gebietBei = (x, y) => WELTKAMPF.find((z) => x >= z.x0 && x < z.x0 + z.b && y >= z.y0 && y < z.y0 + z.h) || null;
export { QB, QUESTS, xpFuer, INSTANZEN };

export const STARK = 11079266; /* Level 99 */
export const roh = () => ({ geschlecht: "mann", frisur: "kurz", bart: "ohne", haarfarbe: "braun", hautfarbe: "hell", waffe: "schwert", skill_lp: 0, lp_stand: null, quests: { die_gesperrte_strasse: { s: "fertig" } } });
/** Ein starker Held (alle Kampfskills 99, Ritterschwert) mit diesen Berufen (Level) und Quests (fertig) */
export function starkerHeld({ berufe = {}, fertig = [], rucksack = [] } = {}) {
  const B = Object.fromEntries(Object.entries(berufe).map(([k, l]) => [k, xpFuer(l)])), Q = { die_gesperrte_strasse: { s: "fertig" } }; for (const id of fertig) Q[id] = { s: "fertig" };
  return { ...roh(), quests: Q, skill_geschick: STARK, skill_staerke: STARK, skill_lp: STARK, skill_defense: STARK, skill_fernkampf: STARK, skill_magie: STARK,
    inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 5000 }, ...rucksack], v: 2, berufe: B } }; }

export async function starte({ sb: SB, srv: SRV, helden, env = {} }) {
  let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; return ok; };
  const namen = Object.keys(helden), ID = {}, TOKEN = {}, NUTZER = {}, NAME = {}, HELD = {};
  namen.forEach((n, i) => { const id = `00000000-0000-0000-0000-${String(SRV).padStart(6, "0")}${String(i + 1).padStart(6, "0")}`, t = `tok_${n.slice(0, 4).padEnd(4, "x")}_` + "x".repeat(30);
    ID[n] = id; TOKEN[n] = t; NUTZER[t] = id; NAME[id] = n[0].toUpperCase() + n.slice(1); HELD[id] = helden[n]; });
  const ABSCHLUSS = [], wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
  const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
    if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
    if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
    if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
    if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
    if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
    if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
    if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
    if (req.url === "/rest/v1/rpc/rpg_held_lp_setzen") { const a = JSON.parse(b); HELD[a.p_user].lp_stand = a.p_lp === null ? null : { lp: a.p_lp, z: Date.now() / 1000 }; return send(200, true); }
    if (req.url === "/rest/v1/rpc/rpg_held_quest_setzen") { const a = JSON.parse(b); const q = HELD[a.p_user].quests; if ((q[a.p_quest] || {}).s === "fertig") return send(200, false); q[a.p_quest] = { s: a.p_stand }; return send(200, true); }
    if (req.url === "/rest/v1/rpc/rpg_held_quest_abschluss_v2") { const a = JSON.parse(b); const H = HELD[a.p_user]; if ((H.quests[a.p_quest] || {}).s === "fertig") return send(200, false); H.quests[a.p_quest] = { s: "fertig" }; H.questpunkte = (H.questpunkte || 0) + (a.p_punkte || 0); ABSCHLUSS.push(a); return send(200, true); }
    if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
    send(404, {}); }); }).listen(SB);
  const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: String(SRV), SUPABASE_URL: `http://localhost:${SB}`, SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765",
    BUCHUNG_RUHE_MS: "500", HAENGEN_MS: "2000", KAMPF_RUHE_MS: "2000", FISCH_KERN: "0", FISCH_FALL: "0", FISCH_WANDER_MS: "0", HANDWERK_GLUT: "0",
    KRAUT_KERN: "0", KRAUT_FALL: "0", KRAUT_TAKT_MS: "200", HOLZ_KERN: "0", HOLZ_FALL: "0", BERG_KERN: "0", BERG_FALL: "0", LICHT_KERN: "0", LICHT_FALL: "0", ...env }, stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
  await new Promise((r) => setTimeout(r, 1500));
  const geraet = (t) => "test-" + String(t).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x");
  function spieler(name, ort = "waldmark") { const token = TOKEN[name]; return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:${SRV}/?welt=1&ort=${ort}`, { origin: "http://localhost:8765" }),
    s = { name, ws, b: {}, punkte: 0, inv: null, chat: [], texte: [], dialoge: [], boden: [], warte: [], ruht: new Set(), msgs: {} };
    ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "quests") { s.b = m.b || {}; s.punkte = m.punkte; } if (m.t === "inventar") s.inv = m.inv; if (m.t === "boden") s.boden = m.liste;
      if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "qtext") s.texte.push(m.text); if (m.t === "dialog") s.dialoge.push(m); if (m.t === "fanggruende") s.ruht = new Set((m.weg || []).map((w) => w[0]));
      (s.msgs[m.t] = s.msgs[m.t] || []).push(m); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: geraet(token) })); fertig(s); }); }).then(async (s) => { await warte(s, (m) => m.t === "inventar"); await schlaf(300); return s; }); }
  const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
  const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
  const anzahl = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0) + (s.inv.angelegt && Object.values(s.inv.angelegt).filter((x) => (typeof x === "string" ? x : x && x.g) === g).length || 0);
  const stelle = async (s, x, y) => { sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y }); await schlaf(150); };
  const rede = async (s, npc) => { sende(s, { t: "rede", npc }); return warte(s, (m) => m.t === "dialog"); };
  const sag = async (s, npc, a) => { sende(s, { t: "antwort", npc, a }); const d = await warte(s, (m) => m.t === "dialog");
    if (d && d.abholen) { sende(s, { t: "abholen", id: d.abholen }); const g = await warte(s, (m) => m.t === "abgeholt"); if (g) Object.assign(d, { belohnung: g.belohnung, splitter: g.splitter, punkte: g.punkte }); }
    return d; };
  /** zur Figur gehen, ansprechen, antworten (die Antwort muss angeboten sein) */
  const sprich = async (s, q, npc, a) => { const F = q.figuren.find((x) => x.id === npc); await stelle(s, F.x + 1, F.y); const d = await rede(s, npc);
    const da = Boolean(d && d.dialog && d.dialog.antworten.some((x) => x.id === a)); if (da) await sag(s, npc, a); await schlaf(250); return da; };
  const ding = async (s, id) => { const n = s.texte.length; sende(s, { t: "qding", id }); await warte(s, (m) => m.t === "qtext", 2000); return s.texte[n] || ""; };
  /** ein Questobjekt benutzen (hingehen, antippen) */
  const objekt = async (s, q, id) => { const o = q.objekte.find((x) => x.id === id); await stelle(s, o.x, o.y - 1); return ding(s, id); };
  const stand = (s, q) => QB.lage(q, s.b[q.id] || "");
  const erl = (s, q, id) => QB.erledigt(q, s.b[q.id] || "", id);
  const fertig = (s, q) => s.b[q.id] === "fertig";
  /** Kampfverbindung an einer Weltstelle (Gebiet aus weltzonen) */
  const kampf = (name, wx, wy) => new Promise((ok) => { const G = gebietBei(wx, wy); if (!G) return ok(null);
    const ws = new WebSocket(`ws://localhost:${SRV}/?kampf=${G.karte}&ort=${G.karte}&lx=${wx - G.x0}&ly=${wy - G.y0}`, { origin: "http://localhost:8765" }), Z = { ws, w: [], ev: [], G };
    ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "z") { Z.w = m.z.w; Z.ich = m.z.ich; for (const e of m.z.ev) Z.ev.push(e); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN[name], geraet: geraet(TOKEN[name]) })); setTimeout(() => ok(Z), 1500); }); });
  /** alle lebenden Gegner dieser Arten bekämpfen, bis bis() stimmt (Siege zählen); w: [id, ich?, art, …, x, y, …, tot] */
  async function kaempfen(z, arten, bis, ms = 180000, nur = () => true) { let siege = 0; const t0 = Date.now();
    while (!bis(siege) && Date.now() - t0 < ms) { const ich = z.w.find((w) => w[1] === 1), lebt = z.w.filter((w) => arten.includes(w[2]) && !w[10] && nur(w));
      if (!ich || !lebt.length) { await schlaf(300); continue; } const ziel = lebt.sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
      const ab = z.ev.length; z.ws.send(JSON.stringify({ t: "ziel", id: ziel[0] }));
      for (let i = 0; i < 400; i++) { await schlaf(100); if (z.ev.slice(ab).some((e) => e.a === "tot" && e.id === ziel[0])) { siege++; break; } if (bis(siege)) break; } }
    return siege; }
  /** Gegner an dieser Stelle bekämpfen, bis die Bedingung stimmt; schließt die Verbindung danach */
  async function kampfBis(s, wx, wy, arten, bis, ms = 240000) { await stelle(s, wx, wy); const z = await kampf(s.name, wx, wy); if (!z) return { z: null, siege: 0 };
    const siege = await kaempfen(z, arten, bis, ms); await schlaf(800); z.ws.close(); await schlaf(2500); return { z, siege }; }
  /** einen Gegenstand vom Boden aufheben (in der Nähe) */
  const aufheben = async (s, g, wx, wy) => { sende(s, { t: "pos", x: 0, y: 0, wx, wy }); await schlaf(1500); const d = s.boden.find((b) => b.g === g); if (!d) return false;
    await stelle(s, d.x, d.y); sende(s, { t: "aufheben", id: d.i }); await warte(s, (m) => m.t === "inventar", 2500); await schlaf(300); return anzahl(s, g) > 0; };
  /** sammeln (Holz „holz“, Bergbau „berg“, Pflanze „pflanze“, Kraut „kraut“, Licht „licht“) an der Stelle id, bis n Stück von g da sind */
  async function sammeln(s, art, id, x, y, g, n, ms = 120000) { await stelle(s, x + 1.2, y); const t0 = Date.now(); s.msgs[art] = []; sende(s, { t: art, tat: "start", id });
    while (anzahl(s, g) < n && Date.now() - t0 < ms) { await schlaf(300); if ((s.msgs[art] || []).some((m) => m.tat === "stop" || m.tat === "nein")) { s.msgs[art] = []; await schlaf(500); sende(s, { t: art, tat: "start", id }); } }
    sende(s, { t: art, tat: "stop" }); await schlaf(300); return anzahl(s, g) >= n; }
  async function herstellen(s, x, y, rezept, menge = 1) { if (x !== null) await stelle(s, x, y); s.msgs.handwerk = []; sende(s, { t: "handwerk", tat: "start", rezept, menge });
    const a = (await warte(s, (m) => m.t === "handwerk" && (m.tat === "nein" || m.tat === "start"))) || {}; if (a.tat !== "start") return a.text || "?";
    await ((s.msgs.handwerk || []).find((m) => m.tat === "stop") || warte(s, (m) => m.t === "handwerk" && m.tat === "stop", 120000)); await schlaf(300); return "ok"; }
  /** fischen an einem Fanggrund, bis n Stück von g da sind */
  async function fischen(s, grund, g, n, ms = 150000) { const t0 = Date.now(); let z = null; s.msgs.fisch = [];
    while (anzahl(s, g) < n && Date.now() - t0 < ms) {
      if (!z || s.ruht.has(z.id) || (s.msgs.fisch || []).some((m) => m.tat === "stop" || m.tat === "nein")) { if ((s.msgs.fisch || []).some((m) => m.tat === "nein" && !/weiter/.test(m.text || ""))) break;
        z = FANGSTELLEN.find((x) => x.grund === grund && !s.ruht.has(x.id)); if (!z) { await schlaf(500); continue; } s.msgs.fisch = []; await stelle(s, z.x + 1.2, z.y); sende(s, { t: "fisch", tat: "start", id: z.id }); }
      await schlaf(250); }
    sende(s, { t: "fisch", tat: "stop" }); await schlaf(300); return anzahl(s, g) >= n; }
  const ende = (titel) => { check(!/Server-Fehler|TypeError|ReferenceError/.test(log), "Keine Fehler im Server-Log"); srv.kill(); sb.close();
    console.log(f ? `\n${titel}: ${f} FEHLER` : `\n${titel}: alles in Ordnung`); process.exit(f ? 1 : 0); };
  return { check, spieler, warte, sende, schlaf, anzahl, stelle, rede, sag, sprich, ding, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, aufheben, sammeln, herstellen, fischen, ende,
    log: () => log, HELD, ID, ABSCHLUSS, fehler: () => f };
}
