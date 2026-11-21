/*
 * Mythara UI-Baukasten – transparente PNGs aller Bausteine erzeugen.
 * Fotografiert jedes Element mit data-export auf der Katalogseite (index.html?export) ohne Hintergrund
 * in 1×, 2× und 4× und legt sie in UI/png/ ab: <name>.png, <name>@2x.png, <name>@4x.png.
 *
 * Aufruf (im Projektordner):  node UI/werkzeug/export.mjs            alle Bausteine
 *                             node UI/werkzeug/export.mjs slot-aktiv  nur diese(n)
 * Braucht Playwright mit Chromium (im Projekt vorhanden). Ein Webserver ist nicht nötig: das Skript liefert die Dateien selbst aus.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const UI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), WURZEL = path.resolve(UI, ".."), ZIEL = path.join(UI, "png");
const TYP = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml" };
const nur = new Set(process.argv.slice(2));

fs.mkdirSync(ZIEL, { recursive: true });
const browser = await chromium.launch();
let anzahl = 0;
for (const faktor of [1, 2, 4]) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: faktor, reducedMotion: "reduce" });
  await ctx.route("http://baukasten.local/**", (r) => {
    let u = decodeURIComponent(new URL(r.request().url()).pathname); if (u.endsWith("/")) u += "index.html";
    const datei = path.join(WURZEL, u); if (!datei.startsWith(WURZEL) || !fs.existsSync(datei)) return r.fulfill({ status: 404, body: "" });
    r.fulfill({ status: 200, body: fs.readFileSync(datei), headers: { "content-type": TYP[path.extname(datei)] || "application/octet-stream" } });
  });
  const seite = await ctx.newPage(); const fehler = []; seite.on("pageerror", (e) => fehler.push(String(e)));
  await seite.goto("http://baukasten.local/UI/index.html?export"); await seite.evaluate(() => document.fonts.ready); await seite.waitForTimeout(400);
  if (fehler.length) { console.error("Fehler auf der Seite:", fehler); process.exitCode = 1; }
  for (const el of await seite.$$("[data-export]")) {
    const name = await el.getAttribute("data-export"); if (nur.size && !nur.has(name)) continue;
    await el.screenshot({ path: path.join(ZIEL, name + (faktor === 1 ? "" : `@${faktor}x`) + ".png"), omitBackground: true, animations: "disabled" }); anzahl++;
  }
  await ctx.close();
}
await browser.close();
console.log(`${anzahl} Bilder in ${path.relative(process.cwd(), ZIEL) || ZIEL}`);
