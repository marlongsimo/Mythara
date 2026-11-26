/*
 * Mythara – Bank Ende zu Ende (shared/bank.ts): echter Spielserver (server/dist/server.js), nachgebildete Supabase, Welt-Verbindung.
 * Anna zahlt am Schalter der Waldmark ein und hebt ab (Mengen, „Alle“, ganzer Rucksack, Ausrüstung), die Bank wird im Inventar gespeichert und
 * ist nach einem Neustart des Servers noch da; zu weit weg, falscher Ort und ein Gast werden abgelehnt; in Weidenhain gilt dasselbe Konto.
 * Aufruf: node test/bank-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A }, NAME = { [A]: "Anna" };
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } },
  inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "splitter", n: 100 }, "magiepanzer", { g: "heiltrank", n: 3 }, "kleiner_heiltrank", "kleiner_heiltrank"], v: 2 } } }, GESPEICHERT = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position") || req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); GESPEICHERT.push(JSON.parse(JSON.stringify(a))); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url.startsWith("/rest/v1/rpc/")) return send(200, true);
  send(404, {}); }); }).listen(8795);
let srv, log = "";
const starten = async () => { srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8785", SUPABASE_URL: "http://localhost:8795", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200)); };
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8785/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token } : { t: "anmeldung", gast: true })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const bank = (s) => Object.fromEntries((s.inv && s.inv.bank) || []), imRucksack = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const tun = async (s, m) => { s.chat = []; sende(s, { t: "bank", ...m }); await Promise.race([warte(s, (x) => x.t === "inventar"), warte(s, (x) => x.t === "chat")]); await schlaf(80); };
const TOK = "tok_anna_" + "x".repeat(30);
/* Die Schalter in shared/bank.ts stehen dort, wo die Weltdaten sie haben (Interaktionen „bankschalter…“) */
{ const fs = await import("node:fs"), path = await import("node:path"); const st = [];
  for (const d of fs.readdirSync("../echtzeit/welt3d").filter((x) => /^\d+_\d+\.json$/.test(x))) { const j = JSON.parse(fs.readFileSync(path.join("../echtzeit/welt3d", d), "utf8")); for (const a of j.interaktionen || []) if (/^bankschalter/.test(a.id)) st.push(a); }
  const B = { bankschalter_links: [6476.6, 6429.1], bankschalter_rechts: [6479.4, 6429.1], bankschalter: [6436.5, 6676.4] };
  check(st.length === 3 && st.every((a) => B[a.id] && Math.hypot(a.x - B[a.id][0], a.y - B[a.id][1]) < 0.05), `Drei Bankschalter in den Weltdaten, an denselben Stellen wie in shared/bank.ts (${st.map((a) => a.id + "@" + a.x + "," + a.y).join("; ")})`); }
