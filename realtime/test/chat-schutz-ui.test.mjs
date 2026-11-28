/* Chat-Schutz (25.11.2026): Schimpfwortfilter auf dem Server, Name im Chat antippen → Blockieren / Melden (Meldung über rpg_feedback_send, Migration 032),
   Blockierte sieht man nicht mehr (Server stellt nicht zu), Liste in den Einstellungen mit „Aufheben“; Chat in der 3D-Welt durchsichtig.
   Aufruf: node test/chat-schutz-ui.test.mjs (BILD=pfad/ für Fotos). Gerüst aus anzeige-ui.test.mjs. */
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { spawn } from "node:child_process";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const NUTZER = { ["tok_anna_" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000a001", ["tok_ben__" + "x".repeat(30)]: "00000000-0000-0000-0000-00000000b002" };
const WERTE = { "00000000-0000-0000-0000-00000000a001": { ep: { schildwaechter: 300 }, seelen: 0 }, "00000000-0000-0000-0000-00000000b002": { ep: { kopfgeldjaeger: 120 }, seelen: 0 } }, SIEGE = [], buchungen = [];
const EINL = []; const PROFIL = { "00000000-0000-0000-0000-00000000a001": "Anna", "00000000-0000-0000-0000-00000000b002": "Ben" }, AKTIV = { "00000000-0000-0000-0000-00000000b002": "kopfgeldjaeger" }, HELDSETZEN = [];
const STELLE = {}; const HELD = { "00000000-0000-0000-0000-00000000a001": { geschlecht: "mann", frisur: "scheitel", bart: "vollbart", haarfarbe: "dunkelbraun", hautfarbe: "mittel", waffe: "schwert", skill_geschick: 0, skill_staerke: 0, skill_fernkampf: 0, skill_magie: 0, inventar: { angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [{ g: "holzbeil_training", n: 1 }], v: 2 }, quests: { die_gesperrte_strasse: { s: "fertig" } } } } /* Quest 1 erledigt: Jori läuft nicht herbei */, XPBUCH = []; const wer = (url) => (url.match(/user_id=eq\.([0-9a-f-]+)/) || [])[1];
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
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_position")) return send(200, STELLE[wer(req.url)] ? [STELLE[wer(req.url)]] : []); /* gemerkte Stelle (Migration 039) */
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_position_setzen") { const a = JSON.parse(b); STELLE[a.p_user] = { region: a.p_region, x: a.p_x, y: a.p_y }; return send(200, { ok: true }); }
  if (req.url.startsWith("/rest/v1/rpg_profiles")) return send(200, PROFIL[wer(req.url)] ? [{ handle: PROFIL[wer(req.url)] }] : []);
  if (req.url.startsWith("/rest/v1/rpg_echtzeit_aktiver_held")) return send(200, AKTIV[wer(req.url)] ? [{ held: AKTIV[wer(req.url)] }] : []);
  if (req.url === "/rest/v1/rpc/rpg_echtzeit_held_setzen") { const a = JSON.parse(b); AKTIV[a.p_user] = a.p_held; HELDSETZEN.push(a); return send(200, { ok: true, held: a.p_held }); }
  if (req.url.startsWith("/rest/v1/rpg_held?")) return send(200, HELD[wer(req.url)] ? [HELD[wer(req.url)]] : []);
  if (req.url === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(b); if (HELD[a.p_user]) HELD[a.p_user].inventar = a.p_inventar; return send(200, true); }
  if (req.url === "/rest/v1/rpc/rpg_held_skill_gutschrift") { const a = JSON.parse(b); XPBUCH.push(a); const H = HELD[a.p_user]; if (!H) return send(200, null); for (const k of ["geschick", "staerke", "fernkampf", "magie"]) H["skill_" + k] += a["p_" + k]; return send(200, { geschick: H.skill_geschick, staerke: H.skill_staerke, fernkampf: H.skill_fernkampf, magie: H.skill_magie }); }
  send(404, {}); }); }).listen(8798);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8786", SUPABASE_URL: "http://localhost:8798", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765", BUCHUNG_RUHE_MS: "800", BUCHUNG_SPAETESTENS_MS: "3000", HOLZ_FALL: "0", HOLZ_KERN: "0" }, stdio: ["ignore", "pipe", "pipe"] }); let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));
