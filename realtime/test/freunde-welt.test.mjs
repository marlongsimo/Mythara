/*
 * Mythara – Freunde Ende zu Ende: echter Spielserver (server/dist/server.js), nachgebildete Supabase (rpg_freunde_von wie Migration 047), drei Spieler.
 * Anna und Ben sind befreundet, Cora nicht. Online-Stand nur für Freunde, Teleport zum Freund (Stelle), gesperrtes Gebiet (Weidenhain ohne Quest),
 * Fremde bekommen keine Stelle, Flüstern per Name, Bescheid über eine Anfrage. Aufruf: node test/freunde-welt.test.mjs   (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", C = "00000000-0000-0000-0000-00000000c003", D = "00000000-0000-0000-0000-00000000d004";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B, ["tok_cora_" + "x".repeat(30)]: C }, NAME = { [A]: "Anna", [B]: "Ben", [C]: "Cora", [D]: "Dora" };
const FREUNDE = { [A]: [B, D], [B]: [A], [C]: [], [D]: [A] }, ZULETZT = { [D]: new Date(Date.now() - 3 * 3600e3).toISOString() };
const HELD = (w) => ({ geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: w, inventar: null, quests: {} });
const wer = (u) => (/user_id=eq\.([^&]+)/.exec(u) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, NAME[wer(req.url)] ? [{ handle: NAME[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: {} }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_held_setzen") || req.url.startsWith("/rest/v1/rpc/rpg_echtzeit_position_setzen")) return send(200, { ok: true });
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, [HELD("schwert")]);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") return send(200, true);
  if (req.url === "/rest/v1/rpc/rpg_freunde_von") { const a = JSON.parse(b); return send(200, (FREUNDE[a.p_user] || []).map((u) => ({ user_id: u, handle: NAME[u], zuletzt: ZULETZT[u] || null }))); }
  send(404, {}); }); }).listen(8795);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8785", SUPABASE_URL: "http://localhost:8795", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket(`ws://localhost:8785/?welt=1&ort=${ort}`, { origin: "http://localhost:8765" }), s = { ws, chat: [], alle: [], warte: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); s.alle.push(m); if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify({ t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); fertig(s); }); }); }
const warte = (s, f, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m));
try {
  const anna = await spieler("tok_anna_" + "x".repeat(30), "waldmark"); await warte(anna, (m) => m.t === "ich");
  const ben = await spieler("tok_ben__" + "x".repeat(30), "waldweg"); await warte(ben, (m) => m.t === "ich");
  const cora = await spieler("tok_cora_" + "x".repeat(30), "waldmark"); await warte(cora, (m) => m.t === "ich");
  sende(ben, { t: "pos", x: 0, y: 0, wx: 6400.5, wy: 6600.5 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "freunde" }); const l = await warte(anna, (m) => m.t === "freunde");
  const b = l && l.liste.find((x) => x.n === "Ben"), d = l && l.liste.find((x) => x.n === "Dora");
  check(l && l.liste.length === 2 && b && b.online && b.ort === "waldweg" && !b.kampf && d && !d.online && d.zuletzt && !l.liste.some((x) => x.n === "Cora"), `Anna sieht ihre Freunde: Ben online im Waldweg, Dora offline mit „zuletzt“, Cora nicht (${JSON.stringify(l && l.liste)})`);
  sende(anna, { t: "zufreund", n: "Ben" }); const tp = await warte(anna, (m) => m.t === "zufreund");
  check(tp && tp.ok && tp.x === 6400.5 && tp.y === 6600.5, `Teleport zu Ben: erlaubt, an seiner Stelle (${JSON.stringify(tp)})`);
  sende(anna, { t: "zufreund", n: "Dora" }); const tpd = await warte(anna, (m) => m.t === "zufreund");
  check(tpd && !tpd.ok && /nicht online/.test(tpd.text), `Teleport zu Dora (offline): abgelehnt – ${tpd && tpd.text}`);
  sende(cora, { t: "zufreund", n: "Ben" }); const tpc = await warte(cora, (m) => m.t === "zufreund");
  check(tpc && !tpc.ok && tpc.x === undefined && /Freundesliste/.test(tpc.text), `Cora (keine Freundin): kein Teleport und keine Stelle – ${tpc && tpc.text}`);
  sende(cora, { t: "freunde" }); const lc = await warte(cora, (m) => m.t === "freunde"); check(lc && lc.liste.length === 0, "Cora bekommt keinen Online-Stand fremder Spieler");
  /* Ben geht nach Weidenhain (hinter der Quest-Sperre): Anna hat die Quest nicht → kein Teleport */
  ben.ws.close(); await new Promise((r) => setTimeout(r, 300));
  const ben2 = await spieler("tok_ben__" + "x".repeat(30), "weidenhain"); await warte(ben2, (m) => m.t === "ich"); sende(ben2, { t: "pos", x: 0, y: 0, wx: 6420.5, wy: 6700.5 }); await new Promise((r) => setTimeout(r, 300));
  sende(anna, { t: "zufreund", n: "Ben" }); const tpw = await warte(anna, (m) => m.t === "zufreund");
  check(tpw && !tpw.ok && /Weidenhain ist für dich noch nicht freigeschaltet/.test(tpw.text) && tpw.x === undefined, `Ben in Weidenhain, Anna ohne Quest: „${tpw && tpw.text}“`);
  /* Flüstern per Name (Freundesliste): kommt bei Ben an, egal wo er ist */
  sende(anna, { t: "chat", kanal: "fluestern", anName: "Ben", text: "Hallo Ben" }); const fl = await warte(ben2, (m) => m.t === "chat" && m.kanal === "fluestern");
  check(fl && fl.von === "Anna" && fl.text === "Hallo Ben", "Flüstern an einen Freund per Name kommt an");
  /* Anfrage: Cora fragt Anna (die Anfrage selbst stellt der Browser mit rpg_request_friend), der Server sagt Anna Bescheid */
  sende(cora, { t: "freundanfrage", n: "Anna" }); const an = await warte(anna, (m) => m.t === "freundanfrage");
  check(an && an.von === "Cora" && !an.angenommen, "Anna bekommt Bescheid über Coras Anfrage");
  sende(anna, { t: "freundanfrage", n: "Cora", angenommen: true }); const ja = await warte(cora, (m) => m.t === "freundanfrage"); check(ja && ja.angenommen && ja.von === "Anna", "Cora erfährt, dass Anna angenommen hat");
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-2000));
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Freunde mit dem Spielserver: alles in Ordnung"); process.exit(f ? 1 : 0);