try {
  await starten();
  const anna = await spieler(TOK, "waldmark"); await warte(anna, (m) => m.t === "inventar");
  check(anna.inv && !anna.inv.bank, "Vor dem ersten Einzahlen: keine Bank im Inventar");
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6448, wy: 6438 }); await schlaf(150);
  await tun(anna, { tat: "ein", g: "splitter", menge: 10 }); check(anna.chat.some((t) => /näher/.test(t)) && !bank(anna).splitter, "Am Marktplatz (zu weit weg): „Geh näher an einen Bankschalter.“");
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6476.6, wy: 6429.1 }); await schlaf(150); /* am linken Schalter */
  await tun(anna, { tat: "ein", g: "splitter", menge: 30 }); check(bank(anna).splitter === 30 && imRucksack(anna, "splitter") === 70, `30 Splitter eingezahlt (Bank ${bank(anna).splitter}, Rucksack ${imRucksack(anna, "splitter")})`);
  await tun(anna, { tat: "ein", g: "kleiner_heiltrank", menge: 0 }); check(bank(anna).kleiner_heiltrank === 2 && imRucksack(anna, "kleiner_heiltrank") === 0, "„Alle“ Kleinen Heiltränke (zwei Fächer) → in der Bank gestapelt: 2");
  await tun(anna, { tat: "ein", g: "ritterschwert", menge: 1 }); check(anna.chat.some((t) => /nicht im Rucksack/.test(t)), "Was nicht im Rucksack liegt, kann man nicht einzahlen");
  await tun(anna, { tat: "ab", g: "splitter", menge: 999 }); check(!bank(anna).splitter && imRucksack(anna, "splitter") === 100, "Mehr abheben als da ist: es kommt alles (30), die Bank-Zeile verschwindet");
  await tun(anna, { tat: "alles", was: "rucksack" }); check(anna.inv.rucksack.length === 0 && bank(anna).splitter === 100 && bank(anna).heiltrank === 3 && bank(anna).magiepanzer === 1, `Rucksack einzahlen: Rucksack leer, Bank ${JSON.stringify(bank(anna))}`);
  await tun(anna, { tat: "alles", was: "ausruestung" }); check(!anna.inv.angelegt.waffe && !anna.inv.angelegt.nebenhand && bank(anna).ritterschwert === 1 && bank(anna).rundschild === 1, "Ausrüstung einzahlen: Schwert und Schild in der Bank");
  await tun(anna, { tat: "ab", g: "heiltrank", menge: 2 }); check(imRucksack(anna, "heiltrank") === 2 && bank(anna).heiltrank === 1, "2 Heiltränke abgehoben, 1 bleibt");
  await tun(anna, { tat: "ab", g: "nichtda", menge: 1 }); check(anna.chat.some((t) => /nicht in deiner Bank/.test(t)), "Unbekanntes kann man nicht abheben");
  await tun(anna, { tat: "ein", g: "splitter", menge: -5 }); check(anna.chat.some((t) => /versteht/.test(t)), "Ungültige Menge wird abgelehnt");
  /* Reiter wie in OSRS: Splitter in einen neuen Reiter, Lücken werden geschlossen, Unsinn abgelehnt */
  const tabs = () => (anna.inv && anna.inv.bankTabs) || {};
  await tun(anna, { tat: "tab", g: "splitter", tab: 1 }); check(tabs().splitter === 1, `Splitter in Reiter 1 gelegt (${JSON.stringify(tabs())})`);
  await tun(anna, { tat: "tab", g: "splitter", tab: 5 }); check(anna.chat.some((t) => /Mehr Reiter|gibt es nicht/.test(t)) && tabs().splitter === 1, "Reiter 5 ohne Reiter 2–4: abgelehnt");
  await tun(anna, { tat: "tab", g: "splitter", tab: 0 }); check(!tabs().splitter, "Aus dem Reiter genommen: ohne Reiter");
  await tun(anna, { tat: "tab", g: "splitter", tab: 1 });
  await schlaf(1800); const zuletzt = GESPEICHERT[GESPEICHERT.length - 1];
  check(zuletzt && zuletzt.p_inventar.bankTabs && zuletzt.p_inventar.bankTabs.splitter === 1, "Reiter gespeichert (Feld „bankTabs“)");
  check(zuletzt && Array.isArray(zuletzt.p_inventar.bank) && zuletzt.p_inventar.bank.some(([g, n]) => g === "splitter" && n === 100), "Gespeichert über rpg_held_inventar_setzen: die Bank liegt im Inventar (Feld „bank“)");
  check(JSON.stringify(zuletzt.p_inventar).length < 16384, `Inventar bleibt unter der Grenze der Datenbank (${JSON.stringify(zuletzt.p_inventar).length} Zeichen)`);
  /* falscher Ort: an denselben Koordinaten, aber im Kreuzwald angemeldet */
  anna.ws.close(); await schlaf(300);
  const kreuz = await spieler(TOK, "waldweg"); await warte(kreuz, (m) => m.t === "inventar"); sende(kreuz, { t: "pos", x: 0, y: 0, wx: 6476.6, wy: 6429.1 }); await schlaf(150);
  await tun(kreuz, { tat: "ab", g: "splitter", menge: 1 }); check(kreuz.chat.some((t) => /näher/.test(t)), "Anderer Ort (Kreuzwald) mit den Koordinaten des Schalters: abgelehnt"); kreuz.ws.close();
  /* Neustart des Servers: die Bank kommt aus der Datenbank zurück */
  srv.kill(); await schlaf(500); await starten();
  const weid = await spieler(TOK, "weidenhain"); await warte(weid, (m) => m.t === "inventar");
  check(bank(weid).splitter === 100 && bank(weid).ritterschwert === 1, "Nach einem Neustart des Servers ist die Bank noch da");
  sende(weid, { t: "pos", x: 0, y: 0, wx: 6436.5, wy: 6676.4 }); await schlaf(150);
  await tun(weid, { tat: "ab", g: "ritterschwert", menge: 1 }); check(imRucksack(weid, "ritterschwert") === 1 && !bank(weid).ritterschwert, "Am Bankschalter in Weidenhain: dasselbe Konto, Schwert abgehoben");
  weid.ws.close();
  const gast = await spieler(null, "waldmark"); await schlaf(500); sende(gast, { t: "pos", x: 0, y: 0, wx: 6476.6, wy: 6429.1 }); await schlaf(100);
  await tun(gast, { tat: "ein", g: "splitter", menge: 1 }); check(gast.chat.some((t) => /mit Konto/.test(t)), "Gast: „Eine Bank gibt es mit Konto“"); gast.ws.close();
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").slice(-20).join("\n"));
console.log(f ? f + " Fehler" : "Bank mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
