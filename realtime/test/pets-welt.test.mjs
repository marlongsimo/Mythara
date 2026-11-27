/*
 * Riftmere – Skilling-Pets Ende zu Ende (#170, shared/pets.ts, server/src/sammeln.ts + inventar.ts): echter Spielserver, nachgebildete Supabase, Welt-Verbindung.
 * Mit PET_CHANCE=1 (nur für Tests) findet Anna beim ersten Kupfererz Steinbert: im Spielerstand (pets, petAktiv), nicht im Rucksack, Ansage im Chat für alle,
 * Ben sieht es (spieler.p), je Beruf nur eins, wegschicken und rufen, gespeichert. Ohne Zwang (Arbeitswert): Chance je Stufe.
 * Aufruf: node test/pets-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module"; import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const roh = () => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", quests: { die_gesperrte_strasse: { s: "fertig" } } });
const HELD = { [A]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: ["spitzhacke_training", "holzbeil_training"], v: 2 } }, [B]: { ...roh(), inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [], v: 2 } } }, GESPEICHERT = [];
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
  send(404, {}); }); }).listen(8873);
let srv, log = "";
const starten = async (env) => { srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8871", SUPABASE_URL: "http://localhost:8873", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", ...env }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200)); };
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8785".replace("8785", "8871") + "/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], berg: [], holz: [], adern: null, warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "holz") s.holz.push(m); if (m.t === "berg") s.berg.push(m); if (m.t === "adern") s.adern = m.weg; if (m.t === "spieler") s.spieler = m.liste; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") } : { t: "anmeldung", gast: true })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const anzahl = (s, g) => (s.inv.rucksack || []).filter((x) => (typeof x === "string" ? x : x.g) === g).length;
const ST = JSON.parse(readFileSync("shared/bergbau_standorte.json", "utf8")).senken.flatMap((l) => l.adern).filter((b) => b.art !== "waldstein") /* ohne den Questfels (Quest 03) */, KUPFER = ST.find((b) => b.art === "kupfer"), EISEN = ST.find((b) => b.art === "eisen");
const EICHE = JSON.parse(readFileSync("shared/holz_standorte.json", "utf8")).lichtungen.flatMap((l) => l.baeume).find((b) => b.art === "eiche");
const TA = "tok_anna_" + "x".repeat(30), TB = "tok_ben__" + "x".repeat(30);
const bei = async (s, b, d = 1.2) => { sende(s, { t: "pos", x: 0, y: 0, wx: b.x + d, wy: b.y }); await schlaf(150); };
const nein = async (s, id, t = "berg") => { s[t] = []; sende(s, { t, tat: "start", id }); return (await warte(s, (m) => m.t === t && (m.tat === "nein" || m.tat === "start"))) || {}; };
try {
  await starten({ BERG_FALL: "0", BERG_KERN: "0", PET_CHANCE: "1" });
  const anna = await spieler(TA, KUPFER.region), ben = await spieler(TB, KUPFER.region); await warte(anna, (m) => m.t === "inventar"); await warte(ben, (m) => m.t === "inventar");
  check(!(anna.inv.pets || []).length, "Anna hat noch keinen Begleiter");
  await bei(anna, KUPFER); await bei(ben, KUPFER, 2); const st = await nein(anna, KUPFER.id); check(st.tat === "start", "Anna baut Kupfer ab");
  const fund = await warte(anna, (m) => m.t === "pet" && m.tat === "fund", 15000); await schlaf(300);
  check(fund && fund.id === "steinbert", "beim Abbau gefunden: Steinbert (Bergbau)");
  check((anna.inv.pets || []).join() === "steinbert" && anna.inv.petAktiv === "steinbert", "im Spielerstand (pets, petAktiv) – es folgt sofort");
  check(!(anna.inv.rucksack || []).some((x) => /stein/.test(typeof x === "string" ? x : x.g)), "nicht im Rucksack (gebunden, nicht handelbar, geht nicht verloren)");
  check(anna.chat.some((t) => /Anna hat beim Bergbau einen kleinen Begleiter gefunden: Steinbert/.test(t)) && ben.chat.some((t) => /Steinbert/.test(t)), "Ansage im Chat – auch Ben liest sie");
  await warte(anna, (m) => m.t === "berg" && m.tat === "erz", 15000); await schlaf(300);
  check((anna.inv.pets || []).length === 1, "je Beruf nur eins: weiterer Abbau, kein zweiter Fund");
  sende(anna, { t: "berg", tat: "stop" }); await bei(anna, KUPFER); await schlaf(2500);
  check(ben.spieler && ben.spieler.some((d) => d.n === "Anna" && d.p === "steinbert"), "Ben sieht Steinbert bei Anna (Spielerliste: p)");
  sende(anna, { t: "pet", tat: "weg" }); await schlaf(400); check(!anna.inv.petAktiv && (anna.inv.pets || []).includes("steinbert"), "weggeschickt: folgt nicht mehr, bleibt aber Annas");
  await schlaf(2300); check(ben.spieler && ben.spieler.some((d) => d.n === "Anna" && !d.p), "Ben sieht kein Pet mehr bei Anna");
  sende(anna, { t: "pet", tat: "rufen", id: "nagbert" }); await schlaf(400); check(!anna.inv.petAktiv && anna.chat.some((t) => /noch nicht gefunden/.test(t)), "ein fremdes Pet (Nagbert) lässt sich nicht rufen");
  sende(anna, { t: "pet", tat: "rufen", id: "steinbert" }); await schlaf(400); check(anna.inv.petAktiv === "steinbert", "gerufen: Steinbert folgt wieder");
  await schlaf(1800); const gesp = GESPEICHERT[GESPEICHERT.length - 1]; check(gesp && (gesp.p_inventar.pets || []).includes("steinbert") && gesp.p_inventar.petAktiv === "steinbert", "gespeichert (rpg_held_inventar_setzen: pets, petAktiv)");
  anna.ws.close(); ben.ws.close(); srv.kill(); await schlaf(400);
  /* neu angemeldet: Steinbert ist noch da und folgt */
  await starten({ BERG_FALL: "0", BERG_KERN: "0" }); const a2 = await spieler(TA, KUPFER.region); await warte(a2, (m) => m.t === "inventar");
  check((a2.inv.pets || []).includes("steinbert") && a2.inv.petAktiv === "steinbert", "nach dem neuen Anmelden: Steinbert ist noch da und folgt");
  a2.ws.close();
} catch (e) { console.error(e); f++; }
srv && srv.kill(); sb.close();
console.log(f ? `\nPets: ${f} FEHLER` : "\nPets: alles in Ordnung");
process.exit(f ? 1 : 0);
