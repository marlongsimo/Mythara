/* Koop über den Spielserver, gegen eine nachgebildete Supabase: Anna gründet eine Gruppe, Ben tritt mit dem Code bei.
   Betritt Anna den Kornspeicher, wird Ben aus der Waldmark in denselben Kampf geholt. Beide steuern ihren eigenen Helden,
   beide bekommen den Sieg und ihre Gutschrift. Verlässt Anna den Kampf, endet er auch für Ben. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; /* nachgebildete Tabelle rpg_echtzeit_einladungen */
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
  await ctx.addInitScript(([t, h]) => { sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true })); }, [token, held]);
  return p; }
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), "schildwaechter"), ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), "kopfgeldjaeger");
  /* Anna gründet die Gruppe in der Waldmark */
  await anna.goto(B + "?x=1" + S); await anna.waitForFunction(() => window.EZD || document.querySelector("#ez-profil"), null, { timeout: 30000 }); await anna.waitForTimeout(1500);
  await anna.click('#ez-menue [aria-label="Weltkarte"]'); await anna.click('#ez-welt .ziel[data-id="weidenhain"]'); if (process.env.EZ_BILD) await anna.screenshot({ path: process.env.EZ_BILD.replace(".png", "-wahl.png") });
  check(Boolean(await anna.$('#ez-welt [data-w="allein"]')) && Boolean(await anna.$('#ez-welt [data-w="koop"]')), "Die Weltkarte fragt: allein oder gemeinsam aufbrechen");
  await anna.click('#ez-welt [data-w="koop"]');
  await anna.waitForFunction(() => /Anna/.test(document.querySelector("#ez-konto .mitglieder")?.textContent || ""), null, { timeout: 15000 }); check(/Aufbruch nach Weidenhain/.test(await anna.textContent("#ez-konto h2")), "„Gemeinsam aufbrechen“ öffnet das Aufbruchslager für Weidenhain");
  await anna.click('#ez-konto [data-ein="Ben"]'); await anna.waitForFunction(() => /eingeladen/.test(document.querySelector("#ez-konto .meldung")?.textContent || ""), null, { timeout: 10000 }); check(true, "Anna lädt ihren Freund Ben aus der Freundesliste ein"); if (process.env.EZ_BILD) await anna.screenshot({ path: process.env.EZ_BILD });
  /* Ben bekommt die Einladung als Hinweis und nimmt an */
  await ben.goto(B + "?x=1" + S); await ben.waitForFunction(() => document.querySelector("#ez-profil"), null, { timeout: 30000 });
  await ben.waitForSelector("#ez-einladung:not([hidden])", { timeout: 15000 }); check(/Anna/.test(await ben.textContent("#ez-einladung")), "Ben sieht: „Anna lädt dich zum gemeinsamen Spielen ein“");
  await ben.click('#ez-einladung [data-a="ja"]');
  await anna.waitForFunction(() => /Ben/.test(document.querySelector("#ez-konto .mitglieder")?.textContent || ""), null, { timeout: 15000 }); check(true, "Anna sieht Ben in der Gruppe");
  check(/sobald Anna/.test(await ben.textContent("#ez-gruppe")), "Ben wartet in der Waldmark auf Anna");
  /* Aufbruchslager: Ben sieht es auch, Torvald ist vergeben, er wählt Orin und meldet sich bereit */
  await ben.waitForSelector("#ez-konto .tafel.lager", { timeout: 15000 }); check(true, "Ben landet im selben Aufbruchslager");
  check(await ben.evaluate(() => document.querySelector('#ez-konto [data-held="schildwaechter"]').disabled), "Torvald ist für Ben gesperrt – Anna hat ihn schon");
  check(await anna.evaluate(() => document.querySelector('#ez-konto [data-t="los"]').disabled), "Anna kann erst aufbrechen, wenn alle bereit sind");
  await ben.click('#ez-konto [data-held="kopfgeldjaeger"]'); await ben.click('#ez-konto [data-t="bereit"]');
  await anna.waitForFunction(() => !document.querySelector('#ez-konto [data-t="los"]').disabled, null, { timeout: 10000 }); check(/✓ bereit/.test(await anna.textContent("#ez-konto .mitglieder")), "Anna sieht: Ben ist bereit (mit Orin)");
  if (process.env.EZ_BILD) await ben.screenshot({ path: process.env.EZ_BILD.replace(".png", "-lager.png") });
  /* Anna bricht gemeinsam auf – Ben reist mit */
  await anna.click('#ez-konto [data-t="los"]'); await anna.waitForURL(/ort=weidenhain/, { timeout: 15000 }); await anna.waitForFunction(() => window.EZO, null, { timeout: 30000 });
  await ben.waitForURL(/ort=weidenhain.*mitreise=1/, { timeout: 20000 }); await ben.waitForFunction(() => window.EZO, null, { timeout: 30000 }); check(true, "Ben reist mit Anna nach Weidenhain");
  await anna.waitForFunction(() => window.EZO.szene.andere.size === 1, null, { timeout: 15000 }); await ben.waitForFunction(() => window.EZO.szene.andere.size === 1, null, { timeout: 15000 }); check(true, "Beide sehen sich im Dorf");
  await ben.evaluate(() => { const o = window.EZO.szene; o.ort.x = 970; o.ort.y = 800; });
  await anna.waitForFunction(() => { const a = [...window.EZO.szene.andere.values()][0]; return Math.hypot(a.zx - 970, a.zy - 800) < 5; }, null, { timeout: 10000 }); check(true, "Anna sieht, wo Ben im Dorf steht");
  if (process.env.EZ_BILD) await anna.screenshot({ path: process.env.EZ_BILD.replace(".png", "-dorf.png") });
  /* Ben spricht mit Hanne – Anna liest mit, der Fortschritt landet in Annas Spielstand */
  await ben.waitForFunction(() => window.EZO.szene.nah === "hanne", null, { timeout: 10000 }); await ben.evaluate(() => window.EZO.szene.sprechen());
  await anna.waitForSelector("#ez-dialog:not([hidden])", { timeout: 10000 }); check(/Ben spricht mit Hanne/.test(await anna.textContent("#ez-dialog .text")), "Anna liest Bens Gespräch mit Hanne mit");
  if (process.env.EZ_BILD) await anna.screenshot({ path: process.env.EZ_BILD.replace(".png", "-mit.png") });
  for (let i = 0; i < 12 && !(await ben.$("#ez-dialog .knoepfe button.haupt")); i++) { await ben.click("#ez-dialog .kasten"); await ben.waitForTimeout(150); } await ben.click("#ez-dialog .knoepfe button.haupt");
  await anna.waitForFunction(() => JSON.parse(localStorage.getItem("ez_ort_weidenhain") || "{}").hanne === true, null, { timeout: 10000 }); check(true, "Bens Gespräch zählt für den Spielstand der Gruppe (bei Anna gespeichert)");
  for (let i = 0; i < 12 && await anna.$("#ez-dialog:not([hidden])"); i++) { const k = await anna.$("#ez-dialog .knoepfe button"); if (k) await k.click(); else await anna.click("#ez-dialog .kasten"); await anna.waitForTimeout(150); }
  /* Ben öffnet die Scheunentür – die ganze Gruppe geht in den Kornspeicher */
  await ben.evaluate(() => { const o = window.EZO.szene; o.ort.x = 824; o.ort.y = 490; }); await ben.waitForFunction(() => window.EZO.szene.nah === "@scheune", null, { timeout: 10000 }); await ben.evaluate(() => window.EZO.szene.sprechen());
  await anna.waitForURL(/kampf=speicher/, { timeout: 15000 }); check(true, "Bens Tür holt Anna in den Kampf"); await anna.waitForFunction(() => window.EZ && window.EZ.netz && window.EZ.netz.art === "server" && window.EZ.zustand(), null, { timeout: 30000 });
  await ben.waitForURL(/mitglied=1/, { timeout: 15000 }); await ben.waitForFunction(() => window.EZ && window.EZ.netz && window.EZ.netz.art === "server" && window.EZ.zustand(), null, { timeout: 30000 }); await ben.waitForTimeout(800);
  const t0 = await anna.evaluate(() => window.EZ.zustand().zeit); await anna.waitForFunction(() => document.getElementById("ez-koopstart").hidden, null, { timeout: 15000 }); const t1 = await anna.evaluate(() => window.EZ.zustand().zeit);
  check(t0 === 0, `Der Kampf wartet, bis Ben da ist, und zählt dann gemeinsam herunter (Kampfzeit beim Warten: ${t0} s, danach läuft sie: ${t1} s)`);
  const zb = await ben.evaluate(() => { const z = window.EZ.zustand(); return { ich: z.w.find((e) => e[0] === z.ich.id)[2], helden: z.w.filter((e) => e[1]).map((e) => e[2]).sort().join(","), lp: z.w.find((e) => e[0] === z.ich.id)[8] }; });
  check(zb.ich === "kopfgeldjaeger" && zb.helden === "kopfgeldjaeger,schildwaechter", `Ben ist im selben Kampf und spielt seinen Helden (Helden: ${zb.helden})`);
  check(zb.lp === 257, `Ben bringt seine eigene Stufe mit (Orin mit 120 EP = Stufe 2: ${zb.lp} LP)`);
  const za = await anna.evaluate(() => { const z = window.EZ.zustand(); return z.w.find((e) => e[0] === z.ich.id)[2]; }); check(za === "schildwaechter", "Anna steuert weiter Torvald");
  /* Ben läuft – sein Held bewegt sich, auch bei Anna sichtbar */
  const ort = (p) => p.evaluate(() => { const z = window.EZ.zustand(); const e = z.w.find((q) => q[2] === "kopfgeldjaeger"); return [e[4], e[5]]; }); const o1 = await ort(anna);
  await ben.bringToFront(); await ben.keyboard.down("d"); await ben.waitForTimeout(700); await ben.keyboard.up("d"); await ben.waitForTimeout(300); let o2 = await ort(anna);
  if (Math.hypot(o2[0] - o1[0], o2[1] - o1[1]) < 0.8) { console.log("  (Taste kam nicht an – direkt gesendet)", JSON.stringify(await ort(ben))); await ben.evaluate(() => window.EZ.netz.sende({ t: "richtung", x: 1, y: 0 })); await ben.waitForTimeout(700); await ben.evaluate(() => window.EZ.netz.sende({ t: "richtung", x: 0, y: 0 })); await ben.waitForTimeout(300); o2 = await ort(anna); }
  check(Math.hypot(o2[0] - o1[0], o2[1] - o1[1]) > 0.8, `Bens Eingaben steuern seinen Helden (bei Anna sichtbar, ${Math.hypot(o2[0] - o1[0], o2[1] - o1[1]).toFixed(1)} Felder)`);
  /* Anna räumt den Speicher (Testabkürzung: die Gegner werden direkt bekämpft) */
  const bot = (p) => p.evaluate(() => { window.__bot = setInterval(() => { const E = window.EZ, z = E.zustand(); if (!z) return; const ich = z.w.find((e) => e[0] === z.ich.id); let m = null, bd = 1e9; for (const e of z.w) { if (e[1] || e[10] || e[3] === 0) continue; const d = Math.hypot(e[4] - ich[4], e[5] - ich[5]); if (d < bd) { bd = d; m = e; } } if (m) { if (bd > 1.6) E.netz.sende({ t: "lauf", x: m[4], y: m[5] }); else E.netz.sende({ t: "halt" }); E.netz.sende({ t: "ziel", id: m[0] }); } }, 250); });
  await bot(anna); await bot(ben);
  await anna.waitForFunction(() => window.EZ.zustand().phase === "sieg", null, { timeout: 180000 }); await anna.waitForTimeout(800);
  check(SIEGE.some((s) => s.user.endsWith("a001") && s.kampf === "speicher") && SIEGE.some((s) => s.user.endsWith("b002") && s.kampf === "speicher"), "Der Sieg zählt für beide Konten");
  /* Anna verlässt den Kampf – Ben bekommt seine Gutschrift und geht zurück */
  await anna.evaluate(() => { clearInterval(window.__bot); window.EZ.netz.sende({ t: "verlassen" }); window.EZ.netz.ende(); }); await anna.waitForTimeout(2500);
  const bb = buchungen.find((x) => x.p_user.endsWith("b002")), ba = buchungen.find((x) => x.p_user.endsWith("a001"));
  check(ba && ba.p_ep.schildwaechter > 0, `Anna bekommt ihre Gutschrift (Torvald +${ba && ba.p_ep.schildwaechter} EP)`);
  check(bb && bb.p_ep.kopfgeldjaeger > 0 && !bb.p_ep.schildwaechter, `Ben bekommt seine eigene Gutschrift, nur für seinen Helden (Orin +${bb && bb.p_ep.kopfgeldjaeger} EP)`);
  await ben.waitForURL((u) => !/mitglied=1/.test(String(u)), { timeout: 15000 }).catch(() => {}); check(/mitreise=1/.test(ben.url()) && !/mitglied=1/.test(ben.url()), "Ben ist danach zurück im gemeinsamen Dorf");
  check(fehlerSeite.length === 0, "keine Fehler im Browser" + (fehlerSeite.length ? ": " + fehlerSeite[0] : ""));
} catch (e) { fehler++; console.log("Unerwarteter Fehler:", e); console.log(log.slice(-1500)); }
await br.close(); srv.kill(); sb.close();
console.log(fehler ? `\nKoop: ${fehler} FEHLER` : "\nKoop: alles in Ordnung"); process.exit(fehler ? 1 : 0);
