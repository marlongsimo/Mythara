/*
 * Riftmere – Handel zwischen Spielern (#65) Ende zu Ende: echter Spielserver, nachgebildete Supabase, drei Spieler über die Welt-Verbindung.
 * Anfrage nur nah, Annehmen, Angebote (nicht handelbar: geladen, gebunden, Quest), Änderung setzt zurück, zwei Bestätigungen, atomarer Tausch,
 * kein Platz, Weglaufen und Verbindungsabbruch brechen ab, Gäste handeln nicht. Aufruf: node test/handel-welt.test.mjs (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const A = "00000000-0000-0000-0000-00000000a001", B = "00000000-0000-0000-0000-00000000b002", C = "00000000-0000-0000-0000-00000000c003";
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: A, ["tok_ben__" + "x".repeat(30)]: B, ["tok_cora_" + "x".repeat(30)]: C }, NAME = { [A]: "Anna", [B]: "Ben", [C]: "Cora" };
const HELD = {
  [A]: { geschlecht: "frau", frisur: "zopf", bart: "ohne", haarfarbe: "grau", hautfarbe: "hell", waffe: "schwert", quests: {}, inventar: { angelegt: { waffe: "ritterschwert" }, rucksack: [{ g: "splitter", n: 500 }, { g: "heiltrank", n: 5 }, "magiepanzer", { g: "eidschwert", n: 1, d: { ladungen: 20 } }, { g: "kleiner_heiltrank", n: 1, d: { gebunden: true } }, "holz_waldgott"], v: 2 } },
  [B]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "grau", hautfarbe: "hell", waffe: "bogen", quests: {}, inventar: { angelegt: { waffe: "jagdbogen" }, rucksack: [{ g: "splitter", n: 50 }, "lederpanzer"], v: 2 } },
  [C]: { geschlecht: "mann", frisur: "scheitel", bart: "ohne", haarfarbe: "grau", hautfarbe: "hell", waffe: "stab", quests: {}, inventar: { angelegt: { waffe: "hirtenstab" }, rucksack: Array.from({ length: 24 }, () => "lederpanzer"), v: 2 } } }, GESPEICHERT = [];
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
  send(404, {}); }); }).listen(8780);
let srv, log = "";
const starten = async () => { srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8779", SUPABASE_URL: "http://localhost:8780", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200)); };
function spieler(token, ort) { return new Promise((fertig) => { const ws = new WebSocket("ws://localhost:8779/?welt=1&ort=" + ort, { origin: "http://localhost:8765" }), s = { ws, inv: null, chat: [], warte: [], handel: [] };
  ws.on("message", (roh) => { const m = JSON.parse(String(roh)); if (m.t === "inventar") s.inv = m.inv; if (m.t === "handel") s.handel.push(m); if (m.t === "chat" && m.kanal === "system") s.chat.push(m.text); for (const w of [...s.warte]) if (w.f(m)) { s.warte.splice(s.warte.indexOf(w), 1); w.r(m); } });
  ws.on("open", () => { ws.send(JSON.stringify(token ? { t: "anmeldung", token, geraet: "test-" + String(token).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") } : { t: "anmeldung", gast: true })); fertig(s); }); }); }
const warte = (s, fn, ms = 4000) => new Promise((r) => { const t = setTimeout(() => r(null), ms); s.warte.push({ f: fn, r: (m) => { clearTimeout(t); r(m); } }); });
const sende = (s, m) => s.ws.send(JSON.stringify(m)), schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const bank = (s) => Object.fromEntries((s.inv && s.inv.bank) || []), imRucksack = (s, g) => (s.inv.rucksack || []).reduce((n, x) => n + ((typeof x === "string" ? x : x.g) === g ? (typeof x === "string" ? 1 : x.n) : 0), 0);
const tun = async (s, m) => { s.chat = []; sende(s, { t: "bank", ...m }); await Promise.race([warte(s, (x) => x.t === "inventar"), warte(s, (x) => x.t === "chat")]); await schlaf(80); };
const H = (s, m) => sende(s, { t: "handel", ...m }), pos = (s, x, y) => sende(s, { t: "pos", x: 0, y: 0, wx: x, wy: y });
const offen = (s) => warte(s, (m) => m.t === "handel" && m.tat === "offen"), zu = (s) => warte(s, (m) => m.t === "handel" && (m.tat === "zu" || m.tat === "fertig"));
const X = 6448.5, Y = 6438.5;
try {
  await starten();
  const anna = await spieler("tok_anna_" + "x".repeat(30), "waldmark"), ben = await spieler("tok_ben__" + "x".repeat(30), "waldmark"), cora = await spieler("tok_cora_" + "x".repeat(30), "waldmark");
  await Promise.all([warte(anna, (m) => m.t === "inventar"), warte(ben, (m) => m.t === "inventar"), warte(cora, (m) => m.t === "inventar")]);
  pos(anna, X, Y); pos(ben, X + 8, Y); pos(cora, X, Y + 1); await schlaf(200);
  console.log("\nAnfrage");
  H(anna, { tat: "anfrage", an: "Ben" }); await schlaf(200); check(anna.chat.some((t) => /näher an Ben/.test(t)), "zu weit weg: „Geh näher an Ben.“ (der Browser läuft bis auf ein Feld heran)");
  pos(ben, X + 1, Y); await schlaf(200); const anf = warte(ben, (m) => m.t === "handel" && m.tat === "anfrage");
  H(anna, { tat: "anfrage", an: "Ben" }); const a1 = await anf; check(a1 && a1.von === "Anna", "Ben bekommt die Anfrage „Anna möchte mit dir handeln“");
  let oa = offen(anna), ob = offen(ben); H(ben, { tat: "annehmen_anfrage", von: "Anna" }); let [za, zb] = await Promise.all([oa, ob]);
  check(za && zb && za.mit === "Ben" && zb.mit === "Anna" && za.stufe === 1, "Ben nimmt an: bei beiden öffnet das Handelsfenster");
  H(cora, { tat: "anfrage", an: "Anna" }); await schlaf(200); check(cora.chat.some((t) => /handelt gerade/.test(t)), "wer schon handelt, kann nicht gefragt werden");
  console.log("\nAngebote");
  oa = offen(anna); H(anna, { tat: "angebot", posten: [{ g: "eidschwert", n: 1, d: { ladungen: 20 } }], splitter: 0 }); await oa; await schlaf(100);
  check(anna.chat.some((t) => /nicht handelbar/.test(t)), "geladene Waffe „(s)“: nicht handelbar");
  H(anna, { tat: "angebot", posten: [{ g: "kleiner_heiltrank", n: 1, d: { gebunden: true } }], splitter: 0 }); await schlaf(200); check(anna.chat.filter((t) => /nicht handelbar/.test(t)).length >= 2, "gebundener Questlohn: nicht handelbar");
  H(anna, { tat: "angebot", posten: [{ g: "holz_waldgott", n: 1 }], splitter: 0 }); await schlaf(200); check(anna.chat.filter((t) => /nicht handelbar/.test(t)).length >= 3, "Questgegenstand: nicht handelbar");
  H(anna, { tat: "angebot", posten: [{ g: "heiltrank", n: 9 }], splitter: 0 }); await schlaf(200); check(anna.chat.some((t) => /So viel/.test(t)), "mehr als man hat: abgelehnt");
  ob = offen(ben); H(anna, { tat: "angebot", posten: [{ g: "heiltrank", n: 2 }, { g: "magiepanzer", n: 1 }], splitter: 100 }); zb = await ob;
  check(zb && zb.er.posten.length === 2 && zb.er.splitter === 100 && zb.freiEr > 0, `Ben sieht Annas Angebot (2 Heiltränke, Magiepanzer, 100 Splitter; Anna hat ${zb && zb.freiEr} freie Plätze)`);
  H(ben, { tat: "angebot", posten: [{ g: "lederpanzer", n: 1 }], splitter: 10 }); await schlaf(200);
  oa = offen(anna); H(anna, { tat: "annehmen" }); za = await oa; check(za && za.ich.ok && !za.er.ok, "Anna nimmt an (grün)");
  oa = offen(anna); H(ben, { tat: "angebot", posten: [{ g: "lederpanzer", n: 1 }], splitter: 20 }); za = await oa; check(za && !za.ich.ok && !za.er.ok, "Ben ändert sein Angebot: beide Annahmen zurückgesetzt");
  H(anna, { tat: "annehmen" }); await schlaf(150); oa = warte(anna, (m) => m.t === "handel" && m.tat === "offen" && m.stufe === 2); H(ben, { tat: "annehmen" }); za = await oa; await schlaf(100);
  check(za && za.stufe === 2 && !za.ich.ok, "beide angenommen: Zusammenfassung (Stufe 2)");
  H(anna, { tat: "angebot", posten: [], splitter: 0 }); await schlaf(200); check(anna.chat.some((t) => /nichts mehr ändern/.test(t)), "in der Zusammenfassung lässt sich nichts ändern");
  const fa = zu(anna), fb = zu(ben); H(anna, { tat: "annehmen" }); await schlaf(150); H(ben, { tat: "annehmen" }); const [ea, eb] = await Promise.all([fa, fb]); await schlaf(300);
  check(ea && ea.tat === "fertig" && eb && eb.tat === "fertig", "beide nehmen noch einmal an: „Handel abgeschlossen.“");
  check(imRucksack(anna, "splitter") === 420 && imRucksack(anna, "heiltrank") === 3 && imRucksack(anna, "magiepanzer") === 0 && imRucksack(anna, "lederpanzer") === 1, "Anna: −100 +20 Splitter, −2 Heiltränke, −Magiepanzer, +Lederpanzer");
  check(imRucksack(ben, "splitter") === 130 && imRucksack(ben, "heiltrank") === 2 && imRucksack(ben, "magiepanzer") === 1 && imRucksack(ben, "lederpanzer") === 0, "Ben: +100 −20 Splitter, +2 Heiltränke, +Magiepanzer, −Lederpanzer");
  check(log.includes("Handel: Anna gibt"), "der Server schreibt den Handel ins Log");
  console.log("\nAbbruch und kein Platz");
  H(cora, { tat: "anfrage", an: "Anna" }); await schlaf(150); oa = offen(anna); H(anna, { tat: "annehmen_anfrage", von: "Cora" }); await oa;
  H(anna, { tat: "angebot", posten: [{ g: "heiltrank", n: 1 }], splitter: 0 }); await schlaf(150); H(anna, { tat: "annehmen" }); await schlaf(200);
  check(anna.chat.some((t) => /Cora hat nicht genug Platz/.test(t)), "Cora hat keinen freien Platz: Annehmen geht nicht");
  const za2 = zu(anna); pos(cora, X + 9, Y); const z2 = await za2; check(z2 && z2.tat === "zu" && /zu weit/.test(z2.grund), "Cora läuft weg: der Handel bricht ab, nichts wechselt den Besitzer");
  check(imRucksack(anna, "heiltrank") === 3, "Annas Heiltränke sind noch da");
  pos(cora, X, Y + 1); await schlaf(200); H(anna, { tat: "anfrage", an: "Ben" }); await schlaf(150); oa = offen(anna); H(ben, { tat: "anfrage", an: "Anna" }); await oa; /* Gegenfrage = annehmen */
  const za3 = zu(anna); ben.ws.close(); const z3 = await za3; check(z3 && /nicht mehr da/.test(z3.grund), "Ben schließt das Spiel: der Handel bricht ab");
  const gast = await spieler(null, "waldmark"); await schlaf(300); sende(gast, { t: "pos", x: 0, y: 0, wx: X + 1, wy: Y }); H(gast, { tat: "anfrage", an: "Anna" }); await schlaf(200); check(gast.chat.some((t) => /mit Konto/.test(t)), "Gäste handeln nicht");
} catch (e) { console.error(e); f++; }
srv.kill(); sb.close(); if (f) console.log(log.slice(-2500));
console.log(f ? `\nHandel: ${f} FEHLER` : "\nHandel: alles in Ordnung"); process.exit(f ? 1 : 0);
