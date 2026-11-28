/* Riftmere – Weltenwahl auf der Willkommensseite: „Riftmere 1“ gewählt, Spieler online aus der Statusseite des Spielservers; Nachrichten öffnen sich am Brief-Symbol.
   Gerüst aus konto-loeschen-ui.test.mjs (Konto löschen auf der Willkommensseite (Browser): Einstellungen → „Konto löschen …“ → Passwort → falsches Passwort zeigt den Fehler,
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
await ctx.route("https://mythara-echtzeit.onrender.com/", (r) => r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, welten: [{ id: "beta", name: "Riftmere 1", online: 3 }] }) }));
await ctx.addInitScript(() => { if (!localStorage.getItem("test_t0")) { localStorage.setItem("test_t0", "1"); sessionStorage.setItem("fake_sitzung", JSON.stringify("anna")); localStorage.setItem("ez_probe", "5"); localStorage.setItem("ez_zoom", "1.2"); } });
const WEG = []; p.on("framenavigated", (fr) => { if (fr === p.mainFrame()) WEG.push(fr.url().split("/").pop()); });
try {
  await p.goto("http://localhost:8765/echtzeit/willkommen.html"); await p.waitForTimeout(1800);
  const w = await p.evaluate(() => [...document.querySelectorAll("#welten .welt")].map((b) => ({ name: b.querySelector("b").textContent, an: b.getAttribute("aria-checked"), online: b.querySelector(".online").textContent })));
  check(w.length === 1 && w[0].name === "Riftmere 1" && w[0].an === "true", "Eine Welt „Riftmere 1“, vorausgewählt: " + JSON.stringify(w));
  check(w[0] && w[0].online === "3 online", "Spieler online aus der Statusseite: " + (w[0] && w[0].online));
  check(await p.evaluate(() => localStorage.getItem("rift_welt")) === "beta", "Gewählte Welt gemerkt");
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "weltenwahl.png" });
  await p.click("#post"); await p.waitForTimeout(300); check(await p.isVisible("#post-menue") && await p.isVisible("#nachrichten"), "Brief-Symbol öffnet die Nachrichten als Fenster");
  if (process.env.BILD) await p.screenshot({ path: process.env.BILD + "nachrichten.png" });
  await p.click("h1, .start", { force: true }).catch(() => {}); await p.mouse.click(5, 5); await p.waitForTimeout(200); check(!(await p.isVisible("#post-menue")), "Klick daneben schließt es");
} catch (e) { check(false, "Abbruch: " + (e && e.message)); }
check(f.length === 0, "Keine Fehler im Browser" + (f.length ? ": " + f.join(" | ") : ""));
await br.close(); console.log(fehler ? `\n${fehler} Prüfungen fehlgeschlagen` : "\nWeltenwahl: alles in Ordnung"); process.exit(fehler ? 1 : 0);
