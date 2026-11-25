/*
 * Mythara – Läden am Marktplatz und Tränke Ende zu Ende: echter Spielserver (server/dist/server.js), nachgebildete Supabase.
 * Anna hat 20 Splitter und 2 Kleine Heiltränke; sie kauft am Tränkestand (nah genug), wird zu weit weg abgelehnt, kann sich Teures nicht leisten,
 * kauft nichts, was der Laden nicht führt; Trinken bei vollem Leben geht nicht (Trank bleibt), mit gemerkten 4 LP heilt der kleine Trank 5 (nie über das Maximum).
 * Ein Gast kann nicht kaufen. Aufruf: node test/laden-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A }, NAME = { [A]: "Anna" }, LP = [];
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_lp: 0, lp_stand: null,
  inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "splitter", n: 200 }, "kleiner_heiltrank", "kleiner_heiltrank", "eidschwert_gewoehnlich", "eidzweihaender_gewoehnlich"], v: 2 } } };
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_held_setzen") || req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_position_setzen")) return send(200, { ok: true });
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_lp_setzen") { const a = JSON.parse(b); LP.push(a); HELD[a.p_user].lp_stand = a.p_lp === null ? null : { lp: a.p_lp, z: Date.now() / 1000 }; return send(200, true); }
  send(404, {}); }); }).listen(8798);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8788", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8788/?welt=1&ort=waldmark", { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") } : { t: "anmeldung" })); fertig(s); }); }); }
const warte = (s, f, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m));
const geld = (inv) => inv.rucksack.reduce((n, x) => n + (typeof x !== "string" && x.g === "splitter" ? x.n : 0), 0);
const zahl = (inv, g) => inv.rucksack.reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const system = (s) => warte(s, (m) => m.t === "chat" && m.kanal === "system");
try {
  const anna = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna, (m) => m.t === "inventar");
  check(anna.inv && geld(anna.inv) === 200 && zahl(anna.inv, "kleiner_heiltrank") === 2, `Anna: 200 Splitter, 2 Kleine Heiltränke (${JSON.stringify(anna.inv.rucksack)})`);
  /* zu weit weg */
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6470.5, wy: 6450.5 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "kaufen", laden: "traenke", g: "kleiner_heiltrank" }); const weit = await system(anna);
  check(weit && /näher an den Stand von Mira/.test(weit.text) && geld(anna.inv) === 200, `Zu weit vom Stand: „${weit && weit.text}“`);
  /* vor dem Tränkestand */
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6456.5, wy: 6438.5 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "kaufen", laden: "traenke", g: "heiltrank" }); const k1 = await warte(anna, (m) => m.t === "gekauft"); await new Promise((r) => setTimeout(r, 200));
  check(k1 && k1.preis === 150 && geld(anna.inv) === 50 && zahl(anna.inv, "heiltrank") === 1, `Heiltrank gekauft: −150 Splitter (${geld(anna.inv)} übrig), liegt im Rucksack`);
  sende(anna, { t: "kaufen", laden: "traenke", g: "heiltrank" }); const arm = await system(anna);
  check(arm && /fehlen dir 100 Splitter/.test(arm.text) && geld(anna.inv) === 50, `Zu teuer: „${arm && arm.text}“`);
  sende(anna, { t: "kaufen", laden: "traenke", g: "eidschwert" }); const nicht = await system(anna);
  check(nicht && /gibt es hier nicht/.test(nicht.text), `Was der Laden nicht führt: „${nicht && nicht.text}“`);
  sende(anna, { t: "kaufen", laden: "waffen", g: "ritterschwert" }); const weit2 = await system(anna);
  check(weit2 && /Brann/.test(weit2.text), "Am Tränkestand kann man keine Waffen beim Schmied kaufen (zu weit)");
  /* Der Handwerker vor der Schmiede: Werkzeug (Hammer), Brann am Markt führt es nicht mehr */
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6471.6, wy: 6432.9 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "kaufen", laden: "handwerker", g: "hammer" }); const hk = await warte(anna, (m) => m.t === "gekauft"); await new Promise((r) => setTimeout(r, 200));
  check(hk && hk.preis === 10 && zahl(anna.inv, "hammer") === 1 && geld(anna.inv) === 40, `Hammer beim Handwerker vor der Schmiede gekauft (−10 Splitter, ${geld(anna.inv)} übrig)`);
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6439.5, wy: 6436.5 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "kaufen", laden: "waffen", g: "holzbeil_training" }); const keinWz = await system(anna);
  check(keinWz && /gibt es hier nicht/.test(keinWz.text), `Brann am Markt führt kein Werkzeug mehr: „${keinWz && keinWz.text}“`);
  /* Trinken: volles Leben → nichts passiert */
  const i = anna.inv.rucksack.findIndex((x) => x === "kleiner_heiltrank");
  sende(anna, { t: "inv", tat: "trinken", i }); const voll = await system(anna);
  check(voll && /volles Leben/.test(voll.text) && zahl(anna.inv, "kleiner_heiltrank") === 2, `Volles Leben: „${voll && voll.text}“, der Trank bleibt`);
  /* gemerkte 4 von 10 LP (nach einem Kampf) → +5 */
  HELD[A].lp_stand = { lp: 4, z: Date.now() / 1000 };
  sende(anna, { t: "inv", tat: "trinken", i }); const g1 = await warte(anna, (m) => m.t === "getrunken"); await new Promise((r) => setTimeout(r, 200));
  check(g1 && g1.n === 5 && g1.lp === 9 && g1.max === 10 && zahl(anna.inv, "kleiner_heiltrank") === 1 && LP.at(-1) && LP.at(-1).p_lp === 9, `Kleiner Heiltrank bei 4 / 10: +${g1 && g1.n} → ${g1 && g1.lp} / ${g1 && g1.max}, gespeichert, einer weniger`);
  const j = anna.inv.rucksack.findIndex((x) => x === "kleiner_heiltrank");
  sende(anna, { t: "inv", tat: "trinken", i: j }); const g2 = await warte(anna, (m) => m.t === "getrunken"); await new Promise((r) => setTimeout(r, 300));
  check(g2 && g2.n === 1 && g2.lp === 10 && LP.at(-1).p_lp === null, `Zweiter bei 9 / 10: nur +${g2 && g2.n} (nie über das Maximum), Leben wieder voll (${JSON.stringify(g2)} · ${JSON.stringify(LP.at(-1))})`);
  const k = anna.inv.rucksack.findIndex((x) => typeof x !== "string" && x.g === "splitter");
  sende(anna, { t: "inv", tat: "trinken", i: k }); const kein = await system(anna); check(kein && /nicht trinken/.test(kein.text), "Splitter kann man nicht trinken");
  /* Anforderung: Einfaches Schwert braucht Geschick 10 */
  { const i = anna.inv.rucksack.indexOf("eidschwert_gewoehnlich"); sende(anna, { t: "inv", tat: "anlegen", i }); const n = await system(anna);
    check(n && /Geschick 10 \(du hast 1\)/.test(n.text) && anna.inv.angelegt.waffe === "ritterschwert", `Ohne Geschick 10 kein Einfaches Schwert: „${n && n.text}“`);
    HELD[A].skill_geschick = 981; HELD[A].skill_staerke = 981; sende(anna, { t: "inv", tat: "anlegen", i }); await warte(anna, (m) => m.t === "inventar");
    check(anna.inv.angelegt.waffe === "eidschwert_gewoehnlich" && anna.inv.rucksack.includes("ritterschwert"), "Mit Geschick 10 (981 XP): angelegt, das Trainingsschwert liegt im Rucksack"); }
  /* Zweihänder: der Schild wandert in den Rucksack; ein Schild legt den Zweihänder wieder ab */
  { sende(anna, { t: "inv", tat: "anlegen", i: anna.inv.rucksack.indexOf("eidzweihaender_gewoehnlich") }); await warte(anna, (m) => m.t === "inventar");
    check(anna.inv.angelegt.waffe === "eidzweihaender_gewoehnlich" && !anna.inv.angelegt.nebenhand && anna.inv.rucksack.includes("rundschild"), `Zweihänder angelegt: kein Schild mehr in der Hand (${JSON.stringify(anna.inv.angelegt)})`);
    sende(anna, { t: "inv", tat: "anlegen", i: anna.inv.rucksack.indexOf("rundschild") }); await warte(anna, (m) => m.t === "inventar");
    check(anna.inv.angelegt.nebenhand === "rundschild" && !anna.inv.angelegt.waffe && anna.inv.rucksack.includes("eidzweihaender_gewoehnlich"), `Schild angelegt: der Zweihänder kommt in den Rucksack (${JSON.stringify(anna.inv.angelegt)})`); }
  /* Gast */
  const gast = await spieler(null); await new Promise((r) => setTimeout(r, 500)); sende(gast, { t: "pos", x: 0, y: 0, wx: 6456.5, wy: 6441.5 });
  sende(gast, { t: "kaufen", laden: "traenke", g: "kleiner_heiltrank" }); const g = await system(gast); check(g && /mit Konto/.test(g.text), "Ein Gast kann nicht einkaufen");
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-2000));
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Läden und Tränke mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
