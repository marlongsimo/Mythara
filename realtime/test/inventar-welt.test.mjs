/*
 * Mythara – Inventar und Boden Ende zu Ende: echter Spielserver (server/dist/server.js), nachgebildete Supabase, zwei Spieler über die Welt-Verbindung.
 * Anna bekommt ihr Inventar vom Server, legt den Schild ab, lässt ihn fallen (nur sie sieht ihn), Ben kann ihn nicht aufheben, Anna hebt ihn wieder auf,
 * legt ihn an; das Inventar wird gespeichert; Bitten eines Gastes werden abgelehnt. Aufruf: node test/inventar-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B }, NAME = { [A]: "Anna", [B]: "Ben" };
const HELD = { [A]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", inventar: null },
  [B]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "blond", hautfarbe: "hell", waffe: "bogen", inventar: null } }, GESPEICHERT = [];
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_held_setzen") || req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_position_setzen")) return send(200, { ok: true });
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); GESPEICHERT.push(a); HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  send(404, {}); }); }).listen(8796);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8786", SUPABASE_URL: "http://localhost:8796", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8786/?welt=1&ort=waldweg", { origin: "http://localhost:8765" }), s = { ws, inv: null, boden: [], chat: [], ich: null, warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "boden") s.boden = m.liste; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); if (m.t === "ich") s.ich = m; for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token })); fertig(s); }); }); }
const warte = (s, f, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m));
try {
  const anna = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna, (m) => m.t === "inventar");
  check(anna.inv && anna.inv.angelegt.waffe === "ritterschwert" && anna.inv.angelegt.nebenhand === "rundschild" && anna.inv.rucksack.length === 0, `Anna bekommt ihr Inventar vom Server (aus der Startwaffe): ${JSON.stringify(anna.inv)}`);
  const ben = await spieler("tok_ben__" + "x".repeat(30)); await warte(ben, (m) => m.t === "inventar");
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6500, wy: 6500 }); sende(ben, { t: "pos", x: 0, y: 0, wx: 6501, wy: 6500 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "inv", tat: "ablegen", platz: "nebenhand" }); await warte(anna, (m) => m.t === "inventar");
  check(!anna.inv.angelegt.nebenhand && anna.inv.rucksack[0] === "rundschild", "Schild abgelegt: im Rucksack");
  sende(anna, { t: "inv", tat: "fallen", i: 0 }); await warte(anna, (m) => m.t === "inventar"); await warte(anna, (m) => m.t === "boden" && m.liste.length > 0, 2500);
  const ding = anna.boden[0]; check(anna.inv.rucksack.length === 0 && ding && ding.g === "rundschild" && Math.abs(ding.x - 6500) < 0.01, "Fallen gelassen: aus dem Rucksack, liegt an Annas Stelle am Boden");
  await new Promise((r) => setTimeout(r, 1300)); check(ben.boden.length === 0, "Ben (direkt daneben) sieht ihn in der ersten Minute nicht");
  sende(ben, { t: "aufheben", id: ding.i }); await warte(ben, (m) => m.t === "chat"); check(ben.chat.some((t) => /nicht/.test(t)) && !ben.inv.rucksack.includes("rundschild"), "Ben kann ihn nicht aufheben");
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6510, wy: 6500 }); await new Promise((r) => setTimeout(r, 200)); sende(anna, { t: "aufheben", id: ding.i }); await warte(anna, (m) => m.t === "chat");
  check(anna.chat.some((t) => /weit/.test(t)), "Anna 10 Felder entfernt: „Zu weit weg“");
  sende(anna, { t: "pos", x: 0, y: 0, wx: 6500.5, wy: 6500 }); await new Promise((r) => setTimeout(r, 200)); sende(anna, { t: "aufheben", id: ding.i }); await warte(anna, (m) => m.t === "inventar");
  await warte(anna, (m) => m.t === "boden" && m.liste.length === 0, 2500); check(anna.inv.rucksack[0] === "rundschild" && anna.boden.length === 0, "Anna hebt ihn auf: wieder im Rucksack, vom Boden verschwunden");
  sende(anna, { t: "inv", tat: "anlegen", i: 0 }); await warte(anna, (m) => m.t === "inventar"); check(anna.inv.angelegt.nebenhand === "rundschild" && anna.inv.rucksack.length === 0, "Wieder angelegt: zählt im Ausrüstungsfenster");
  sende(anna, { t: "inv", tat: "anlegen", i: 7 }); await warte(anna, (m) => m.t === "chat"); check(anna.chat.some((t) => /gibt es im Rucksack nicht/.test(t)), "Unsinnige Bitte abgelehnt");
  /* zwei Dinge an derselben Stelle: mit einer Bitte („Alles aufheben“) beide zurück */
  sende(anna, { t: "inv", tat: "ablegen", platz: "nebenhand" }); await warte(anna, (m) => m.t === "inventar"); sende(anna, { t: "inv", tat: "ablegen", platz: "waffe" }); await warte(anna, (m) => m.t === "inventar");
  sende(anna, { t: "inv", tat: "fallen", i: 0 }); await warte(anna, (m) => m.t === "inventar"); sende(anna, { t: "inv", tat: "fallen", i: 0 }); await warte(anna, (m) => m.t === "inventar");
  await warte(anna, (m) => m.t === "boden" && m.liste.length === 2, 2500); check(anna.boden.length === 2 && anna.inv.rucksack.length === 0, `Schild und Schwert liegen an derselben Stelle (${anna.boden.map((d) => d.g)})`);
  sende(anna, { t: "aufheben", ids: anna.boden.map((d) => d.i) }); await warte(anna, (m) => m.t === "boden" && m.liste.length === 0, 2500);
  check(anna.boden.length === 0 && anna.inv.rucksack.length === 2, `„Alles aufheben“: beide mit einer Bitte im Rucksack (${JSON.stringify(anna.inv.rucksack)})`);
  for (const g of ["rundschild", "ritterschwert"]) { sende(anna, { t: "inv", tat: "anlegen", i: anna.inv.rucksack.indexOf(g) }); await warte(anna, (m) => m.t === "inventar"); }
  check(anna.inv.angelegt.waffe === "ritterschwert" && anna.inv.angelegt.nebenhand === "rundschild", "Beides wieder angelegt");
  await new Promise((r) => setTimeout(r, 2000)); const zuletzt = GESPEICHERT.filter((g) => g.p_user === A).pop();
  check(zuletzt && zuletzt.p_inventar.angelegt.nebenhand === "rundschild" && zuletzt.p_inventar.rucksack.length === 0, `Der Server speichert das Inventar (rpg_held_inventar_setzen, ${GESPEICHERT.length}-mal)`);
  /* Gast: kein Inventar, keine Bitten */
  const gast = await new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8786/?welt=1&ort=waldweg", { origin: "http://localhost:8765" }), s = { ws, chat: [], inv: null, warte: [] };
    ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
    ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token: "" })); fertig(s); }); });
  await new Promise((r) => setTimeout(r, 500)); sende(gast, { t: "inv", tat: "ablegen", platz: "waffe" }); await warte(gast, (m) => m.t === "chat");
  check(!gast.inv && gast.chat.some((t) => /Konto/.test(t)), "Gast: kein Inventar vom Server, Bitten werden abgelehnt");
  /* Anna geht: gespeichert, beim nächsten Anmelden derselbe Stand */
  anna.ws.close(); await new Promise((r) => setTimeout(r, 600));
  const anna2 = await spieler("tok_anna_" + "x".repeat(30)); await warte(anna2, (m) => m.t === "inventar"); check(anna2.inv && anna2.inv.angelegt.nebenhand === "rundschild", "Neu angemeldet: dasselbe Inventar");
  for (const s of [anna2, ben, gast]) s.ws.close();
} catch (e) { check(false, "Abbruch: " + e.message); console.log(log.slice(-1500)); }
srv.kill(); sb.close(); console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Inventar und Boden mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
