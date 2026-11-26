/* Abmelden in zwei Stufen (25.11.2026): im Spiel „Abmelden“ → Willkommensseite (noch angemeldet, Spielstand bleibt); dort „Abmelden“ → Anmeldeseite, der kontoeigene Spielstand ist vom Gerät weg, Geräte-Einstellungen (Zoom) bleiben.
   Nachgebildete Datenbank wie in konto.test.mjs. Aufruf: node test/abmelden-stufen.test.mjs (Webseite auf http://localhost:8765, Projektwurzel) */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
const URL0 = "http://localhost:8765/echtzeit/"; let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const FAKE = `window.supabase = { createClient() { const L = (k) => JSON.parse(sessionStorage.getItem(k) || "null"), S = (k, v) => sessionStorage.setItem(k, JSON.stringify(v));
  const db = () => L("fake_db") || { konten: { Anna: { pw: "geheim1", stand: null, version: 0 }, Bert: { pw: "geheim2", stand: null, version: 0 } } };
  return { auth: { async getSession() { const s = L("fake_sitzung"); return { data: { session: s ? { user: { is_anonymous: s === "gast" } } : null } }; }, async signInAnonymously() { S("fake_sitzung", "gast"); return { error: null }; },
      async signInWithPassword({ email, password }) { const n = email.split("@")[0], k = db().konten[n]; if (!k || k.pw !== password) return { error: { message: "Invalid login credentials" } }; S("fake_sitzung", n); return { error: null }; }, async signOut() { sessionStorage.removeItem("fake_sitzung"); }, async updateUser({ email, password }) { const d = db(), n = email.split("@")[0]; d.konten[n] = { pw: password, stand: null, version: 0 }; S("fake_db", d); S("fake_sitzung", n); return { error: null }; } },
    async rpc(fn, a) { const d = db(), wer = L("fake_sitzung"), k = d.konten[wer]; window.__rpc = (window.__rpc || []).concat(fn);
      if (fn === "rpg_set_profile") return d.konten[a.p_handle] ? { data: null, error: { message: "Dieser Benutzername ist schon vergeben." } } : { data: { anmeldung: a.p_handle + "@x" }, error: null };
      if (fn === "rpg_handle_frei") return { data: d.konten[a.p_handle] ? "vergeben" : "frei", error: null };
      if (fn === "rpg_login_email") return { data: d.konten[a.p_handle] ? a.p_handle + "@x" : null, error: null };
      if (fn === "rpg_my_profile") return { data: k ? { handle: wer, konto: true } : { konto: false }, error: null };
      if (!k) return { data: null, error: { message: "Bitte melde dich an." } };
      if (fn === "rpg_held_lesen") return { data: JSON.parse(localStorage.getItem("ez_mein_held") || "null"), error: null }; if (fn === "rpg_echtzeit_laden") return { data: k.stand ? { stand: k.stand, version: k.version } : { stand: {}, version: 0 }, error: null };
      if (fn === "rpg_echtzeit_speichern") { if (k.stand && a.p_version !== k.version) return { data: { ok: false, konflikt: true, stand: k.stand, version: k.version }, error: null }; k.stand = a.p_stand; k.version = (k.stand ? k.version : 0) + 1; S("fake_db", d); return { data: { ok: true, version: k.version }, error: null }; }
      return { data: null, error: { message: "unbekannt " + fn } }; } }; } };`;
const br = await chromium.launch(), ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(), f = []; p.on("pageerror", (e) => f.push(String(e)));
await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE }));
await ctx.addInitScript(() => { if (!sessionStorage.getItem("test_start")) { sessionStorage.setItem("test_start", "1"); sessionStorage.setItem("fake_sitzung", JSON.stringify("Anna")); sessionStorage.setItem("ez__lager", "1"); sessionStorage.setItem("ez__gefragt", "1"); sessionStorage.setItem("ez__hilfe", "1"); localStorage.setItem("ez_probe", "7"); localStorage.setItem("ez_zoom", "1.3"); localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "vollbart", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" })); } });
try {
  await p.goto(URL0 + "?welt3d=0"); await p.waitForFunction(() => window.EZD || (window.EZW && window.EZW.szene), null, { timeout: 30000 }).catch(async () => { console.log("URL", p.url(), (await p.textContent("body")).slice(0, 200).replace(/\s+/g, " ")); throw new Error("nicht im Spiel"); }); await p.waitForTimeout(1200);
  check(!/willkommen|anmelden/.test(p.url()), "Angemeldet im Spiel (" + p.url().replace(URL0, "") + ")");
  await p.click("#ez-profil"); await p.waitForSelector('#ez-konto [data-t="ab"]', { timeout: 5000 });
  await Promise.all([p.waitForURL(/willkommen\.html/, { timeout: 15000 }), p.click('#ez-konto [data-t="ab"]')]);
  check(/willkommen\.html/.test(p.url()), "Abmelden im Spiel → Willkommensseite");
  check(await p.evaluate(() => JSON.parse(sessionStorage.getItem("fake_sitzung") || "null")) === "Anna" && await p.evaluate(() => localStorage.getItem("ez_probe")) === "7", "… dort noch angemeldet, der Spielstand ist noch da");
  await p.waitForTimeout(1500); await Promise.all([p.waitForURL(/anmelden\.html/, { timeout: 15000 }), p.click("#ab")]);
  check(/anmelden\.html/.test(p.url()), "Abmelden auf der Willkommensseite → Anmeldeseite");
  check(await p.evaluate(() => localStorage.getItem("ez_probe")) === null && await p.evaluate(() => localStorage.getItem("ez_zoom")) === "1.3", "Spielstand vom Gerät weg, Zoom (Gerät) bleibt");
  check(await p.evaluate(() => sessionStorage.getItem("fake_sitzung")) === null || await p.evaluate(() => JSON.parse(sessionStorage.getItem("fake_sitzung") || "null")) === null, "Abgemeldet");
} catch (e) { check(false, "Abbruch: " + (e && e.message)); }
check(f.length === 0, "Keine Fehler im Browser" + (f.length ? ": " + f.join(" | ") : ""));
await br.close(); console.log(fehler ? `\n${fehler} Prüfungen fehlgeschlagen` : "\nAbmelden in zwei Stufen: alles in Ordnung"); process.exit(fehler ? 1 : 0);
