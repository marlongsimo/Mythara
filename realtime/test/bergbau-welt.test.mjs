/*
 * Mythara – Bergbau Ende zu Ende (shared/bergbau.ts, server/src/bergbau.ts → sammeln.ts): echter Spielserver, nachgebildete Supabase, Welt-Verbindung.
 * Ohne Spitzhacke / zu weit / zu niedriges Level → abgelehnt; mit Trainings-Spitzhacke an der Kupferader: Schläge im Takt, Erz in den Rucksack, XP (berufe.bergbau),
 * Riss (zwei Erze, 50 % mehr XP), Weggehen bricht ab; Holzfällen beendet den Bergbau; eine erschöpfte Ader ist für alle leer; Gäste dürfen nicht.
 * Lauf 1 mit BERG_FALL=0 und BERG_KERN=1, Lauf 2 mit BERG_FALL=100 (erschöpft beim ersten Erz).
 * Aufruf: node test/bergbau-welt.test.mjs   (nach node build.mjs)
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
  send(404, {}); }); }).listen(8793);
let srv, log = "";
const starten = async (env) => { srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8783", SUPABASE_URL: "http://localhost:8793", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", ...env }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200)); };
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8785".replace("8785", "8783") + "/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], berg: [], holz: [], adern: null, warte: [] };
  ws.on("message", (r) => { const m = JSON.parse(String(r)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "holz") s.holz.push(m); if (m.t === "berg") s.berg.push(m); if (m.t === "adern") s.adern = m.weg; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
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
  /* die Sammelstellen der Welt (#142) zählen extra – ALT sind die Stellen von vorher */
  /* Gruppen der Welt erkennt man an der ID oder am Namen – so zählt auch eine Gruppe, die in shared/ noch in älterer Fassung steht (Welt hat sie seitdem geändert) */
  const SAMMEL = JSON.parse(readFileSync("welt/sammelstellen.json", "utf8")).senken, NAMEN = new Set(SAMMEL.map((g) => g.name));
  const NEU_IDS = new Set([...SAMMEL.flatMap((g) => g.adern.map((p) => p.id)), ...JSON.parse(readFileSync("shared/bergbau_standorte.json", "utf8")).senken.filter((g) => NAMEN.has(g.name)).flatMap((g) => g.adern.map((p) => p.id))]), ALT = ST.filter((b) => !NEU_IDS.has(b.id));
  check(ALT.length === 17 && ALT.filter((b) => b.art === "kupfer").length === 3 && ALT.filter((b) => b.art === "eisen").length === 8 && ALT.filter((b) => b.art === "schwarzeisen").length === 6, `17 Erzadern: 3 Kupfer, 8 Eisen, 6 Schwarzeisen (${ALT.length}, dazu ${ST.length - ALT.length} Sammelstellen aus welt/sammelstellen.json, #142)`);
  await starten({ BERG_FALL: "0", BERG_KERN: "1" });
  const anna = await spieler(TA, KUPFER.region), ben = await spieler(TB, KUPFER.region); await warte(anna, (m) => m.t === "inventar"); await warte(ben, (m) => m.t === "inventar");
  check(Array.isArray(anna.adern) && anna.adern.length === 0, "Beim Anmelden: Stand der Adern (alle voll)");
  await bei(ben, KUPFER); check((await nein(ben, KUPFER.id)).text === "Du brauchst eine Spitzhacke.", "Ohne Spitzhacke: „Du brauchst eine Spitzhacke.“");
  await bei(anna, KUPFER, 6); check(/näher/.test((await nein(anna, KUPFER.id)).text), "Zu weit weg: „Geh näher an die Ader.“");
  await bei(anna, EISEN); check(/Bergbau 10/.test((await nein(anna, EISEN.id)).text), "Eisen mit Level 1: „… brauchst du Bergbau 10.“");
  await bei(anna, KUPFER); const st = await nein(anna, KUPFER.id); check(st.tat === "start" && st.werkzeug === "spitzhacke_training", "Kupferader mit Trainings-Spitzhacke: es geht los");
  const t0 = Date.now(); const hieb = await warte(anna, (m) => m.t === "berg" && m.tat === "hieb", 3500); check(hieb && Date.now() - t0 > 1300, `Erster Schlag nach etwa 1,5 Sekunden (${Date.now() - t0} ms)`);
  const riss = await warte(anna, (m) => m.t === "berg" && m.tat === "riss", 6000); check(riss && riss.ms === 1500, "Riss: die Adern glühen auf (1,5 s)");
  sende(anna, { t: "berg", tat: "riss" }); const k = await warte(anna, (m) => m.t === "berg" && m.tat === "erz" && m.riss, 2000);
  check(k && k.n === 2 && k.xp === 60 && k.g === "erz_kupfer", `Riss angetippt: zwei Kupfererze und 50 % mehr XP (${k && k.n} Erze, ${k && k.xp} XP)`);
  const normal = await warte(anna, (m) => m.t === "berg" && m.tat === "erz" && !m.riss, 40000);
  check(normal && normal.n === 1 && normal.xp === 20, `Ein normales Erz: 20 XP (${normal && normal.xp})`); await schlaf(200);
  const xp = anna.inv.berufe && anna.inv.berufe.bergbau; check(xp >= 80 && anzahl(anna, "erz_kupfer") >= 3, `Im Rucksack ${anzahl(anna, "erz_kupfer")} Kupfererze, Bergbau-XP ${xp} (Feld „berufe“)`);
  check(!(anna.inv.berufe.holzfaellerei > 0), "Holzfällerei-XP bleiben unberührt");
  /* Holzfällen beendet den Bergbau */
  anna.berg = []; await bei(anna, EICHE); const h = await nein(anna, EICHE.id, "holz"); await schlaf(200);
  check(h.tat === "start" && anna.berg.some((m) => m.tat === "stop"), "An der Eiche angefangen: der Bergbau hört auf, das Fällen beginnt");
  sende(anna, { t: "holz", tat: "stop" }); await schlaf(200);
  await bei(anna, KUPFER); await nein(anna, KUPFER.id); anna.berg = []; await bei(anna, KUPFER, 8); await schlaf(400); const stop = anna.berg.find((m) => m.tat === "stop"); check(stop && stop.grund === "weg", "Weggegangen: der Bergbau hört auf");
  await schlaf(1800); const gesp = GESPEICHERT[GESPEICHERT.length - 1]; check(gesp && gesp.p_inventar.berufe && gesp.p_inventar.berufe.bergbau >= xp, "Die XP sind gespeichert (rpg_held_inventar_setzen, berufe.bergbau)");
  const xpEnde = HELD[A].inventar.berufe.bergbau;
  const gast = await spieler(null, KUPFER.region); await schlaf(400); await bei(gast, KUPFER); check(/Konto/.test((await nein(gast, KUPFER.id)).text || ""), "Gast: Bergbau nur mit Konto"); gast.ws.close();
  anna.ws.close(); ben.ws.close(); srv.kill(); await schlaf(400);
  /* Lauf 2: die Ader ist beim ersten Erz erschöpft – leer für alle */
  await starten({ BERG_FALL: "100", BERG_KERN: "0" });
  const a2 = await spieler(TA, KUPFER.region), b2 = await spieler(TB, KUPFER.region); await warte(a2, (m) => m.t === "inventar"); await schlaf(300);
  await bei(a2, KUPFER); await nein(a2, KUPFER.id); const leer = await warte(b2, (m) => m.t === "adern" && m.weg.some(([id]) => id === KUPFER.id), 40000);
  check(leer && leer.weg.find(([id]) => id === KUPFER.id)[1] <= 10, `Die Kupferader ist erschöpft: Ben sieht sie leer (füllt sich in ${leer && leer.weg[0][1]} s)`);
  const s2 = a2.berg.find((m) => m.tat === "stop"); check(s2 && s2.grund === "leer", "Anna hört auf: „leer“");
  check(/erschöpft/.test((await nein(a2, KUPFER.id)).text || ""), "An der leeren Ader: „Die Kupferader ist erschöpft …“");
  check(a2.inv.berufe.bergbau === xpEnde + 20, `Nach dem Neustart weiter gezählt: ${a2.inv.berufe.bergbau} XP`);
  a2.ws.close(); b2.ws.close();
} catch (e) { check(false, "Ausnahme: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.split("\n").slice(-20).join("\n"));
console.log(f ? f + " Fehler" : "Bergbau mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