const FAKE = (name) => `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: { access_token: sessionStorage.getItem("fake_token") || "", user: { is_anonymous: false } } } }; } },
  async rpc(fn, a) { if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_feedback_send") { window.__meldung = a; return { data: { ok: true }, error: null }; } if (fn === "rpg_my_profile") return { data: { handle: "${name}", konto: true }, error: null };
    if (fn === "rpg_my_friends") return { data: { freunde: [{ handle: "${name}" === "Anna" ? "Ben" : "Anna" }], an_mich: [], von_mir: [] }, error: null };
    if (fn === "rpg_echtzeit_einladen") { await fetch("http://localhost:8798/fake/einladen", { method: "POST", body: JSON.stringify({ von: "${name}", an: a.p_handle, code: a.p_code }) }); return { data: { ok: true }, error: null }; }
    if (fn === "rpg_echtzeit_einladungen") return { data: await (await fetch("http://localhost:8798/fake/einladungen?an=${name}")).json(), error: null };
    if (fn === "rpg_echtzeit_einladung_weg") { await fetch("http://localhost:8798/fake/weg?id=" + a.p_id); return { data: { ok: true }, error: null }; } if (fn === "rpg_echtzeit_werte") return { data: { ep: {}, seelen: 0 }, error: null }; if (fn === "rpg_echtzeit_siege") return { data: [], error: null };
    if (fn === "rpg_echtzeit_laden") return { data: { stand: {}, version: 0 }, error: null }; if (fn === "rpg_echtzeit_speichern") return { data: { ok: true, version: 1 }, error: null }; return { data: null, error: null }; } }; } };`;
