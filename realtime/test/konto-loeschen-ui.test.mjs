/* Riftmere – Konto löschen auf der Willkommensseite (Browser): Einstellungen → „Konto löschen …“ → Passwort → falsches Passwort zeigt den Fehler,
   richtiges löscht, meldet ab und führt zur Anmeldeseite („Dein Konto ist gelöscht.“). Der Spielserver ist hier nachgebildet (Antworten wie server/src/index.ts).
   Aufruf: node test/konto-loeschen-ui.test.mjs (Webseite auf http://localhost:8765, Projektwurzel; BILD=pfad/ für Fotos) */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const FAKE = `window.supabase = { createClient() { const L = (k) => JSON.parse(sessionStorage.getItem(k) || "null");
  return { auth: { async getSession() { const s = L("fake_sitzung"); return { data: { session: s ? { access_token: "tok_" + s + "_xxxxxxxxxxxxxxxxxxxxxxxx", user: { is_anonymous: false } } : null } }; },
      async signOut() { sessionStorage.removeItem("fake_sitzung"); return { error: null }; }, async signInAnonymously() { return { error: null }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } },
    async rpc(fn) { if (fn === "rpg_my_profile") return { data: { handle: "Anna", konto: true }, error: null }; return { data: null, error: null }; }, from() { return { select() { return this; }, order() { return this; }, limit() { return Promise.resolve({ data: [], error: null }); }, eq() { return this; } }; } }; } };`;
const br = await chromium.launch(), ctx = await br.newContext({ viewport: { width: 1100, height: 700 } }), p = await ctx.newPage(), f = [], ANFRAGEN = []; p.on("pageerror", (e) => f.push(String(e)));
await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE }));
await ctx.route("**/konto/loeschen", async (r) => { const a = JSON.parse(r.request().postData() || "{}"); ANFRAGEN.push({ pw: a.passwort, auth: r.request().headers().authorization });
  const ok = a.passwort === "geheim123"; await r.fulfill({ status: ok ? 200 : 403, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok, text: ok ? "Dein Konto ist gelöscht." : "Das Passwort stimmt nicht." }) }); });
await ctx.addInitScript(() => { if (!localStorage.getItem("test_t0")) { localStorage.setItem("test_t0", "1"); sessionStorage.setItem("fake_sitzung", JSON.stringify("anna")); localStorage.setItem("ez_probe", "5"); localStorage.setItem("ez_zoom", "1.2"); } });
const WEG = []; p.on("framenavigated", (fr) => { if (fr === p.mainFrame()) WEG.push(fr.url().split("/").pop()); });
try {
  await p.goto("http://localhost:8765/echtzeit/willkommen.html"); await p.waitForTimeout(1500);
  check(/willkommen/.test(p.url()), "Willkommensseite offen (" + p.url().split("/").pop() + ")");
  await p.click("#einst"); await p.waitForTimeout(200); check(await p.isVisible("#loesch-auf"), "Einstellungen: „Konto löschen …“ ist da");
  await p.click("#loesch-auf"); check(await p.isVisible("#loesch-pw"), "Nach dem Klick: Warnung und Passwortfeld");
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "konto-loeschen.png" });
  await p.fill("#loesch-pw", "falsch"); await p.click('#loesch button[type="submit"]'); await p.waitForTimeout(800);
  check(/Passwort stimmt nicht/.test(await p.textContent("#loesch-info")) && /willkommen/.test(p.url()) && await p.evaluate(() => localStorage.getItem("ez_probe")) === "5", "Falsches Passwort: Fehler, nichts passiert");
  check(ANFRAGEN[0] && /^Bearer tok_anna_/.test(ANFRAGEN[0].auth), "Die Anfrage trägt die eigene Anmeldung");
  await p.fill("#loesch-pw", "geheim123"); await Promise.all([p.waitForURL(/anmelden\.html/, { timeout: 10000 }).catch(() => {}), p.click('#loesch button[type="submit"]')]); await p.waitForTimeout(800);
  check(/anmelden\.html\?geloescht=1/.test(p.url()), "Richtiges Passwort: zur Anmeldeseite (" + p.url() + " · " + (await p.textContent("#loesch-info").catch(() => "")) + ")");
  check(/Konto ist gelöscht/.test(await p.textContent("#meldung")), "Dort: „Dein Konto ist gelöscht.“");
  check(await p.evaluate(() => localStorage.getItem("ez_probe")) === null && await p.evaluate(() => localStorage.getItem("ez_zoom")) === "1.2", "Spielstand vom Gerät weg, Zoom bleibt");
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "konto-geloescht.png" });
} catch (e) { check(false, "Abbruch: " + (e && e.message)); }
check(f.length === 0, "Keine Fehler im Browser" + (f.length ? ": " + f.join(" | ") : ""));
await br.close(); console.log(fehler ? `\n${fehler} Prüfungen fehlgeschlagen` : "\nKonto löschen (Seite): alles in Ordnung"); process.exit(fehler ? 1 : 0);
