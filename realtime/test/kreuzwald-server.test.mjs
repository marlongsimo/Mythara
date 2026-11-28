/*
 * Mythara – Kreuzwald (Kampfgebiet) und gemerkte Stelle über den echten Spielserver (gegen eine nachgebildete Supabase, ohne Browser):
 * Man betritt den Kreuzwald an der eigenen Stelle, sieht vier Banditen, der Server merkt sich beim Gehen die Stelle in der Welt
 * und schickt sie beim nächsten Anmelden zurück. Aufruf (nach „node build.mjs“): node test/lichtung-server.test.mjs
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), WebSocket = require("ws");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const TOKEN = "tok_anna_" + "x".repeat(30), ANNA = "00000000-0000-0000-0000-00000000a001", STELLE = {}, GESETZT = [];
const TOKEN_BEN = "tok_ben__" + "x".repeat(30); let LANGSAM = 0; /* so lange (ms) braucht die nachgebildete Datenbank für den aktiven Helden – wie Supabase im echten Netz */
const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.headers.apikey !== "sb_secret_test") return send(401, {});
  if (req.url === "/auth/v1/user") return req.headers.authorization === "Bearer " + TOKEN ? send(200, { id: ANNA, is_anonymous: false }) : req.headers.authorization === "Bearer " + TOKEN_BEN ? send(200, { id: "00000000-0000-0000-0000-00000000b002", is_anonymous: false }) : send(401, {});
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: { schildwaechter: 300 } }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, []);
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, [{ handle: "Anna" }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return void setTimeout(() => send(200, [{ held: "schildwaechter" }]), LANGSAM);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, STELLE[wer(req.url)] ? [STELLE[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_position_setzen") { const a = JSON.parse(b); GESETZT.push(a); STELLE[a.p_user] = { region: a.p_region, x: a.p_x, y: a.p_y }; return send(200, { ok: true }); }
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_gutschrift") return send(200, { ep: {}, seelen: 0 });
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const verbinde = (pfad) => new Promise((ok, nein) => { const ws = new WebSocket("ws://localhost:8787/" + pfad, { origin: "http://localhost:8765" }), post = []; ws.on("message", (d) => post.push(JSON.parse(String(d)))); ws.on("open", () => ok({ ws, post })); ws.on("error", nein); });
const warte = async (f, ms = 5000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = f(); if (v) return v; await new Promise((r) => setTimeout(r, 50)); } return null; };
try {
  /* 1) Lichtung betreten, 22/37 Rechenfelder im Ausschnitt (= Weltfeld 6528/6587) */
  const k = await verbinde("?kampf=kreuzwald&ort=kreuzwald&held=schildwaechter&lx=192&ly=123"); k.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  const z = await warte(() => { const m = [...k.post].reverse().find((m) => m.t === "z"); return m && m.z; });
  check(Boolean(z), "Der Server lässt in den Kreuzwald (gemeinsames Kampfgebiet)");
  const ich = z && z.w.find((e) => e[0] === z.ich.id), banditen = z && ich ? z.w.filter((e) => { const wx = e[4] - ich[4] + 6528, wy = e[5] - ich[5] + 6587; return e[3] !== 0 && wx > 6522 && wx < 6583 && wy > 6557 && wy < 6608; }) : []; /* die Lichtung (Weltfelder; die Gegnerplätze der Welt #130 stehen weiter weg) */
  check(banditen.length === 4 && banditen.every((e) => e[2] === "bandit_dolch"), `Vier Dolch-Banditen (${banditen.map((e) => e[2]).join(", ")})`);
  check(ich && Math.hypot(ich[4] - 192, ich[5] - 123) < 1.5, `Der Held steht dort, wo er hereinkam (${ich && ich[4].toFixed(1)}, ${ich && ich[5].toFixed(1)})`);
  check(ich && ich[8] === 352, "Stufe aus dem Konto (Torvald mit 300 EP: 352 Leben)");
  const n1 = GESETZT.length; k.ws.close(); await warte(() => GESETZT.length > n1);
  const s1 = STELLE[ANNA]; check(s1 && s1.region === "waldweg" && Math.abs(s1.x - 6528) < 1.5 && Math.abs(s1.y - 6587) < 1.5, "Wer im Kreuzwald aufhört, dessen Stelle merkt der Server: " + JSON.stringify(s1));
  /* 2) In der Welt: pos mit Weltfeldern, beim Gehen gemerkt, beim nächsten Anmelden zurück */
  const w = await verbinde("?welt=1&ort=waldweg"); w.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  const ich1 = await warte(() => w.post.find((m) => m.t === "ich")); check(ich1 && ich1.pos && ich1.pos.region === "waldweg" && Math.abs(ich1.pos.x - 6528) < 1.5, "Beim Anmelden schickt der Server die gemerkte Stelle mit");
  w.ws.send(JSON.stringify({ t: "pos", x: 100, y: 200, b: 0, l: 0, wx: 6450.5, wy: 6470.25 })); await new Promise((r) => setTimeout(r, 300));
  const n2 = GESETZT.length; w.ws.close(); await warte(() => GESETZT.length > n2);
  check(STELLE[ANNA].x === 6450.5 && STELLE[ANNA].y === 6470.25 && STELLE[ANNA].region === "waldweg", "Gehen in der Welt: die letzte Stelle ist gemerkt " + JSON.stringify(STELLE[ANNA]));
  const w2 = await verbinde("?welt=1&ort=waldmark"); w2.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  const ich2 = await warte(() => w2.post.find((m) => m.t === "ich")); check(ich2 && ich2.pos && ich2.pos.x === 6450.5, "…und kommt beim nächsten Anmelden (anderes Gerät) zurück");
  w2.ws.send(JSON.stringify({ t: "pos", x: 1, y: 2, wx: -5, wy: 99999999 })); await new Promise((r) => setTimeout(r, 200)); const n3 = GESETZT.length; w2.ws.close(); await new Promise((r) => setTimeout(r, 500));
  check(STELLE[ANNA].x === 6450.5 && GESETZT.length >= n3, "Unsinnige Stellen nimmt der Server nicht an");
  /* 4) Geisterhelden: Die Seite lädt neu, während der Server noch auf die Datenbank wartet – es darf kein Held ohne Verbindung zurückbleiben */
  const helden = (z) => z.w.filter((e) => e[1]).length;
  LANGSAM = 700; const g1 = await verbinde("?kampf=kreuzwald&ort=kreuzwald&held=schildwaechter&lx=100&ly=20"); g1.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") })); await new Promise((r) => setTimeout(r, 150)); g1.ws.close();
  await new Promise((r) => setTimeout(r, 1200)); LANGSAM = 0;
  const bn = await verbinde("?kampf=kreuzwald&ort=kreuzwald&held=schildwaechter&lx=104&ly=20"); bn.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN_BEN, geraet: "test-" + String(TOKEN_BEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  const zb = await warte(() => { const m = [...bn.post].reverse().find((m) => m.t === "z"); return m && m.z; }); check(zb && helden(zb) === 1, `Ben schaut in den Kreuzwald: kein Geist von Anna, nur er selbst (${zb && helden(zb)} Held)`); bn.ws.close(); await new Promise((r) => setTimeout(r, 300));
  const g2 = await verbinde("?kampf=kreuzwald&ort=kreuzwald&held=schildwaechter&lx=100&ly=20"); g2.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  const z2 = await warte(() => { const m = [...g2.post].reverse().find((m) => m.t === "z"); return m && m.z; }); check(z2 && helden(z2) === 1, `Neu geladen während der Anmeldung: nur ein Held im Kreuzwald (${z2 && helden(z2)})`);
  /* zweites Fenster derselben Person: der alte Held verschwindet sofort */
  const g3 = await verbinde("?kampf=kreuzwald&ort=kreuzwald&held=schildwaechter&lx=102&ly=20"); g3.ws.send(JSON.stringify({ t: "anmeldung", token: TOKEN, geraet: "test-" + String(TOKEN).slice(4, 12).replace(/[^A-Za-z0-9]/g, "x") }));
  await warte(() => g3.post.some((m) => m.t === "z")); await new Promise((r) => setTimeout(r, 400)); const z3 = [...g3.post].reverse().find((m) => m.t === "z").z;
  check(helden(z3) === 1 && g2.ws.readyState >= 2, `Zweites Fenster: der alte Held ist weg, das alte Fenster getrennt (${helden(z3)} Held)`); g3.ws.close();
  /* 3) Gast: nichts wird gemerkt */
  const g = await verbinde("?welt=1&ort=waldmark"); g.ws.send(JSON.stringify({ t: "anmeldung" })); await warte(() => g.post.find((m) => m.t === "ich")); g.ws.send(JSON.stringify({ t: "pos", x: 1, y: 2, wx: 6400, wy: 6400 })); const n4 = GESETZT.length; g.ws.close(); await new Promise((r) => setTimeout(r, 500));
  check(GESETZT.length === n4, "Bei Gästen merkt sich der Server nichts");
} catch (e) { console.error(e); fehler++; }
srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2000));
console.log(fehler ? `${fehler} Fehler` : "Kreuzwald und gemerkte Stelle (Server): alles in Ordnung"); process.exit(fehler ? 1 : 0);
