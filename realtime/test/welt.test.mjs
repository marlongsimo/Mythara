/* Gemeinsame Welt über den Spielserver (gegen eine nachgebildete Supabase): Anna und Ben sehen sich in der Waldmark (Name, Stufe, Held),
   schreiben im Chat, der Server bestimmt den aktiven Helden und erlaubt den Wechsel nur in der Waldmark. Wer fällt, erwacht in der Waldmark. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url.startsWith("/fake/")) { res.setHeader("access-control-allow-origin", "*"); if (req.url === "/fake/einladen") { const a = JSON.parse(b || "{}"); EINL.push({ id: "e" + EINL.length, von: a.von, an: a.an, code: a.code }); return send(200, { ok: true }); }
    if (req.url.startsWith("/fake/einladungen")) return send(200, EINL.filter((e) => e.an === new URL(req.url, "http://x").searchParams.get("an")));
    if (req.url.startsWith("/fake/weg")) { const id = new URL(req.url, "http://x").searchParams.get("id"); const i = EINL.findIndex((e) => e.id === id); if (i >= 0) EINL.splice(i, 1); return send(200, { ok: true }); } }
  if (req.headers.apikey !== "sb_secret_test" || (req.url !== "/auth/v1/user" && req.headers.authorization !== "Bearer sb_secret_test")) return send(401, { message: "anon" });
  if (req.url === "/auth/v1/user") { const id = NUTZER[(req.headers.authorization || "").replace("Bearer ", "")]; return id ? send(200, { id, is_anonymous: false }) : send(401, {}); }
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_werte")) return send(200, [{ ep: (WERTE[wer(req.url)] || { ep: {} }).ep }]);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_siege")) return send(200, SIEGE.filter((s) => s.user === wer(req.url)));
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_sieg") { const a = JSON.parse(b); SIEGE.push({ user: a.p_user, ort: a.p_ort, kampf: a.p_kampf }); return send(200, { ok: true }); }
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_gutschrift") { const a = JSON.parse(b); buchungen.push(a); const W = WERTE[a.p_user]; for (const [h, n] of Object.entries(a.p_ep)) W.ep[h] = (W.ep[h] || 0) + n; W.seelen += a.p_seelen; return send(200, { ep: W.ep, seelen: W.seelen }); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, PROFIL[wer(req.url)] ? [{ handle: PROFIL[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, AKTIV[wer(req.url)] ? [{ held: AKTIV[wer(req.url)] }] : []);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_held_setzen") { const a = JSON.parse(b); AKTIV[a.p_user] = a.p_held; HELDSETZEN.push(a); return send(200, { ok: true, held: a.p_held }); }
  send(404, {}); }); }).listen(8799);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8787", SUPABASE_URL: "http://localhost:8799", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8799/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8799/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8799/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const br = await chromium.launch(), S = "&server=ws://localhost:8787", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, held) { const ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE(name) }));
  await ctx.addInitScript(([t, h]) => { sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); localStorage.setItem("ez__alles", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true })); }, [token, held]);
  return p; }
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), "schildwaechter"), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), "assassine");
  await anna.goto(B + "?x=1" + S); await ben.goto(B + "?x=1" + S);
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZD && window.EZW && window.EZW.ich(), null, { timeout: 30000 });
  /* Der Server bestimmt den Helden: Ben hatte lokal „assassine“, in der Datenbank steht „kopfgeldjaeger“ */
  await ben.waitForFunction(() => window.EZD.szene.held === "kopfgeldjaeger", null, { timeout: 10000 }).catch(() => {});
  check(await ben.evaluate(() => window.EZD.szene.held === "kopfgeldjaeger" && localStorage.getItem("ez_held") === "kopfgeldjaeger"), "Ben läuft mit dem Helden aus der Datenbank (Orin), nicht mit dem lokalen");
  check(HELDSETZEN.some((h) => h.p_user.endsWith("a001") && h.p_held === "schildwaechter"), "Anna hatte noch keinen: ihr Held (Torvald) wird beim ersten Betreten gespeichert");
  /* Sich gegenseitig sehen */
  await anna.waitForFunction(() => [...window.EZD.szene.mit.figuren.values()].some((f) => /^Ben · St\. \d+$/.test(f.nm.text)), null, { timeout: 10000 }).catch(() => {});
  const schild = await anna.evaluate(() => [...window.EZD.szene.mit.figuren.values()].map((f) => f.nm.text + "|" + f.held));
  check(schild.length === 1 && /^Ben · St\. \d+\|kopfgeldjaeger$/.test(schild[0]), "Anna sieht Ben in der Waldmark mit Name, Stufe und Held (" + schild.join() + ")");
  const vorher = await anna.evaluate(() => [...window.EZD.szene.mit.figuren.values()][0].d.x);
  await ben.bringToFront(); await ben.keyboard.down("d"); await ben.waitForTimeout(1200); await ben.keyboard.up("d"); await anna.waitForTimeout(800);
  const nachher = await anna.evaluate(() => [...window.EZD.szene.mit.figuren.values()][0].d.x); check(nachher > vorher + 20, `Ben läuft – Anna sieht ihn wandern (x ${vorher} → ${nachher})`);
  if (process.env.EZ_BILD) await anna.screenshot({ path: process.env.EZ_BILD.replace(".png", "-waldmark.png") });
  /* Chat */
  await anna.fill("#ez-chat input", "Hallo Waldmark <b>fett</b>"); await anna.press("#ez-chat input", "Enter");
  await ben.waitForFunction(() => window.EZW.chat().some((m) => m.von === "Anna"), null, { timeout: 5000 }).catch(() => {});
  const ankunft = await ben.evaluate(() => window.EZW.chat().find((m) => m.von === "Anna")); check(ankunft && ankunft.text === "Hallo Waldmark bfett/b" && ankunft.kanal === "oeffentlich", "Ben liest Annas Nachricht im öffentlichen Kanal (spitze Klammern entfernt): " + (ankunft && ankunft.text));
  check(await ben.evaluate(() => !document.querySelector("#ez-chat .liste b + b") && document.querySelector("#ez-chat .liste").textContent.includes("Hallo Waldmark")), "Nachricht steht im Chatfenster, ohne eingeschleustes HTML");
  for (let i = 0; i < 6; i++) { await anna.fill("#ez-chat input", "Spam " + i); await anna.press("#ez-chat input", "Enter"); }
  await anna.waitForTimeout(500); check(await anna.evaluate(() => window.EZW.chat().some((m) => m.kanal === "system" && /Langsamer/.test(m.text))), "Zu viele Nachrichten: der Server bremst (höchstens 5 in 10 s)");
  /* Heldenwechsel nur in der Waldmark */
  await anna.evaluate(() => window.EZW.held("elementarist")); await anna.waitForFunction(() => window.EZD && window.EZD.szene.held === "elementarist", null, { timeout: 10000 }).catch(() => {});
  check(await anna.evaluate(() => window.EZD.szene.held === "elementarist") && HELDSETZEN.some((h) => h.p_user.endsWith("a001") && h.p_held === "elementarist"), "In der Waldmark wechselt Anna zu Vaelin – der Server speichert es");
  await ben.waitForFunction(() => [...window.EZD.szene.mit.figuren.values()].some((f) => f.held === "elementarist"), null, { timeout: 8000 }).catch(() => {});
  check(await ben.evaluate(() => [...window.EZD.szene.mit.figuren.values()].some((f) => f.held === "elementarist")), "Ben sieht Anna jetzt als Vaelin");
  await ben.goto(B + "?ort=weidenhain" + S); await ben.waitForFunction(() => window.EZW && window.EZW.ich() && window.EZW.ich().ort === "weidenhain", null, { timeout: 30000 });
  await ben.evaluate(() => window.EZW.held("assassine")); await ben.waitForTimeout(1200);
  check(await ben.evaluate(() => window.EZW.ich().held === "kopfgeldjaeger" && window.EZW.chat().some((m) => /nur in der Waldmark/.test(m.text))) && AKTIV["00000000-0000-0000-0000-00000000b002"] === "kopfgeldjaeger", "Im Dorf lehnt der Server einen Heldenwechsel ab");
  await anna.waitForTimeout(1500); check(await anna.evaluate(() => window.EZD.szene.mit.figuren.size === 0 && window.EZW.chat().some((m) => /Ben ist weitergezogen/.test(m.text))), "Ben ist ins Dorf gereist: Anna sieht ihn nicht mehr und liest es im Systemkanal");
  /* Tod: zurück in die Waldmark */
  await anna.goto(B + "?ort=weidenhain&kampf=speicher&server="); await anna.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 30000 }); await anna.waitForTimeout(500);
  await anna.evaluate(() => { const s = window.EZ.netz.sim, h = s.ich, m = s.wesen.find((w) => !w.held && !w.tot && w.team !== 0); s.abziehen(h, 99999, m, "nah"); });
  await anna.waitForURL((u) => /von=tod/.test(String(u)) || (!/kampf=/.test(String(u))), { timeout: 15000 }).catch(() => {});
  await anna.waitForFunction(() => window.EZW && window.EZW.chat().some((m) => /gefallen/.test(m.text)), null, { timeout: 20000 }).catch(() => {});
  check(!/kampf=/.test(anna.url()) && await anna.evaluate(() => Boolean(window.EZD) && window.EZW.chat().some((m) => /gefallen/.test(m.text))), "Gefallen: Anna erwacht in der Waldmark (" + anna.url().replace(B, "") + ")");
  check(fehlerSeite.length === 0, "keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite[0] : ""));
} catch (e) { fehler++; console.log("Unerwarteter Fehler:", e); console.log(log.slice(-1500)); }
await br.close(); srv.kill(); sb.close();
console.log(fehler ? `\nWelt: ${fehler} FEHLER` : "\nWelt: alles in Ordnung"); process.exit(fehler ? 1 : 0);
