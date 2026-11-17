/*
 * Mythara – Startseite und Spiel: Die Startseite (index.html) beschreibt das Spiel und ist für Suchmaschinen gedacht,
 * das Spiel selbst liegt unter spiel.html. Wer schon spielt (Link mit Angaben, App vom Startbildschirm, angemeldet),
 * wird von der Startseite direkt ins Spiel geleitet.
 * Aufruf: node tools/testserver.js   und   node tests/umzug.test.js
 */
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const WURZEL = path.join(__dirname, ".."), BASE = "http://localhost:8765"; let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(); const neu = async () => { const c = await b.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: "block" }); await c.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" })); return { c, p: await c.newPage() }; };
  console.log("Startseite und Spiel");
  { const { c, p } = await neu(); const fehler = [], fehlend = []; p.on("pageerror", (e) => fehler.push(String(e))); p.on("response", (r) => { if (r.status() >= 400) fehlend.push(r.url()); });
    await p.goto(BASE + "/index.html"); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => ({ url: location.pathname, h1: (document.querySelector("h1") || {}).textContent || "", knopf: [...document.querySelectorAll(".kopf a")].map((a) => a.textContent.trim() + "→" + a.getAttribute("href")).pop(), helden: document.querySelectorAll(".held").length, kampagnen: document.querySelectorAll(".kampagne").length, breit: document.documentElement.scrollWidth <= innerWidth, robots: (document.querySelector('meta[name="robots"]') || {}).content || "", canon: document.querySelector('link[rel="canonical"]').href, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent)["@type"]; } catch (e) { return "KAPUTT"; } }) }));
    check(r.url === "/index.html" && /Rollenspiel/.test(r.h1), "Ein neuer Besucher sieht die Startseite mit der Beschreibung des Spiels");
    check(r.knopf === "Einloggen / Registrieren→spiel.html", "Oben rechts führt „Einloggen / Registrieren“ zur Anmeldeseite (spiel.html)");
    check(r.helden === 15 && r.kampagnen === 6 && r.breit, "Alle 15 Helden und 6 Kampagnen werden gezeigt, die Seite passt in Handybreite");
    check(!/noindex/.test(r.robots) && r.canon === "https://mythara-dungeon.de/" && r.ld.join() === "VideoGame,FAQPage", "Für Suchmaschinen: nicht gesperrt, Adresse eindeutig, Angaben zu Spiel und Fragen lesbar");
    check(!fehler.length && !fehlend.length, "keine Skriptfehler, keine fehlenden Dateien" + (fehlend.length ? ": " + fehlend.join(", ") : ""));
    await p.click(".kopf a.knopf"); await p.waitForURL(/spiel\.html/, { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(1500);
    const s = await p.evaluate(() => ({ url: location.pathname, spiel: Boolean(window.MYTHARA), kopf: getComputedStyle(document.querySelector("header.top")).display, robots: (document.querySelector('meta[name="robots"]') || {}).content || "", apple: document.querySelector('link[rel="apple-touch-icon"]').getAttribute("href"), logo: document.querySelector(".my-logo img").getAttribute("src") }));
    check(s.url === "/spiel.html" && s.spiel && s.kopf === "none", "Der Knopf öffnet das Spiel mit der Anmeldeseite, ohne Kopfzeile");
    check(/noindex/.test(s.robots) && /logo-neu/.test(s.logo), "Das Spiel selbst ist für Suchmaschinen ausgenommen und zeigt das neue Logo");
    const man = JSON.parse(fs.readFileSync(path.join(WURZEL, "manifest.webmanifest"), "utf8"));
    check(man.start_url === "./spiel.html" && [s.apple, ...man.icons.map((i) => i.src)].every((x) => /mythara-/.test(x) && fs.existsSync(path.join(WURZEL, x))), "Die App vom Startbildschirm öffnet direkt das Spiel; das Symbol ist hinterlegt");
    await c.close(); }
  { const { c, p } = await neu(); const wege = []; p.on("framenavigated", (f) => { if (f === p.mainFrame()) wege.push(f.url().replace(BASE, "")); });
    await p.goto(BASE + "/index.html?tisch=ABCD-123456&ab=grauwacht"); await p.waitForURL(/spiel\.html/, { timeout: 8000 }).catch(() => {});
    check(wege.includes("/spiel.html?tisch=ABCD-123456&ab=grauwacht"), "Alte Links mit Angaben (Spieltisch, Einladung) landen mit allen Angaben im Spiel: " + wege.join(" → ")); await c.close(); }
  { const { c, p } = await neu(); await p.goto(BASE + "/handy.html"); await p.evaluate(() => localStorage.setItem("mr-rpg-auth", "{}")); await p.goto(BASE + "/index.html"); await p.waitForTimeout(1500);
    check(/\/index\.html$/.test(p.url()) && await p.evaluate(() => Boolean(document.querySelector(".auftakt"))), "Auch wer angemeldet ist, sieht unter der Adresse die Startseite (kein Sprung ins Spiel)"); await c.close(); }
  const sm = fs.readFileSync(path.join(WURZEL, "sitemap.xml"), "utf8"), rb = fs.readFileSync(path.join(WURZEL, "robots.txt"), "utf8");
  check(/<loc>https:\/\/mythara-dungeon\.de\/<\/loc>/.test(sm) && /Sitemap: https:\/\/mythara-dungeon\.de\/sitemap\.xml/.test(rb) && /Allow: \//.test(rb), "Sitemap und robots.txt nennen die Startseite");
  await b.close(); console.log(ok ? "\nUMZUG IN ORDNUNG" : "\nUMZUG: FEHLER"); process.exit(ok ? 0 : 1);
})();
