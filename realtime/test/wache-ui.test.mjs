/* Admin-Seite „Wache“ (25.11.2026): Anmelden mit Benutzername + Passwort, Nicht-Admin bekommt „Kein Zugriff“, Admin sieht Spielermeldungen
   (gemeldeter Spieler, Grund, eigene Worte, Chatzeilen) und Feedback/Bugs, „Erledigt“ ruft rpg_admin_feedback_read. Datenbank nachgebildet.
   Aufruf: node test/wache-ui.test.mjs (BILD=pfad/ für Fotos); statischer Server: python3 -m http.server 8765 im Projektordner */
import { createRequire } from "node:module"; const require = createRequire(import.meta.url), { chromium } = require("playwright");
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const FAKE = `(() => { const L = [
  { id: "m1", art: "feedback", text: "Spielermeldung: Ben – Beleidigung oder Belästigung: Beschimpft mich im Chat.", von: "Anna", am: "2026-11-25T17:30:00Z", gelesen: false, kontext: { meldung: true, gemeldet: "Ben", grund: "Beleidigung oder Belästigung", ort: "waldmark", chat: [{ zeit: "2026-11-25T17:29:00Z", kanal: "oeffentlich", text: "du ******* <b>x</b>" }] } },
  { id: "f1", art: "bug", text: "Die Bank geht nicht auf.", von: "Cara", am: "2026-11-25T16:00:00Z", gelesen: false, kontext: { geraet: "iPhone" } },
  { id: "f2", art: "feedback", text: "Tolles Spiel!", von: "Dirk", am: "2026-11-24T16:00:00Z", gelesen: true, kontext: {} } ];
  let wer = null; window.__rufe = [];
  const antwort = () => ({ neu: L.filter((f) => !f.gelesen).length, gesamt: L.length, liste: JSON.parse(JSON.stringify(L)) });
  window.supabase = { createClient() { return { auth: {
    async getSession() { return { data: { session: wer ? { user: { is_anonymous: wer === "anon" } } : null } }; },
    async signInAnonymously() { wer = "anon"; return { error: null }; },
    async signInWithPassword({ email, password }) { if (password !== "geheim123") return { error: { message: "Invalid login credentials" } }; wer = email.startsWith("admin") ? "admin" : "spieler"; return { error: null }; },
    async signOut() { wer = null; return { error: null }; } },
    async rpc(fn, a) { window.__rufe.push([fn, a]);
      if (fn === "rpg_login_email") return { data: a.p_handle === "Chef" ? "admin@x" : "spieler@x", error: null };
      if (fn === "rpg_admin_feedback") return wer === "admin" ? { data: antwort(), error: null } : { data: null, error: { message: "Nur Admins lesen die Nachrichten." } };
      if (fn === "rpg_admin_feedback_read") { if (wer !== "admin") return { data: null, error: { message: "Nur Admins lesen die Nachrichten." } }; const f = L.find((x) => x.id === a.p_id); if (f) f.gelesen = a.p_gelesen; return { data: antwort(), error: null }; }
      return { data: null, error: { message: "?" } }; } }; } }; })();`;
const br = await chromium.launch(); const fehlerSeite = [];
try {
  const ctx = await br.newContext({ viewport: { width: 1100, height: 900 } }), p = await ctx.newPage(); p.on("pageerror", (e) => fehlerSeite.push(String(e)));
  await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE }));
  await p.goto("http://localhost:8765/echtzeit/wache-9gv41g35qkwx.html");
  check(await p.getAttribute('meta[name="robots"]', "content") === "noindex, nofollow, noarchive", "Für Suchmaschinen gesperrt");
  await p.waitForSelector("#name"); if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "wache-login.png" });
  await p.fill("#name", "Ben"); await p.fill("#pw", "falsch"); await p.click("#los"); await p.waitForTimeout(300);
  check(/falsch/.test(await p.textContent("#meldung")), "Falsches Passwort: " + await p.textContent("#meldung"));
  await p.fill("#name", "Ben"); await p.fill("#pw", "geheim123"); await p.click("#los"); await p.waitForTimeout(400);
  check(/Kein Zugriff/.test(await p.textContent("#meldung")) && Boolean(await p.$("#name")) && !(await p.$(".karte")), "Nicht-Admin: „Kein Zugriff“, wieder abgemeldet, keine Daten");
  await p.fill("#name", "Chef"); await p.fill("#pw", "geheim123"); await p.click("#los"); await p.waitForSelector(".karte");
  const k = await p.evaluate(() => [...document.querySelectorAll(".karte")].map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  check(k.length === 1 && /Ben/.test(k[0]) && /Beleidigung/.test(k[0]) && /gemeldet von Anna/.test(k[0]) && /„Beschimpft mich im Chat\.“/.test(k[0]) && /Ben: du \*+ <b>x<\/b>/.test(k[0]), "Spielermeldung mit Grund, Melder, eigenen Worten und Chatzeile (als Text): " + k[0]);
  check(/Spielermeldungen\s*1/.test(await p.textContent('[data-r="meldungen"]')) && /Feedback & Bugs\s*1/.test(await p.textContent('[data-r="feedback"]')), "Zähler offener Einträge an den Reitern");
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "wache-meldungen.png" });
  await p.click('.karte [data-id="m1"]'); await p.waitForTimeout(300);
  check(JSON.stringify((await p.evaluate(() => window.__rufe)).find((r) => r[0] === "rpg_admin_feedback_read")) === '["rpg_admin_feedback_read",{"p_id":"m1","p_gelesen":true}]', "„Erledigt“ ruft rpg_admin_feedback_read");
  check(/Nichts Offenes/.test(await p.textContent(".liste")), "Nur offene: Liste leer");
  await p.click("#offen"); check(/Wieder offen/.test(await p.textContent(".liste")), "Alle zeigen: erledigte Meldung mit „Wieder offen“");
  await p.click('[data-r="feedback"]'); const f = await p.evaluate(() => [...document.querySelectorAll(".karte")].map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  check(f.length === 2 && /Cara Bug/.test(f[0]) && /Bank geht nicht auf/.test(f[0]) && /Dirk Feedback/.test(f[1]), "Feedback & Bugs: " + f.map((x) => x.slice(0, 40)).join(" | "));
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "wache-feedback.png" });
  await p.click("#ab"); await p.waitForSelector("#name"); check(/Abgemeldet/.test(await p.textContent("#meldung")), "Abmelden");
  check(!fehlerSeite.length, "Keine Fehler im Browser " + fehlerSeite.join(" | "));
} catch (e) { check(false, "Abbruch: " + (e && e.stack || e)); }
await br.close(); console.log(fehler ? fehler + " Fehler" : "Wache: alles in Ordnung"); process.exit(fehler ? 1 : 0);
