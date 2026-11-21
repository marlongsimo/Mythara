/* Die Waldmark als gemeinsame Welt (Spielserver gegen nachgebildete Supabase): Kampagnen und Waldweg sind ausgeblendet; Gäste sind sichtbar,
   öffentlicher Chat erscheint als Sprechblase, Flüstern erreicht nur den Empfänger, Gäste schreiben nicht. */
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
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
try {
  /* ein Gast ohne Konto und ohne Testfreigabe: so sieht es jeder Besucher */
  const gk = await br.newContext({ viewport: { width: 1280, height: 720 } }), gast = await gk.newPage(); gast.on("pageerror", (e) => fehlerSeite.push("Gast: " + e));
  await gk.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE_GAST }));
  await gk.addInitScript(() => { sessionStorage.setItem("ez__gefragt", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_held", "lichtbringer"); });
  await gast.goto(B + "?ort=weidenhain&kampf=waldweg" + S); await gast.waitForURL((u) => !/ort=/.test(u), { timeout: 15000 }).catch(() => {});
  check(!/ort=/.test(gast.url()), "Waldweg-Adresse führt zurück in die Waldmark (" + gast.url().replace(B, "") + ")");
  await gast.goto(B + "?ort=weidenhain" + S); await gast.waitForURL((u) => !/ort=/.test(u), { timeout: 15000 }).catch(() => {}); check(!/ort=/.test(gast.url()), "Kampagnen-Adresse führt zurück in die Waldmark");
  await gast.waitForFunction(() => window.EZW && window.EZW.ich(), null, { timeout: 30000 });
  check(await gast.$$eval("#ez-kartenrahmen .rknoepfe small", (l) => l.map((x) => x.textContent.replace(/ \(\d+\)/, "")).join(",")) === "Spieler,Held", "Unter der Karte nur Spieler und Held – keine Weltkarte, kein Teleport, keine Quests");
  check(!(await gast.$('#ez-menue [aria-label="Weltkarte"]')), "Kein Weg zur Weltkarte im Menü");
  check(await gast.evaluate(() => window.EZW.ich().gast === true && /^Gast \d{4}$/.test(window.EZW.ich().name)), "Ohne Konto ist man als Gast in der Welt: " + await gast.evaluate(() => window.EZW.ich().name));
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), "schildwaechter"), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), "kopfgeldjaeger");
  await anna.goto(B + "?x=1" + S); await ben.goto(B + "?x=1" + S);
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZW && window.EZW.ich() && window.EZW.spieler().length >= 2, null, { timeout: 30000 }).catch(() => {});
  const sicht = await anna.evaluate(() => window.EZW.spieler().map((d) => d.n + "/" + d.s + "/" + d.h).sort());
  check(sicht.length === 2 && sicht.some((x) => /^Ben\/2\/kopfgeldjaeger$/.test(x)) && sicht.some((x) => /^Gast \d{4}\/0\/lichtbringer$/.test(x)), "Anna sieht Ben (Stufe 2) und den Gast mit seinem Helden: " + sicht.join(", "));
  await gast.waitForFunction(() => window.EZW.spieler().length === 2, null, { timeout: 8000 }).catch(() => {});
  check(await gast.evaluate(() => window.EZW.spieler().map((d) => d.n).sort().join(",")) === "Anna,Ben", "Der Gast sieht Anna und Ben");
  check(await anna.evaluate(() => document.querySelectorAll("#ez-karte u.freund").length) === 2, "Die anderen erscheinen auf Annas Minikarte");
  check(await anna.evaluate(() => window.EZD.szene.schild.text) === "Anna · St. 3", "Über Annas eigenem Helden: „" + await anna.evaluate(() => window.EZD.szene.schild.text) + "“");
  check(/^Gast \d{4}$/.test(await gast.evaluate(() => window.EZD.szene.schild.text)), "Über dem Gast steht sein Gastname");
  /* öffentlicher Chat mit Sprechblase */
  await anna.fill("#ez-chat input", "Hallo Waldmark"); await anna.press("#ez-chat input", "Enter");
  await ben.waitForFunction(() => window.EZW.chat().some((m) => m.text === "Hallo Waldmark"), null, { timeout: 5000 }).catch(() => {});
  check(await ben.evaluate(() => window.EZW.chat().some((m) => m.text === "Hallo Waldmark" && m.von === "Anna")), "Ben liest Annas Nachricht im Chat");
  check(await ben.evaluate(() => (window.EZW.szene.__blasen || []).some((b) => b.text === "Hallo Waldmark")), "…und sieht sie als Sprechblase über Anna");
  check(await anna.evaluate(() => (window.EZW.szene.__blasen || []).some((b) => b.text === "Hallo Waldmark")), "Anna sieht ihre eigene Sprechblase");
  check(await gast.evaluate(() => window.EZW.chat().some((m) => m.text === "Hallo Waldmark")), "Der Gast liest mit");
  /* der Gast schreibt nicht */
  await gast.fill("#ez-chat input", "Ich bin ein Gast"); await gast.press("#ez-chat input", "Enter"); await gast.waitForTimeout(800);
  check(!(await anna.evaluate(() => window.EZW.chat().some((m) => m.text === "Ich bin ein Gast"))) && await gast.evaluate(() => window.EZW.chat().some((m) => m.kanal === "system" && /Konto/.test(m.text))), "Gäste können nicht schreiben (Hinweis auf das Konto)");
  /* Flüstern über die Spielerliste */
  await anna.evaluate(() => document.activeElement.blur()); await anna.keyboard.press("p"); await anna.waitForSelector(".tafel.spielerliste", { timeout: 5000 }); await anna.click('.tafel.spielerliste button:has-text("Ben")');
  await anna.waitForSelector(".tafel.spieler", { timeout: 5000 }); check(/Stufe 2/.test(await anna.textContent(".tafel.spieler")), "Spielerkarte zeigt Bens Stufe und Helden");
  await anna.click('.tafel.spieler [data-t="fl"]'); await anna.fill("#ez-chat input", "Nur für dich"); await anna.press("#ez-chat input", "Enter");
  await ben.waitForFunction(() => window.EZW.chat().some((m) => m.text === "Nur für dich"), null, { timeout: 5000 }).catch(() => {}); await gast.waitForTimeout(500);
  check(await ben.evaluate(() => window.EZW.chat().some((m) => m.text === "Nur für dich" && m.kanal === "fluestern" && m.an === "Ben")), "Ben erhält Annas Flüstern");
  check(!(await gast.evaluate(() => window.EZW.chat().some((m) => m.text === "Nur für dich"))) && !(await ben.evaluate(() => (window.EZW.szene.__blasen || []).some((b) => b.text === "Nur für dich"))), "Geflüstertes sieht sonst niemand (auch keine Sprechblase)");
  /* Held im Heldenprofil wählen: Er muss bleiben (der Server speichert ihn) – früher sprang die Figur nach dem Neuladen zurück */
  await ben.evaluate(() => document.activeElement && document.activeElement.blur()); await ben.click('#ez-menue [aria-label="Menü"]'); await ben.click('[data-t="profil"]');
  await ben.click('.bildnisse [data-held="schildwaechter"]'); await ben.click('.tafel .reihe .haupt[data-t="zu"]'); await ben.waitForTimeout(1000); await ben.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.ich() && window.EZW.ich().held === "schildwaechter", null, { timeout: 15000 }).catch(() => {}); await ben.waitForTimeout(500);
  check(await ben.evaluate(() => window.EZW.szene && window.EZW.szene.held === "schildwaechter" && window.EZW.ich().held === "schildwaechter") && HELDSETZEN.some((h) => h.p_user.endsWith("b002") && h.p_held === "schildwaechter"), "Im Heldenprofil gewählt: Ben bleibt Torvald (auch auf dem Server)");
  await anna.waitForTimeout(600); check(await anna.evaluate(() => window.EZW.spieler().some((d) => d.n === "Ben" && d.h === "schildwaechter")), "Anna sieht Ben jetzt als Torvald");
  /* Gast geht */
  await gast.close(); await anna.waitForFunction(() => window.EZW.spieler().length === 1, null, { timeout: 8000 }).catch(() => {});
  check(await anna.evaluate(() => window.EZW.spieler().length) === 1, "Geht der Gast, verschwindet er bei Anna");
  check(fehlerSeite.length === 0, "Keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite.join(" | ") : ""));
} catch (e) { console.error(e); fehler++; }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-2500));
console.log(fehler ? `${fehler} Fehler` : "Waldmark-MMO: alles in Ordnung"); process.exit(fehler ? 1 : 0);