const fs = require("fs"), path = require("path"), WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u)); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYP[path.extname(f)] || "application/octet-stream" }); };
const FAKE_GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt"] }), S = "?welt3d=1&schatten=0&zeitraffer=1&server=ws://localhost:8786", B = "http://localhost:8765/echtzeit/", fehlerSeite = [];
async function spieler(name, token, stelle) { const ctx = await br.newContext({ viewport: process.env.VIEW ? { width: +process.env.VIEW.split("x")[0], height: +process.env.VIEW.split("x")[1] } : { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(name + ": " + e));
  await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: token ? FAKE(name) : FAKE_GAST }));
  await ctx.addInitScript(() => { const t = setInterval(() => { const f = window.EZ_UNTAETIG; if (f) { f(-864e5); clearInterval(t); } }, 200); }); /* wach halten (#109): mit ?server= läuft der Untätigkeitswächter nicht, die letzte Eingabe bliebe beim Laden stehen – nach 70 s kein Lebenszeichen „da“ mehr, und der Server meldet nach 5½ Minuten ab. Unter Last dauert der Test länger. */ await ctx.addInitScript(([t, st]) => { if (t) sessionStorage.setItem("fake_token", t); sessionStorage.setItem("ez__gefragt", "1"); if (!localStorage.getItem("ez_mein_held")) localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_quest_verfolgt", "nordwald_waldsaebel"); if (st && !sessionStorage.getItem("st")) { localStorage.setItem("ez_welt_pos", JSON.stringify(st)); sessionStorage.setItem("st", "1"); } }, [token, stelle]);
  return p; }
const bereit = (p) => p.waitForFunction(() => window.EZK && window.EZK.bereit && window.EZK.z && window.EZW && window.EZW.welt3d, null, { timeout: 120000 });

const schirm = (p, x, y, h = 1.0) => p.evaluate(([x, y, h]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y) + h, y); }, [x, y, h]);
try {
  const anna = await spieler("Anna", "tok_anna_" + "x".repeat(30), [6440, 6440, "waldmark"]); anna.setDefaultTimeout(90000);
  const ben = await spieler("Ben", "tok_ben__" + "x".repeat(30), [6441, 6441, "waldmark"]); ben.setDefaultTimeout(90000);
  await anna.goto(B + S + "&vorwaermen=0"); await ben.goto(B + S + "&vorwaermen=0");
  for (const p of [anna, ben]) await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 120000 });
  await anna.waitForTimeout(2500);
  for (const p of [anna, ben]) await p.evaluate(() => { const c = document.getElementById("ez-chat"); if (c && c.classList.contains("zu")) c.querySelector(".klapp").click(); }); /* Handy: Chat ist anfangs eingeklappt */
  const schreiben = async (p, t) => { await p.fill("#ez-chat input", t); await p.press("#ez-chat input", "Enter"); await p.waitForTimeout(900); };
  const zeilen = (p) => p.evaluate(() => [...document.querySelectorAll("#ez-chat .liste p")].map((e) => e.textContent.replace(/^\[\d\d:\d\d\]\s*/, "")));
  /* 1) Wortfilter */
  await schreiben(ben, "Hallo Anna, du F1cker, das ist sch3isse!"); await schreiben(ben, "Wir marschieren nach Osthof, die Kühe fressen.");
  await anna.waitForFunction(() => [...document.querySelectorAll("#ez-chat .liste p")].filter((e) => /Ben:/.test(e.textContent)).length >= 2, null, { timeout: 20000 }).catch(() => {});
  let z = await zeilen(anna);
  check(z.some((x) => /Ben: Hallo Anna, du \*+ das ist \*+/.test(x)) && !z.some((x) => /F1cker|sch3isse/i.test(x)), "Schimpfwörter bei Anna ausgesternt: " + z.filter((x) => /^Ben/.test(x)).join(" | "));
  check(z.some((x) => /marschieren nach Osthof, die Kühe fressen\./.test(x)), "Harmlose Wörter bleiben");
  /* 2) Chat durchsichtig, Schrift hell mit Rand */
  const st = await anna.evaluate(() => { const l = getComputedStyle(document.querySelector("#ez-chat .liste")); return { bg: l.backgroundImage + " " + l.backgroundColor, c: l.color, sh: l.textShadow }; });
  check(/rgba\(14, 10, 6, 0\.3\)/.test(st.bg) && st.c === "rgb(251, 241, 216)" && /rgb\(0, 0, 0\)/.test(st.sh), "Chat durchsichtig, helle Schrift mit dunklem Rand");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "chat-durchsichtig.png" });
  /* 3) Namen antippen → Karte mit Blockieren und Melden */
  await anna.click('#ez-chat .liste a.cn[data-cn="Ben"]'); await anna.waitForSelector("#ez-konto .reihe.schutz", { timeout: 30000 });
  const kn = await anna.evaluate(() => [...document.querySelectorAll("#ez-konto .reihe.schutz button")].map((b) => b.textContent));
  check(kn.join(",") === "Blockieren,Melden", "Spielerkarte: " + kn.join(", "));
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "chat-karte.png" });
  await anna.click('#ez-konto [data-t="melden"]'); await anna.waitForSelector("#ez-konto form.meldung", { timeout: 20000 });
  await anna.selectOption('#ez-konto select[name="grund"]', "Beleidigung oder Belästigung"); await anna.fill('#ez-konto textarea[name="text"]', "Beschimpft mich im Chat.");
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "chat-melden.png" });
  await anna.click('#ez-konto form.meldung button[type="submit"]'); await anna.waitForTimeout(800);
  const m = await anna.evaluate(() => window.__meldung);
  check(m && /^Spielermeldung: Ben – Beleidigung oder Belästigung: Beschimpft mich/.test(m.p_text) && m.p_kontext.gemeldet === "Ben" && m.p_kontext.chat.length === 2 && m.p_art === "feedback", "Meldung mit Grund und Bens letzten 2 Chatzeilen: " + (m && m.p_text));
  check(await anna.evaluate(() => document.getElementById("ez-konto").hidden), "Fenster nach dem Senden zu");
  z = await zeilen(anna); check(!z.some((x) => /^Ben:/.test(x)) && z.some((x) => /Meldung über Ben ist eingegangen/.test(x)) && z.some((x) => /Ben ist blockiert/.test(x)), "Ben zugleich blockiert, seine Zeilen weg");
  check(await anna.evaluate(() => localStorage.getItem("rift_blockiert")) === '["Ben"]', "Blockierliste gemerkt");
  /* 4) Blockiert: öffentlich und Flüstern kommen nicht an */
  await schreiben(ben, "Bist du noch da?"); z = await zeilen(anna); check(!z.some((x) => /Bist du noch da/.test(x)), "Öffentliche Nachricht von Ben kommt nicht an");
  const zb = await zeilen(ben); check(zb.some((x) => /Ben: Bist du noch da/.test(x)), "Ben sieht seine eigene Nachricht");
  await ben.evaluate(() => window.dispatchEvent(new Event("x"))); 
  const annaId = await anna.evaluate(() => window.EZW && window.EZW.ich ? window.EZW.ich.id : null);
  /* 5) Einstellungen → Blockierte Spieler → Aufheben */
  await anna.evaluate(() => { const b = [...document.querySelectorAll("button, [role=button]")].find((x) => /Menü|Einstellungen/.test(x.getAttribute("aria-label") || x.title || "")); if (b) b.click(); });
  await anna.waitForSelector('#ez-konto [data-t="blockiert"]', { timeout: 30000 });
  check(/Blockierte Spieler\s*1/.test(await anna.textContent('#ez-konto [data-t="blockiert"]')), "Einstellungen: „Blockierte Spieler 1“");
  await anna.click('#ez-konto [data-t="blockiert"]'); await anna.waitForSelector("#ez-konto .blockliste", { timeout: 30000 });
  if (process.env.BILD) await anna.screenshot({ path: process.env.BILD + "chat-blockliste.png" });
  await anna.click('#ez-konto [data-frei="Ben"]'); await anna.waitForTimeout(300);
  check(/niemanden blockiert/.test(await anna.textContent("#ez-konto .tafel")), "Aufgehoben – Liste leer");
  await anna.click('#ez-konto [data-w="zurueck"]'); await anna.waitForTimeout(200); await anna.keyboard.press("Escape");
  await schreiben(ben, "Jetzt wieder sichtbar?"); await anna.waitForFunction(() => /Jetzt wieder sichtbar/.test(document.querySelector("#ez-chat .liste").textContent), null, { timeout: 15000 }).catch(() => {}); z = await zeilen(anna); check(z.some((x) => /Ben: Jetzt wieder sichtbar\?/.test(x)), "Nach dem Aufheben kommen Bens Nachrichten wieder an");
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); if (process.env.BILD) for (const [n, p] of [["anna", br.contexts()[0]?.pages()[0]]]) if (p) await p.screenshot({ path: process.env.BILD + "fehler-" + n + ".png" }).catch(() => {}); }
await br.close(); srv.kill(); sb.close(); if (fehler) console.log(log.slice(-1500));
console.log(fehler ? fehler + " Fehler" : "Chat-Schutz: alles in Ordnung"); process.exit(fehler ? 1 : 0);
